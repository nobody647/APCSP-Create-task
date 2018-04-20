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

	gameObjects.push(new playerCharacter(50, 50, 0, 0, "blue", 100, 20, 10, true));
	//gameObjects.push(new gameObject(50, 50, 20, 20));


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
	gameObjects[0].shoot(event.pageX, event.pageY);
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
		
		if(obj instanceof playerCharacter){
			context.fillStyle = obj.color;
			
			if (obj.ctrl){
				if (upPressed) obj.y -= obj.speed;
				if (downPressed) obj.y += obj.speed;
				if (leftPressed) obj.x -= obj.speed;
				if (rightPressed) obj.x += obj.speed;
			}

		}


		context.fillRect(obj.x, obj.y, obj.width, obj.height);
	}
}

function gameObject(width, height, x, y){
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
}

function playerCharacter(width, height, x, y, color, hp, speed, ammo, ctrl){
	gameObject.call(this, width, height, x, y);
	this.color = color;
	this.hp = hp;
	this.speed = speed;
	this.ammo = ammo;
	this.ctrl = ctrl;

	this.shoot = function(destX, destY){
		gameObjects.push(new bullet(5, 5, x, y, color, 10, destX, destY));
		console.log("Bang!");
	};
}

function bullet(width, height, x, y, color, speed, destX, destY){
	gameObject.call(this, width, height, x, y);
	this.color = color;
	this.speed = speed;
	this.destX = destX;
	this.destY = destY;
}
