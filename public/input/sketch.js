

// touch then change background color, value = 1
// after touch can't change value anymore / background until timer stops
// value = 0 red
// value = 1 green
// value = 2 blue
let value = 0;
// let r, g, b;
let color;
let touched = false;
let prevGameState = '';
let gameState = 'WAITING'

let timeInSec = 10;

// Open and connect input socket
let socket = io('/input');
socket.on('connect', (s) => {
  console.log('Connected');
  socket.on('gameState', (data) => {
    gameState = data;
    console.log(data)
    // Send value when the game begins so that people
    // who never swap are counted
    if (data === 'INGAME') {
		  socket.emit('inputValue', value);
    }
  })
});

function setup() {
	createCanvas(windowWidth, windowHeight);
	}

function draw() {
  // put redraw logic here otherwise p5 complains
  if (prevGameState !== gameState) {
    console.log('gamestate changed', prevGameState, gameState)
    if (gameState === 'WAITING') {
      drawWaiting()
    } else if (gameState === 'INGAME') {
      resetGame()
    } else if (gameState === 'FINISHED') {
      showColor()
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

function drawButtons(){
	background(255)
	textSize(80)
	fill(0)
	rect(0,0,width,height/2)
	text("🔎",(windowWidth/2)-40,windowHeight/4)
	text("🔄",(windowWidth/2)-40,3*windowHeight/4)
}

function drawFeedBackButtons(){
	background(0)
	text("🔎",(windowWidth/2)-40,windowHeight/4)
	text("🔄",(windowWidth/2)-40,3*windowHeight/4)
}

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
	// r = Math.floor(Math.random() * 255);
	// g = Math.floor(Math.random() * 255);
	// b = Math.floor(Math.random() * 255);

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

function showColor() {
  showColorValue()
}
