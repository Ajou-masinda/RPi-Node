var express = require('express');
var path = require('path');

var Deudnunda = require("./deudnunda.js");
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use('/', routes);
app.post('/', function(req, res) {
	var chunk = "";
	var deudnunda = undefined;
	
	req.on('data', function(data) {
		console.log('JSON from Malhanda : ' + data);
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		deudnunda = new Deudnunda('./test.py', chunk.message);
		deudnunda.run();
	});
	
	req.on('error', (e) => {
		console.log('problem with request: ' + e.message);
	});
});
app.listen(3030, function() {
	console.log('--OPERATE MALHANDA--');
});
module.exports = app;
