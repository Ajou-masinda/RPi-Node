/**
 * Deudnunda Module
 * @param py_script : python script to execute
 * @param stt : text from android(wear)
 */
var Deudnunda = function(py_script, stt) {
	var PythonShell = require('python-shell');
	this.py_nlp = new PythonShell(py_script, {args : [stt]});
	this.nlp_reslut = undefined;
	this.command = {};
}
 
Deudnunda.prototype = {
	/**
	 * Start Deudnunda module
	 */
	run : function(db, ggopunuda_db, command_db) {
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
			var command = self.makeCommand(key_morpheme, ggopunuda_db);
			console.log(command);
			self.command = command;
			self.reserveCommand(db, ggopunuda_db, command_db);
		});
	},
	
	/**
	 * Python list -> Javascript object
	 */
	splitPythonList : function() {
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
			//if(parse_nlp[i].type == 'NNG') {
			if(parse_nlp[i].type == 'Noun') {
				target.push(parse_nlp[i].morpheme);
			}
			//else if(parse_nlp[i].type.indexOf('VV') >= 0 && verb === "") {
			else if(parse_nlp[i].type.indexOf('Verb') >= 0 && verb === "") {
				verb = parse_nlp[i].morpheme;
			}
		}
		
		return {"noun" : target, "verb" : verb};
	},
	
	/**
	 * Make command for GGopnunda
	 */
	makeCommand : function(key_morpheme, ggopunuda_db) {
		var verb_map = {
			"켜" : "ON", "키" : "ON",
			"꺼" : "OFF", "꺼" : "OFF", "꺼주" : "OFF", "꺼져" : "OFF",
			"낮춰" : "DOWN", "맞춰" : "DOWN", "내려" : "DOWN",
			"올려" : "UP", "높여" : "UP"
		};
		var target = "";
		var motion = "";
		var operation = verb_map[key_morpheme.verb];
		
		if(operation == "ON" || operation == "OFF") {
			motion = "POWER";
		}
		
		if((key_morpheme.noun).length > 1) {
			// morpheme이 여러개라면 DB에 target의 이름이 있는지 확인
			/*var get_plugs_from_db = [];
			ggopunuda_db.plug_db_model.find({}, function(err, result) {
				console.log(result);
				result.forEach(function(plug) {
					console.log(plug);
					get_plugs_from_db.push(plug.name);
				});
				
				(key_morpheme.noun).forEach(function(noun) {
					console.log(get_plugs_from_db.indexOf(noun));
					if(get_plugs_from_db.indexOf(noun) > -1) {
						target = noun;
						return false;
					}
				});
			});*/
			(key_morpheme.noun).forEach(function(noun) {
				if(noun == "볼륨" || noun == "소리") {
					motion = "VOLUME" + operation;
				}
				else if(noun == "채널") {
					motion = "CHANNEL" + operation;
				}
			});
		}
		target = key_morpheme.noun[0];
		
		if(target == 'tv') target = '티비';
		
		if(typeof target == 'undefined' || operation == 'undefined') {
			return {"target" : "error", "operation" : "error", "motion" : "error"};
		}
		else {
			return {"target" : target, "operation" : operation, "motion" : motion};
		}
	},
	
	reserveCommand : function(db, ggopnunda, command_db) {
		var self = this;
		ggopnunda.plug_db_model.find({name : this.command.target}, function(err, result) {
			if(result.length > 0) {
				var cur = new Date();
				console.log(self.command);
				db.addInstance(command_db, 
					{
						command : self.command,
						target_serial : result[0].serial,
						time : cur.getTime()
					});
				
				console.log("New command reserved");
			}
			else {
				console.log("There is no device such name");
			}
		});
	}
}

module.exports = Deudnunda;