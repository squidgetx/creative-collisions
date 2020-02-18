
// value = 0 red
// value = 1 green
// value = 2 blue
let value = 0;
let touched = false;
let prevGameState = '';
let gameState = 'WAITING'

// Open and connect input socket
// Process gamestate messages right away
let socket = io('/input');
socket.on('connect', (s) => {
  console.log('Connected');
  socket.on('gameState', (data) => {
    gameState = data;
    console.log(data)
  })
});

function setup() {
	createCanvas(windowWidth, windowHeight);
}

function draw() {
  // when the game state has changed, update the UI
  // this also means that if you join mid-game you automatically show the correct UI
  if (prevGameState !== gameState) {
    console.log('gamestate changed', prevGameState, gameState)
    if (gameState === 'WAITING') {
      drawWaiting()
    } else if (gameState === 'INGAME') {
      resetGame()
      // Send value when the game begins so that people
      // who never swap are counted
      socket.emit('inputValue', value);
    } else if (gameState === 'FINISHED') {
      showColorValue()
    }
  }
  prevGameState = gameState;
}

function drawWaiting() {
    push()
    background(255)
    textSize(80)
    textAlign(CENTER)
	  text("waiting for game to begin...",windowWidth/2,windowHeight/2)
    pop()
}

function drawButtons() {
	background(255)
	textSize(80)
	fill(0)
	rect(0,0,width,height/2)
	text("🔎",(windowWidth/2)-40,windowHeight/4)
	text("🔄",(windowWidth/2)-40,3*windowHeight/4)
}

function drawFeedBackButtons() {
	background(0)
	text("🔎",(windowWidth/2)-40,windowHeight/4)
	text("🔄",(windowWidth/2)-40,3*windowHeight/4)
}

// only accept input if you are in the game
function touchStarted() {
  console.log(gameState)
  if (gameState === 'INGAME') {
		if (mouseY > windowHeight/2){
			drawFeedBackButtons()
			value += 1;
			if (value > 2){
				value = 0
			}
			socket.emit('inputValue', value);
		} else {
			showColorValue();
		}
  }
	return false;
}

function touchEnded(){
  if (gameState === 'INGAME') {
	  drawButtons()
  }
}

function showColorValue() {
  let color;
	if (value == 0){
		color = "#F7394F"
	} else if (value == 1){
		color = "#427EF5"
	} else {
		color = "#7EF07A"
	}
	background(color);
}

function resetGame() {
  drawButtons();
  value = 0;
}
