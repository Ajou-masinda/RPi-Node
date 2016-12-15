var assert = require("assert");
var Deudnunda = require("../deudnunda.js");

var test = function(iter, test_set) {
	this.test_set = test_set;
	this.iter_cnt = parseInt(iter) - 1;
	
	this.run = function() {
		var self = this;
		describe('TEST' + iter, function() {
			it('CASE : ' + self.test_set, function(done) {
				var deudnunda = new Deudnunda('/python_sources/malhandaNLP.py', self.test_set);
				
				deudnunda.py_nlp.on('message', function(message) {
					deudnunda.nlp_reslut = message;
				});

				deudnunda.py_nlp.end(function (err) {
					if (err) throw err;
					console.log('KoNLPy result : ' + deudnunda.nlp_reslut);
					
					describe('Method test :: ', function() {
						test_splitPythonList(deudnunda);
						test_getKeyMorpheme(deudnunda);
						test_makeCommand(deudnunda);
					});
					
					done();
				});
			}).timeout(5000);
		});
	};
	
	var test_splitPythonList = function(deudnunda) {
		it('splitPythonList() method', function() {
			/*
			// Mecab result
			var expect = [
			[ {"morpheme" : "티비","type" : "NNG"}, {"morpheme" : "켜","type" : "VV"},{"morpheme" : "줘","type" : "EC+VV+EC"} ],
			
			[ {"morpheme" : "전등","type" : "NNG"}, {"morpheme" : "꺼주","type" : "VV"},{"morpheme" : "지","type" : "EC"},
			 {"morpheme" : "않","type" : "VX"}, {"morpheme" : "겠","type" : "EP"},{"morpheme" : "니","type" : "EC"} ],
			 
			[ {"morpheme" : "에어컨","type" : "NNG"}, {"morpheme" : "온도","type" : "NNG"},{"morpheme" : "낮춰","type" : "VV+EC"},
			 {"morpheme" : "줘","type" : "VX+EC"} ]
			];
			*/

			// Twitter result
			var expect = [
  			[ {"morpheme" : "티비","type" : "Noun"}, {"morpheme" : "켜","type" : "Verb"},{"morpheme" : "줘","type" : "Eomi"} ],
  			
  			[ {"morpheme":"전등","type":"Noun"},{"morpheme":"꺼","type":"Verb"},{"morpheme":"주","type":"PreEomi"},{"morpheme":"지","type":"Eomi"},{"morpheme":"않겠","type":"Verb"},{"morpheme":"니","type":"Eomi"} ],
  			 
  			[ {"morpheme":"에어컨","type":"Noun"},{"morpheme":"온도","type":"Noun"},{"morpheme":"낮춰","type":"Verb"},{"morpheme":"줘","type":"Eomi"} ]
  			];
			
			var actual = deudnunda.splitPythonList();
			do_assert(actual, expect);
		});
	};
	
	var test_getKeyMorpheme = function(deudnunda) {
		it('getKeyMorpheme() method', function() {
			
			// Mecab result
			/*var expect = [
			{"noun" : ["티비"],"verb" : "켜"},
			{"noun" : ["전등"],"verb" : "꺼주"},
			{"noun" : ["에어컨", "온도"],"verb" : "낮춰"}
			];*/
			
			var expect = [
			{"noun" : ["티비"],"verb" : "켜"},
			{"noun" : ["전등"],"verb" : "꺼"},
			{"noun" : ["에어컨", "온도"],"verb" : "낮춰"}           
			];
			
			var actual = deudnunda.getKeyMorpheme(deudnunda.splitPythonList());
			do_assert(actual, expect);
		});
	};
	
	var test_makeCommand = function(deudnunda) {
		it('makeCommand() method', function() {
			var expect = [
			{"target" : "티비","operation" : "ON","motion":"POWER"},
			{"target" : "전등","operation" : "OFF","motion":"POWER"},
			{"target" : "에어컨","operation" : "DOWN","motion":""}
			];
			
			var key_mor = deudnunda.getKeyMorpheme(deudnunda.splitPythonList());
			var actual = deudnunda.makeCommand(key_mor);
			do_assert(actual, expect);
		});
	};
	
	var do_assert = function(actual, expect) {
		console.log(expect[iter - 1]);
		assert.equal(
				JSON.stringify(expect[iter - 1]), 
				JSON.stringify(actual)
		);
	};
};

var test_set = ["티비 켜줘", "전등 꺼주지 않겠니", "에어컨 온도 낮춰줘"];
for(var i in test_set) {
	var t = new test(parseInt(i) + 1, test_set[i]);
	t.run();
}