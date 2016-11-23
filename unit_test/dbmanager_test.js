var assert = require("assert");
var DBManager = require("../dbManager.js");

describe('DB Manager module test : ', function() {
	var db_manager = new DBManager();
	var model = undefined;
	
	it('createSchema method', function(done) {
		var ex = {"test" : String};
		model = db_manager.createDBModel("test", ex);
		
		assert.equal(model.collection.name, "tests");
		assert.equal(typeof model.schema, "object");
		done();
	});
	
	it('addInstance method', function(done) {
		var ex = {test : "ex"};
		var test_model = new model(ex);
		
		test_model.save(function(err){
			model.find({test : "ex"}, function(err, instances) {
				assert.ok(instances.length > 0);
				
				model.remove(ex, function() {
					done();
				});
			});
		});
	});
});