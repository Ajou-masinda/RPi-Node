var express = require('express');
var path = require('path');

var Deudnunda = require("./deudnunda.js");
var DBManager = require("./dbManager.js");
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var deudnunda = undefined;
var cmd = {};

var db = new DBManager();
var model = db.createDBModel("test", {"test" : String});

app.use('/', routes);
app.post('/malhanda', function(req, res) {
	var chunk = "";
	//var deudnunda = undefined;
	
	req.on('data', function(data) {
		console.log('JSON from Malhanda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		deudnunda = new Deudnunda('python_sources/malhandaNLP.py', chunk.message);
		deudnunda.run();
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

var SensorManager = require("./sensorManager.js");
var sensor_manager = new SensorManager();
sensor_manager.run();

module.exports = app;
