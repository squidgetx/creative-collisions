// Open and connect input socket
let socket = io('/input');
socket.on('connect', () => {
	console.log('Connected');
});

// touch then change background color, value = 1
// after touch can't change value anymore / background until timer stops
// value = 0 red
// value = 1 green
// value = 2 blue
let value = 0;
// let r, g, b;
let color;
let touched = false;
let canTouch = false;

let timeInSec = 10;

function setup() {
	createCanvas(windowWidth, windowHeight);
	// background(255);
	drawButtons()

	socket.on('click', (data) => {
		// console.log(data);
		if (data === true) {
			canTouch = true;
		} else {
			resetGame();
		}
		console.log(canTouch);
	});
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
	if (touched == false && canTouch == true) {

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

		// touched = true;
	}
	//prevent default;
	return false;
}

function touchEnded(){
	drawButtons()
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
	canTouch = false;
	touched = false;
	background(255);
}
