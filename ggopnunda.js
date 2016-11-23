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
		"IP" : String
	},
	
	createDB : function() {
		this.db_model = this.db.createDBModel('GGopnunda', this.DBschema);
	},
	
	addPlug : function(plug) {
		this.db.addInstance(this.db_model, plug);
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