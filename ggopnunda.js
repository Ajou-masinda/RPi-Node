/**
 * GGopnunda Module
 */
var GGopnunda = function(db) {
	this.db = db;
	this.db_model = undefined;
}

GGopnunda.prototype = {
	DBschema : {
		"name" : String,
		"locate" : String,
		"type" : Boolean,
		"MAC" : String,
		"IP" : String,
		"status" : Boolean
	},
	
	makeInstance : function(mac, ip) {
		var instance = {
			name : "",
			locate : "",
			type : 0,
			MAC : mac,
			IP : ""
		};
		return instance;
	},
	
	createDB : function() {
		this.db_model = this.db.createDBModel('GGopnunda', this.DBschema);
	},
	
	checkPlugStatus : function(plug) {
		var db = this.db;
		var db_model = this.db_model;
		var query = db_model.find({mac:plug.mac});
		query.exec(function(err, result) {
			if(result.length > 0) {
				console.log('Plug reconnected');
				db.updateInstance(db_model, plug, result);
			}
			else {
				console.log('add plug instance');
				db.addInstance(db_model, plug);
			}
		});
		
		//this.db.addInstance(this.db_model, plug);
	},

	addPlug : function(mac, ip) {
		
	},
	
	removePlug : function(plug) {
		
	},
	
	getPlugList : function(res) {
		var query = this.db_model.find({});
		query.exec(function(err, result) {
			console.log(result);
			res.send(result);
		});
	},
}

module.exports = GGopnunda;