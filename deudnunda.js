/**
 * Deudnunda Module
 * @param py_script : python script to execute
 * @param stt : text from android(wear)
 */
var Deudnunda = function(py_script, stt) {
	var PythonShell = require('python-shell');
	this.py_nlp = new PythonShell(py_script, {args : [stt]});
	this.nlp_reslut = undefined;
}
 
Deudnunda.prototype = {
	/**
	 * Start Deudnunda module
	 */
	run : function() {
		var self = this;
		
		this.py_nlp.on('message', function(message) {
			console.log('--KoNLPy start--');
			console.log('KoNLPy result : ' + message);
			self.nlp_reslut = message;
		});

		this.py_nlp.end(function (err) {
			if (err) throw err;
			
			self.parse_nlp = self.splitPythonList();
			console.log(self.parse_nlp);
			console.log('--NLP finished--');
			
			var key_morpheme = self.getKeyMorpheme(self.parse_nlp);
			var command = makeCommand(key_morpheme);
		});
	},
		
	/**
	 * Python list -> Javascript object
	 */
	//splitPythonList : function(python_list_str) {
	splitPythonList : function() {
		//var objs = python_list_str.split('), ');
		var objs = (this.nlp_reslut).split('), ');
		var result = [];
		
		for(var i in objs) {
			obj = objs[i].replace(/[\[{()}\]]/g, "").split(',');
			result[i] = { 'morpheme' : obj[0].trim(), 'type' : obj[1].trim() };
		}
		
		return result;
	},
	
	/**
	 * Get target and verb
	 */
	getKeyMorpheme : function(parse_nlp) {
		var target = [];
		var verb = "";
		
		for(var i in parse_nlp) {
			if(parse_nlp[i].type == 'NNG') {
				target.push(parse_nlp[i].morpheme);
			}
			else if(parse_nlp[i].type.indexOf('VV') >= 0 && verb === "") {
				verb = parse_nlp[i].morpheme;
			}
		}
		
		return {"noun" : target, "verb" : verb};
	},
	
	/**
	 * Make command for GGopnunda
	 */
	makeCommand : function(key_morpheme) {
		var verb_map = {
			"켜" : "ON", "키" : "ON",
			"꺼" : "OFF", "꺼" : "OFF", "꺼주" : "OFF",
			"낮춰" : "DOWN",
			"올려" : "UP"
		};
		var target = "";
		var operation = verb_map[key_morpheme.verb];
		
		// if(key_morpheme.target.length > 1)
		// morpheme이 여러개라면 DB에 target의 이름이 있는지 확인
		// var get_plugs_from_db = [];
		// for(var i in key_morpheme.target) {
		// 		if( in_array(get_plugs_from_db, key_morpheme.target[i]) )
		// 			target = key_morpheme.target[i];
		// else
		target = key_morpheme.noun[0];
		
		return {"target" : target, "operation" : operation};
	}
}

module.exports = Deudnunda;