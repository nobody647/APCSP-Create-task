var canvas;
var context;
var gameObjects = [];
var upPressed;
var downPressed;
var leftPressed;
var rightPressed;

$(document).ready(function(){
	console.log("Hello world!");

	setup();

	gameObjects.unshift(new playerCharacter(20, 20, 0, 0, "blue", 100, 10, 10, true));


	setInterval(function () {
		update();
	 }, 16)
});

$(document).keydown(function(event){
	if (event.which == 38){ //up
		console.log("Up");
		upPressed = true;
	}else if (event.which == 40){ //down
		console.log("Down");
		downPressed = true;
	}else if (event.which == 37){ //left
		console.log("Left");
		leftPressed = true;
	}else if (event.which == 39){ //right
		console.log("Right")
		rightPressed = true;
	}
});
$(document).keyup(function(event){
	if (event.which == 38){ //up
		console.log("Up");
		upPressed = false;
	}else if (event.which == 40){ //down
		console.log("Down");
		downPressed = false;
	}else if (event.which == 37){ //left
		console.log("Left");
		leftPressed = false;
	}else if (event.which == 39){ //right
		console.log("Right")
		rightPressed = false;
	}
});
$(document).click(function(event){

	//gets coordinates relative to canvas. shamelessly stolen from https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
	var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

	gameObjects[0].Shoot(x, y);
});

function setup(){
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");
}

function update(){
	var obj;
	context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
	context.fillStyle = "red";

	for(var i = 0; i < gameObjects.length; i++){
		context.fillStyle = "red";
		obj = gameObjects[i];
		if (typeof obj.Update === 'function') obj.Update(); //calls the objects update function
		
		if(obj instanceof playerCharacter){
			context.fillStyle = obj.color;
			
			if (obj.ctrl){
				if (upPressed) obj.move(obj.x, obj.y - obj.speed);
				if (downPressed) obj.move(obj.x, obj.y + obj.speed);
				if (leftPressed) obj.move(obj.x - obj.speed, obj.y);
				if (rightPressed) obj.move(obj.x + obj.speed, obj.y);
			}

		}


		context.fillRect(obj.x, obj.y, obj.width, obj.height);
	}
}
class gameObject{
	constructor(width, height, x, y){
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
	}

	get centerX(){
		return this.x + this.width/2;
	}
	get centerY(){
		return this.y + this.height/2;
	}

	move(destX, destY){
		if (destX < 0) destX = 0;
		if (destY < 0) destY = 0;

		if (destX + this.width > 640) destX = 640 - this.width;
		if (destY + this.height > 480) destY = 480 - this.height;
		
		this.x = destX;
		this.y = destY;
	}
}

class playerCharacter extends gameObject{
	constructor(width, height, x, y, color, hp, speed, ammo, ctrl){
		super(width, height, x, y);
		this.color = color;
		this.hp = hp;
		this.speed = speed;
		this.ammo = ammo;
		this.ctrl = ctrl;
	}

	Shoot(destX, destY){
		gameObjects.unshift(new bullet(5, 5, this.centerX-2.5, this.centerY-2.5, this.color, 10, destX, destY));
		console.log("Bang!");
	}
}

class bullet extends gameObject{
	constructor(width, height, x, y, color, speed, destX, destY){
		super(width, height, x, y);
		this.color = color;
		this.speed = speed;
		this.destX = destX;
		this.destY = destY;
	}

	Update(){ //i hate geometry. https://i.imgur.com/J83605g.png
		var distX = this.destX - this.x
		var distY = this.destY - this.y

		var hypotonoose = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)); //yes, i know, i cant spell

		var xPart = distX/hypotonoose;
		var yPart = distY/hypotonoose;


		this.move(this.x + xPart, this.y + yPart);


		if(Math.abs(distX) < 1 && Math.abs(distY < 1)){
			console.log("Boom!");

			var index = gameObjects.indexOf(this);
			if (index == -1){
				console.log("what the fuck");
				return;
			}
			gameObjects.splice(index, 1);
		}
	}
}
