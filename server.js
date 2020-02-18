let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function() {
	console.log('Server listening at port: ', port);
});

app.use(express.static('public'));
let io = require('socket.io').listen(server);
let users = {}
let gameState = 'WAITING'

let outputs = io.of('/output');
outputs.on('connection', (socket) => {
	console.log('An output client connected: ' + socket.id);
  outputs.emit('userList', users)

	socket.on('gameState', (data) => {
		console.log(data);
    gameState = data
		inputs.emit('gameState', data);
	});

	socket.on('disconnect', () => {
		console.log('An output client has disconnected ' + socket.id);
	});
});

let inputs = io.of('/input');
inputs.on('connection', (socket) => {
	console.log('An input client connected: ' + socket.id);

  // add a user 
  users[socket.id] = {}
  outputs.emit('userList', users)
  socket.emit('gameState', gameState)
	socket.on('inputValue', (data) => {
		let message = {
			id   : socket.id,
			data : data
		};
		outputs.emit('inputValue', message);
	});

	socket.on('disconnect', function() {
		console.log('An input client has disconnected ' + socket.id);
    delete users[socket.id]
    outputs.emit('userList', users)
		outputs.emit('disconnected', socket.id);
	});
});
