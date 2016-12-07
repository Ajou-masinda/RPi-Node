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
			plug.detect = 1;
			
			if(result.length > 0) {
				console.log('Plug reconnected');
				
				plug.name = result[0].name;
				plug.locate = result[0].locate;
				plug.type = result[0].type;
				
				//db.updateInstance(plug_db_model, plug, result);
				
				plug_db_model.findOne(result[0], function(err, result) {
					result.name = plug.name;
					result.locate = plug.locate;
					result.type = plug.type;
					
					result.save(function(err) {
						if(err) { console.log('Mongoose : updateInstance Error'); }
					});
				});
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
		
		var ins = {serial : serial, lastreq : cur.getTime()};
		req_db_model.find({serial : serial}, function(err, result) {
			if(result.length > 0) {
				//db.updateInstance(req_db_model, ins, result);
				
				req_db_model.findOne(result[0], function(err, result) {
					result.serial = ins.serial;
					result.lastreq = ins.lastreq;
					
					result.save(function(err) {
						if(err) { console.log('Mongoose : updateInstance Error'); }
					});
				});
			}
			else if(result.length == 0) {
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
				
				//plug_db_model.find({serial : req.serial}, function(e, r) {
					//if(r.length > 0) {
						if((cur.getTime() - lastreq) > 10000) {
							plug_db_model.find({serial : req.serial, detect : 1}, function(plug_err, plug_result) {
								if(plug_result.length > 0) {
									console.log(req.serial + ' plug is undetected');
									//db.updateInstance(plug_db_model, {detect : 0}, plug_result);
									
									plug_db_model.findOne(plug_result[0], function(err, result) {
										result.detect = 0;
										
										result.save(function(err) {
											if(err) { console.log('Mongoose : updateInstance Error'); }
										});
									});
								}
							});
						}
						else {
							plug_db_model.find({serial : req.serial, detect : 0}, function(plug_err, plug_result) {
								if(plug_result.length > 0) {
									console.log(req.serial + ' plug is detected');
									//db.updateInstance(plug_db_model, {detect : 1}, plug_result);
									
									plug_db_model.findOne(plug_result[0], function(err, result) {
										result.detect = 1;
										
										result.save(function(err) {
											if(err) { console.log('Mongoose : updateInstance Error'); }
										});
									});
								}
							});
						}
					//}
				//});
			});
		});
	},

	updatePlug : function(new_data) {
		var db = this.db;
		var plug_db_model = this.plug_db_model;
		var query = plug_db_model.find({serial:new_data.serial}, function(err, result) {
			if(result.length > 0) {
				//new_data.register = 1;
				console.log('Plug is updated to Deudnunda');
				//db.updateInstance(plug_db_model, new_data, result);
				plug_db_model.findOne(result[0], function(err, result) {
					if(typeof new_data.status !== 'undefined') {
						result.status = new_data.status;
					}
					else {
						result.name = new_data.name;
						result.locate = new_data.locate;
						result.type = new_data.type;
						result.vendor = new_data.vendor;
						result.register = 1;
						result.status = 0;
					}
					
					result.save(function(err) {
						if(err) { console.log('Mongoose : updateInstance Error'); }
					});
				});
			}
		});
	},
	
	removePlug : function(plug) {
		var db = this.db;
		var plug_db_model = this.plug_db_model;
		var query = plug_db_model.find({serial:plug.serial}, function(err, result) {
			if(result.length > 0) {
				console.log('Plug is deleted from GGopnunda')
				//db.updateInstance(plug_db_model, new_data, result);
				plug_db_model.findOne(result[0], function(err, result) {
					result.name = "";
					result.locate = "";
					result.type = -1;
					result.vendor = -1;
					result.status = -1;
					result.register = -1;
					
					result.save(function(err) {
						if(err) { console.log('Mongoose : updateInstance Error'); }
					});
				});
			}
		});
	},
	
	getPlugList : function(res) {
		var query = this.plug_db_model.find({detect : 1});
		query.exec(function(err, result) {
			res.send(result);
		});
	}
}

module.exports = GGopnunda;