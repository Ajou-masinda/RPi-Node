var express = require('express');
var path = require('path');

var DBManager = require("./dbManager.js");

var Deudnunda = require("./deudnunda.js");
var GGopnunda = require("./ggopnunda.js");

var routes = require('./routes/index');
var users = require('./routes/users');

var SensorManager = require("./sensorManager.js");
var sensor_manager = new SensorManager();

var app = express();
var deudnunda = undefined;
var cmd = {};

var db = new DBManager();
var ggopnunda = new GGopnunda(db);

ggopnunda.createDB();

app.use('/', routes);
app.post('/malhanda', function(req, res) {
	var chunk = "";
	//var deudnunda = undefined;
	
	req.on('data', function(data) {
		console.log('JSON from Malhanda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		if(typeof chunk.message !== 'undefined') {
			deudnunda = new Deudnunda('python_sources/malhandaNLP.py', chunk.message);
			deudnunda.run();
		}
		else if(typeof chunk.plug !== 'undefined') {
			if(chunk.plug == 'GET') {
				ggopnunda.getPlugList(res);
			}
		}
		else if(typeof chunk.test !== 'undefined') {
			sensor_manager.sendNotification({mq:1}, res);
		}
	});
	
	req.on('error', (e) => {
		console.log('problem with request: ' + e.message);
	});
});

app.post('/ggopnunda', function(req, res) {
	var chunk = "";
	
	req.on('data', function(data) {
		console.log('JSON from GGopnunda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		var req = chunk.REQ;
		
		if(typeof deudnunda != 'undefined') {
			if(req == 'GET_COMMAND') {
				if(deudnunda.command.operation == 'ON' || deudnunda.command.operation == 'OFF') {
					res.send(deudnunda.command.operation + '\r');
					console.log('Command to GGopnunda - TARGET : ' + deudnunda.command.target + " ACTION : " + deudnunda.command.operation);
				}
				
				deudnunda.command = {};
			}
			else if(req == 'FIND_AP') {
				var new_plug = ggopnunda.makeInstance(chunk.mac);
				ggopnunda.addPlug(new_plug);
				
				//res.send("" + '\r'); AP 정보 전송
			}
			else {
				res.send('\r');			
			}
		}
	});
	
	req.on('error', (e) => {
		console.log('problem with request: ' + e.message);
	});
});

app.listen(3030, function() {
	console.log('--OPERATE MALHANDA--');
});

sensor_manager.run();

module.exports = app;
