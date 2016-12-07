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

var commandSchema = {
	"command" : { target : String, operation : String, motion : String },
	"target_serial" : String,
	"time" : Date
};
var command_db_model = db.createDBModel('Command', commandSchema);
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
			var type = chunk.TYPE;
			deudnunda = new Deudnunda('python_sources/malhandaNLP.py', chunk.MSG);
			
			if(type === 'TEXT') {
				var motion = "";
				if(typeof chunk.DEVICE !== 'undefined') {
					motion = chunk.MOTION;
				}
				deudnunda.command = {"target" : chunk.NAME, "operation" : chunk.STATUS, "motion" : motion};
				deudnunda.reserveCommand(db, ggopnunda, command_db_model);
			}
			else {
				deudnunda.run(db, ggopnunda, command_db_model);
			}
		}
		else if(req == 'GET') {
			if(chunk.MSG == 'LIST') {
				ggopnunda.getPlugList(res);
			}
		}
		else if(req == 'SET') {
			if(chunk.ACTION == "MODIFY") {
				ggopnunda.updatePlug(chunk.MSG);
			}
			else if(chunk.ACTION == "DELETE") {
				ggopnunda.removePlug(chunk.MSG)
			}
		}
		/*else if(typeof chunk.test !== 'undefined') {
			sensor_manager.sendNotification({mq:1}, res);
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
			
			command_db_model.find({target_serial : serial}, function(err, result) {
				if(result.length> 0) {
					res.send(result[0].command.operation + '\r');
					console.log('Command to GGopnunda - TARGET : ' + result[0].command.target + " ACTION : " + result[0].command.operation);
					command_db_model.remove({target_serial : serial}, function(err, result) {});
					
					if(result[0].command.operation == 'ON') {
						ggopnunda.updatePlug({serial : serial, status : 1});
					}
					else if(result[0].command.operation == 'OFF') {
						ggopnunda.updatePlug({serial : serial, status : 0});
					}
					
					ggopnunda.plug_db_model.find({serial : serial}, function(e, r) {
						if(r[0].type > 0) {
							var vendor = "";
							var device = "";
							
							if(r[0].vendor == 1) {
								vendor = "LG";
							}
							else if(r[0].vendor == 2){
								vendor = "SAMSUNG";
							}
							
							if(r[0].type == 1) {
								device = "AIR";
							}
							else if(r[0].type == 2) {
								device = "TV";
							}
							
							var com = result[0].command.motion;
							
							console.log('IR : ' + 'python ./python_sources/ir.py --device ' + vendor + '_' + device + ' --command ' + com);
							
							var exec = require('child_process').exec;
							var child = exec('python ./python_sources/ir.py --device ' + vendor + '_' + device + ' --command ' + com,
								function (error, stdout, stderr) {
									console.log('stdout: ' + stdout);
								}
							);
						}
					});
				}
			});
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
