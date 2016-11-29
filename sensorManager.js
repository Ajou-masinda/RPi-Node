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
				console.log('WARNING!');
				//self.sendNotification(mq);
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
	sendNotification : function(mq, res) {
		// Android Notification Code
		var FCM = require('fcm-node');

		var serverKey = 'AIzaSyDimfiWLyrCV2GqbbftaGkl6e_tvLo2QOw'; // 발급된 server key 등록
		var fcm = new FCM(serverKey);

		var message = { 
		    to: 'fA0YqQN_fck:APA91bFgiNeeqc7bgK6RPeIU-x8L0f9U-l-W0ufr1TENXVUuCJMQHbVjJL0ZXgwSub5AaJJ4uF2cJigyEFHDGbamRT2YXEGYyTlDxudQkGAy9sKR_i6jnTBIEwsD-QIu_tJbOjN0XDKG',
		    notification: {
		        title: 'DEUDNUNDA WARNING', 
		        body: 'GAS VALUE' 
		    },
		    
		    data: mq // 따로 데이터 보낼게 있으면 이거로
		};

		fcm.send(message, function(err, response){
			console.log(message);
		    if (err) {
		        console.log("FCM error");
				res.send('err\r');
		    } else {
		        console.log("FCM is successfully sent with response: ", response);
				res.send('success\r');
		    }
		});
	}
}

module.exports = SensorManager;