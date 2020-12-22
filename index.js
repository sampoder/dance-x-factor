var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var Filter = require('bad-words'), filter = new Filter();

app.use(express.static('public'))

app.get('/trigger', function(req, res) {
  io.emit('start', "hi");
  res.sendFile(__dirname + '/trigger.html');
});


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/live.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
  socket.on('start', function(msg) {
    io.emit('start', msg);
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});