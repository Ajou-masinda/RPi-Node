var assert = require("assert");
var DBManager = require("../dbManager.js");

describe('DB Manager module test : ', function() {
	var db_manager = new DBManager();
	
	it('createSchema method', function(done) {
		var ex = {"test" : String};
		var result = db_manager.createDBModel("test", ex);
		
		assert.equal(result.collection.name, "tests");
		assert.equal(typeof result.schema, "object");
		done();
	});
});