/**
 * SensorManager Module
 */
var SensorManager = function() {
	var spawn = require('child_process').spawn;
	var option = ['python_sources/mq.py'];
	
	this.py = spawn('python', option);
}
 
SensorManager.prototype = {
	/**
	 * Start SensorManager module
	 */
	run : function() {
		var self = this;
		
		this.py.stdout.on('data', (data) => {
			var buf = new Buffer(data);
			var mq = JSON.parse(buf.toString());
			
			if(self.isWarning(mq)) {
				self.sendNotification();
			}
		});
		
		this.py.stdout.on('close', (code) => {
			if (code !== 0) {
				console.log('process exited with code ' + code);
			}
		});
	},

	/**
	 * Check Gas values are too high
	 */
	isWarning : function(mq) {
		if(mq.mq2 >= 500 || mq.mq135 >= 800) {
			return true;
		}
		else {
			return false;
		}
	},
	
	/**
	 * Send warning notificaiton to Android
	 */
	sendNotification : function() {
		// Android Notification Code
	}
}

module.exports = SensorManager;