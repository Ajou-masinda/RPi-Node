var express = require('express');
var path = require('path');
var PythonShell = require('python-shell');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use('/', routes);
app.post('/', function(req, res) {
	var chunk = "";
	req.on('data', function(data) {
		console.log('JSON from Malhanda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		var deudnunda = new PythonShell('test.py',{args : [chunk.message]});
		
		deudnunda.on('message', function(message) {
			console.log('KoNLPy : ' + message);
		});
		deudnunda.end(function (err) {
			if (err) throw err;
			console.log('--NLP finished--');
		});
	});
});
app.listen(3030, function() {
	console.log('--OPERATE MALHANDA--');
});
module.exports = app;
