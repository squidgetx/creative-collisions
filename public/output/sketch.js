// Open and connect output socket
let socket = io('/output');
let displayTextString = '';
let users = {};
let redCount = greenCount = blueCount = 0;
let song;
let id = 0;

function preload() {
  song = loadSound('/output/distrust.mp3')
}

// Listen for confirmation of connection
socket.on('connect', function() {
	console.log('Connected');
  socket.on('userList', (message) => {
    users = message
    if (gameState == 'WAITING') {
      displayTextString = `${Object.keys(users).length} connected`
    }
  })
  socket.on('outputID', (message) => {
    id = message
  })
});

let MAXTIME = 30

let sec = MAXTIME;
// WAITING, INGAME, FINISHED
let gameState = 'WAITING';
let startButton;
let displayText;

function setup() {
	displayText = createP('');
	displayText.class('content');
  startButton = createButton('start game');
	startButton.mousePressed(buttonPressed);

	socket.on('inputValue', (message) => {
		let id = message.id;
		let data = message.data;

    users[id] = {
      value : data
    };
		// value = 0 red
		// value = 1 green
		// value = 2 blue

		redCount = 0
		greenCount = 0
		blueCount = 0

		for (id in users) {
			if (users[id].value == 0) {
				// count += 1;
				redCount += 1
			} else if (users[id].value == 1){
				greenCount += 1
			} else if (users[id].value == 2){
				blueCount += 1
			}
		}
	});
}

function draw() {
  displayText.html(displayTextString);
  if (gameState === 'INGAME' || id != 1) {
    startButton.attribute('disabled', true)
  } else {
    startButton.removeAttribute('disabled')
  }
  if (id != 1) {
    displayTextString = 'game already in progress'
  }
}

function buttonPressed() {
  userStartAudio()
  if (gameState === 'INGAME') {
    // do nothing
    console.log('game already started')
    return;
  } else if (gameState === 'WAITING') {
    // play the sound!
    song.play();

    gameState = 'INGAME';
    socket.emit('gameState', gameState)
    document.body.style.backgroundColor = 'black'
    displayText.style('color', 'white')
  	displayTextString = "Red, green or blue? It's up to you." 

    let timer = setInterval(() => {
      sec--;
      if (sec < 0) {
        clearInterval(timer);
        sec = MAXTIME;
        gameState = 'FINISHED'
        socket.emit('gameState', gameState)
				displayTextString = `Red: ${redCount}, Green: ${greenCount}, Blue: ${blueCount}`
				startButton.html('continue')
        console.log("stop")
        song.stop();
      }
      console.log(sec);
    }, 1000);
  } else { // FINISHED
    document.body.style.backgroundColor = 'white'
    displayText.style('color', 'black')

    startButton.html('start game')
    gameState = 'WAITING'
    socket.emit('gameState', gameState)
    displayTextString = `${Object.keys(users).length} connected`
  }
}
