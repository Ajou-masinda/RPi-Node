var assert = require("assert");

describe('Deudnunda Module Test', function() {
	var Deudnunda = require("../deudnunda.js");
	var deudnunda;
	
	describe('Deudnunda', function() {
		it('Run deudnunda module', function() {
			deudnunda = new Deudnunda('../test.py', '티비 켜줘');
			deudnunda.run();
		});
	});
	
	describe('splitPythonList method()', function() {
		it('python list -> javascript object', function () {
			var expect = [
				{'noun' : '티비','type' : 'NNG'},
				{'noun' : '켜','type' : 'VV'},
				{'noun' : '줘','type' : 'EC+VV+EC'}
			];
			var actual = deudnunda.splitPythonList('[(티비, NNG), (켜, VV), (줘, EC+VV+EC)]');
			
			console.log('expect : ');
			console.log(expect);
			console.log('actual : ');
			console.log(actual);
			
			assert.equal(
					JSON.stringify(expect), 
					JSON.stringify(actual)
			);
		});
	});
});