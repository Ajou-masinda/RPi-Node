var express = require('express');
var path = require('path');
var PythonShell = require('python-shell');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.post('/', function(req, res) {
	var chunk = "";
	req.on('data', function(data) {
		chunk = JSON.parse(data);
	});

	req.on('end', function() {
		console.log(JSON.stringify(chunk));
		var py_test = new PythonShell('test2.py',{args : [chunk.message]});
		py_test.on('message', function(message) {
			console.log(message);
		});
		py_test.end(function (err) {
			if (err) throw err;
			console.log('finished');
		});
	});
});
app.listen(3030, function() {
	console.log('server start');
});
module.exports = app;
