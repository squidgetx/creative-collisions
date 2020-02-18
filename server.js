let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function() {
	console.log('Server listening at port: ', port);
});

app.use(express.static('public'));
let io = require('socket.io').listen(server);
let users = {}
let numOutputs = 0
let gameState = 'WAITING'
let activeSocketID

let outputs = io.of('/output');
outputs.on('connection', (socket) => {
  
  numOutputs += 1
	console.log('output client #' + numOutputs + ' connected: ' + socket.id);
  if (numOutputs == 1) {
    console.log('new active socket created')
    activeSocketID = socket.id
  }
  
  // send the connected output the list of users
  outputs.emit('userList', users)
  
  // send the connected socket it's ID (ID = 1 means active, all others will be disabled)
  socket.emit('outputID', numOutputs)

  // when the output signals the game has begun/end tell all the inputs
	socket.on('gameState', (data) => {
		console.log(data);
    gameState = data
		inputs.emit('gameState', data);
	});

  socket.on('disconnect', () => {
    console.log('An output client has disconnected ' + socket.id);
    if (socket.id == activeSocketID) {
      numOutputs = 0;
      console.log('lost main')
    }
  });
	
});

let inputs = io.of('/input');
inputs.on('connection', (socket) => {
	console.log('An input client connected: ' + socket.id);

  // add a user 
  users[socket.id] = {}
  
  // tell the output a new user joined
  outputs.emit('userList', users)
  
  // tell the new input what part of the game we are in
  socket.emit('gameState', gameState)
  
  // when the input tells us what color it chose, send it to the output
  // so the output can tally the color counts
	socket.on('inputValue', (data) => {
		let message = {
			id   : socket.id,
			data : data
		};
		outputs.emit('inputValue', message);
	});

  // remove the input user from server memory when disconnected
  // and update any outputs
	socket.on('disconnect', function() {
		console.log('An input client has disconnected ' + socket.id);
    delete users[socket.id]
    outputs.emit('userList', users)
		outputs.emit('disconnected', socket.id);
	});
  
});
