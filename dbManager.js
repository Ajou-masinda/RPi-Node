var mongoose = require('mongoose');

/**
 * DBManager Module
 */
var DBManager = function() {
	mongoose.connect('mongodb://localhost:27017');
	this.db = mongoose.connection;
	this.db.on('error', console.error.bind(console, 'connection error:'));
	this.db.once('open', function callback () {
		console.log("mongo db connection OK.");
	});
}

DBManager.prototype = {
	createDBModel : function(name, schema) {
		var Schema = mongoose.Schema(schema);
		var Model = mongoose.model(name, Schema);
		return Model;
	},
	
	addInstance : function(Model, instance) {
		Model.create(instance, function(err, result) {
			if(err) console.log('Mongoose : addInstance Error');
		});
	},

	updateInstance : function(Model, instance, target) {
		Model.findOne(target[0], function(err, result) {
			result.serial = instance.serial;
			result.lastreq = instance.lastreq;
			
			result.save(function(err) {
				if(err) { console.log('Mongoose : updateInstance Error'); }
			});
		});
	}
}

module.exports = DBManager;