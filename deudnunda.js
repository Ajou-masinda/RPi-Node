/**
 * Deudnunda Module
 * @param py_script : python script to execute
 * @param stt : text from android(wear)
 */
var Deudnunda = function(py_script, stt) {
	var PythonShell = require('python-shell');
	this.py_nlp = new PythonShell(py_script, {args : [stt]});
	this.message = "";
}
 
Deudnunda.prototype = {
	/**
	 * Start Deudnunda module
	 */
	run : function() {
		var self = this;
		
		this.py_nlp.on('message', function(message) {
			console.log('KoNLPy result : ' + message);
			console.log(self.splitPythonList(message));
		});

		this.py_nlp.end(function (err) {
			if (err) throw err;
			console.log('--NLP finished--');
		});
	},
		
	/**
	 * Python list -> Javascript object
	 */
	splitPythonList : function(python_list_str) {
		var objs = python_list_str.split('), ');
		var result = [];
		
		for(var i in objs) {
			obj = objs[i].replace(/[\[{()}\]]/g, "").split(',');
			result[i] = { 'noun' : obj[0].trim(), 'type' : obj[1].trim() };
		}
		
		return result;
	}
}

module.exports = Deudnunda;