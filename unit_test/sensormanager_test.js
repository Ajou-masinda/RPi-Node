var assert = require("assert");
var SensorManager = require("../sensorManager.js");

describe('Sensor Manager module test : ', function() {
	var sensor_manager = new SensorManager();
	
	it('Start python script', function(done) {
		var sensor_manager = new SensorManager(test = true);
		
		sensor_manager.py.stdout.on('data', (data) => {
			var buf = new Buffer(data);
			var mq = JSON.parse(buf.toString());
		});
		
		sensor_manager.py.stdout.on('close', (code) => {
			console.log(code);
			done();
		});
	});
	
	it('isWarning method', function(done) {
		var ex1 = {'mq2' : 300, 'mq135' : 400},
			ex2 = {'mq2' : 600, 'mq135' : 400},
			ex3 = {'mq2' : 400, 'mq135' : 900},
			ex4 = {'mq2' : 1000, 'mq135' : 1000};
		
		assert.equal(sensor_manager.isWarning(ex1), false);
		assert.equal(sensor_manager.isWarning(ex2), true);
		assert.equal(sensor_manager.isWarning(ex3), true);
		assert.equal(sensor_manager.isWarning(ex4), true);
		done();
	});
	
	
});