/**
 * GGopnunda Module
 */
var GGopnunda = function(db) {
	this.db = db;
	this.plug_db_model = undefined;
	this.req_db_model = undefined;
}

GGopnunda.prototype = {
	plugSchema : {
		"name" : String,
		"locate" : String,
		"type" : Number, // IR인지 아닌지
		"vendor" : Number, // 제조사
		"MAC" : String,
		"serial": String,
		"IP" : String,
		"status" : Number, // 플러그 ON/OFF 됐는지
		"register" : Number, // 등록됐는지 안됐는지
		"detect" : Number // 현재 감지되는지 안되는지
	},
	
	reqSchema : {
		"serial" : String,
		"lastreq" : Date
	},
	
	commandSchema : {
		"command" : String,
		"target" : String,
		"time" : Date
	},
	
	makeInstance : function(mac, ip, serial) {
		var instance = {
			name : "",
			locate : "",
			type : -1,
			vendor : -1,
			MAC : mac,
			serial : serial,
			IP : ip,
			status : -1,
			register : -1,
			detect : -1
		};
		return instance;
	},
	
	createDB : function() {
		this.plug_db_model = this.db.createDBModel('GGopnunda', this.plugSchema);
		this.req_db_model = this.db.createDBModel('Req', this.reqSchema);
	},
	
	registerPlug : function(plug) {
		var db = this.db;
		var plug_db_model = this.plug_db_model;
		var query = plug_db_model.find({serial:plug.serial});
		query.exec(function(err, result) {
			plug.detect = true;
			
			if(result.length > 0) {
				console.log('Plug reconnected');
				
				plug.name = result[0].name;
				plug.locate = result[0].locate;
				plug.type = result[0].type;
				
				db.updateInstance(plug_db_model, plug, result);
			}
			else {
				console.log('add plug instance');
				db.addInstance(plug_db_model, plug);
			}
		});
	},
	
	refreshPlug : function(serial) {
		var db = this.db;
		var req_db_model = this.req_db_model;
		var cur = new Date();
		
		var query = req_db_model.find({serial : serial}, function(err, result) {
			console.log('refresh : ' + serial);
			var ins = {serial : serial, lastreq : cur.getTime()};
			
			if(result.length > 0) {
				db.updateInstance(req_db_model, ins, result);
			}
			else {
				db.addInstance(req_db_model, ins);
			}
		});
	},
	
	detectPlug : function() {
		var db = this.db;
		var req_db_model = this.req_db_model;
		var plug_db_model = this.plug_db_model;
		var query = req_db_model.find({});
		
		query.exec(function(err, result) {
			result.forEach(function(req) {
				var lastreq = req.lastreq;
				var cur = new Date();
				
				if((cur.getTime() - lastreq) > 10000) {
					var target = plug_db_model.find({serial : req.serial, detect : 1}, function(err, result) {
						if(result.length > 0) {
							console.log(req.serial + ' plug is undetected');
							db.updateInstance(plug_db_model, {detect : 0}, result);
						}
					});
				}
				else {
					var target = plug_db_model.find({serial : req.serial, detect : 0}, function(err, result) {
						if(result.length > 0) {
							console.log(req.serial + ' plug is detected');
							db.updateInstance(plug_db_model, {detect : 1}, result);
						}
					});
				}
			});
		});
	},

	addPlug : function(new_data, serial) {
		var db = this.db;
		var plug_db_model = this.plug_db_model;
		var query = plug_db_model.find({serial:plug.serial});
		query.exec(function(err, result) {
			console.log('Plug is added to Deudnunda');
			
			result[0].name = new_data.name;
			result[0].locate = new_data.locate;
			result[0].type = new_data.type;
			
			db.updateInstance(plug_db_model, result[0], result);
		});
	},
	
	removePlug : function(plug) {
		var db = this.db;
		var plug_db_model = this.plug_db_model;
		var query = plug_db_model.find({serial:plug.serial})
				.remove(function() {
					console.log('Plug is deleted from GGopnunda')
				});
	},
	
	getPlugList : function(res) {
		var query = this.plug_db_model.find({});
		//var query = this.plug_db_model.find({detect : true});
		query.exec(function(err, result) {
			res.send(result);
		});
	}
}

module.exports = GGopnunda;