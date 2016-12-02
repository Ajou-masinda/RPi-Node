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
	
	req.on('data', function(data) {
		console.log('JSON from Malhanda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		var req = chunk.REQ;
		
		if(req == 'COMMAND') {
			deudnunda = new Deudnunda('python_sources/malhandaNLP.py', chunk.MSG);
			deudnunda.run();
		}
		else if(req == 'GET') {
			if(chunk.MSG == 'list') {
				ggopnunda.getPlugList(res);
			}
		}
		else if(req == 'SET') {
			
		}
		/*else if(typeof chunk.test !== 'undefined') {
			sensor_manager.sendNotification({mq:1}, res);
		}*/
		/*else if(typeof chunk.AIRCON !== 'undefined') {
			var exec = require('child_process').exec;
			var child = exec('python ./python_sources/ir.py --device LG_AIR --command OFF',
				function (error, stdout, stderr) {
					console.log('stdout: ' + stdout);
				}
			);
		}*/
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
		
		if(req == 'GET_COMMAND') {
			var serial = chunk.SERIAL;
			
			ggopnunda.refreshPlug(serial);
			
			if(0) { // 요청 결과 만약 해당 name을 가진 serial에 대해 command가 존재한다면
				// 아래 코드 실행
				if(deudnunda.command.operation == 'ON' || deudnunda.command.operation == 'OFF') {
					res.send(deudnunda.command.operation + '\r');
					console.log('Command to GGopnunda - TARGET : ' + deudnunda.command.target + " ACTION : " + deudnunda.command.operation);
				}
			}
		}
		else if(req == 'REGISTER') {
			var new_plug = ggopnunda.makeInstance(chunk.MAC, chunk.IP, chunk.SERIAL);
			ggopnunda.registerPlug(new_plug);
			
			console.log(chunk.MAC);
			console.log(chunk.IP);
			
			res.send("OK" + '\r');
		}
		else {
			res.send('\r');
		}
	});
	
	req.on('error', (e) => {
		console.log('problem with request: ' + e.message);
	});
});

app.listen(3030, function() {
	console.log('--OPERATE MALHANDA--');
});

setInterval(function() {
	ggopnunda.detectPlug();
}, 2000);

sensor_manager.run();

module.exports = app;
