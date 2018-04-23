var canvas;
var context;
var gameObjects = [];
var player;

var upPressed;
var downPressed;
var leftPressed;
var rightPressed;
var mousePressed;
var mouseX;
var mouseY;

$(document).ready(function(){
	console.log("Hello world!");

	setup();

	setInterval(function () {
		update();
	 }, 16)
});

function setup(){
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");
	
	player = new playerCharacter(20, 20, 0, 0, "blue", 100, 10, 10, true)
	gameObjects.push(player);

	document.keydown = function(event){
		if (event.which == 38 || event.which == 87){ //up
			console.log("Up");
			upPressed = true;
		}else if (event.which == 40 || event.which == 83){ //down
			console.log("Down");
			downPressed = true;
		}else if (event.which == 37 || event.which == 65){ //left
			console.log("Left");
			leftPressed = true;
		}else if (event.which == 39 || 68){ //right
			console.log("Right")
			rightPressed = true;
		}
	};
	document.keyup = function(event){
		if (event.which == 38 || event.which == 87){ //up
			console.log("Up");
			upPressed = false;
		}else if (event.which == 40 || event.which == 83){ //down
			console.log("Down");
			downPressed = false;
		}else if (event.which == 37 || event.which == 65){ //left
			console.log("Left");
			leftPressed = false;
		}else if (event.which == 39 || event.which == 68){ //right
			console.log("Right")
			rightPressed = false;
		}
	};
	canvas.onmousedown = function(event) { 
		if (event.button == 0) mousePressed = true;
	};
	document.onmouseup = function() {
		mousePressed = false;
	};
	canvas.onmousemove = function(event){
		var rect = canvas.getBoundingClientRect();
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;
	};
	document.addEventListener('contextmenu', event => event.preventDefault());
}

function update(){
	var obj;
	context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
	context.fillStyle = "red";

	for(var i = 0; i < gameObjects.length; i++){
		context.fillStyle = "red";
		obj = gameObjects[i];
		if (typeof obj.Update === 'function') obj.Update(); //calls the objects update function
		context.fillStyle = obj.color;

		if(obj instanceof playerCharacter){
			
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

function getDirection(startX, startY, endX, endY){  //i hate geometry. https://i.imgur.com/J83605g.png
	var distX = endX - startX
	var distY = endY - startY

	var hypotonoose = Math.sqrt((distX ** 2) + (distY ** 2)); //yes, i know, i cant spell

	return [distX/hypotonoose, distY/hypotonoose, distX, distY];
}

class gameObject{
	constructor(width, height, x, y, color){
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.color = color;
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
		super(width, height, x, y, color);
		this.hp = hp;
		this.speed = speed;
		this.ammo = ammo;
		this.ctrl = ctrl;

		this.reload = 0;

		canvas.addEventListener("mousedown", function(event){
			var rect = canvas.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var y = event.clientY - rect.top;
		
			if (event.button == 2){
				player.ShootFlak(x, y);
			}
			event.preventDefault();
		});

	}

	ShootFlak(destX, destY){
		gameObjects.push(new flak(5, 5, this.centerX-2.5, this.centerY-2.5, this.color, 10, 30, destX, destY));
		console.log("Bang!");
	}
	ShootBullet(destX, destY){
		if (this.reload <= 0){
			gameObjects.push(new bullet(this.centerX-2.5, this.centerY-2.5, this.color, 20, 5, destX, destY));
			console.log("Pow!");
			this.reload = 7;
		}else{
			this.reload --;
		}
	}

	Update(){
		if (mousePressed){
			this.ShootBullet(mouseX, mouseY);
		}
	}
}

class flak extends gameObject{
	constructor(width, height, x, y, color, speed, damage, destX, destY){
		super(width, height, x, y, color);
		this.speed = speed;
		this.damage = damage;
		this.destX = destX;
		this.destY = destY;
	}

	Update(){
		var direction = getDirection(this.x, this.y, this.destX, this.destY);

		this.move(this.x + direction[0]*this.speed, this.y + direction[1]*this.speed);

		if(Math.abs(direction[2]) < this.speed && Math.abs(direction[3] < this.speed)){
			console.log("Boom!");

			for(var i = 0; i < this.damage; i++){
				gameObjects.push(new shrapnel(this.x, this.y, this.color, 60, 5));
			}

			var index = gameObjects.indexOf(this);
			if (index == -1){
				console.log("what the fuck");
				return;
			}
			gameObjects.splice(index, 1);
		}
	}
}

class shrapnel extends gameObject{
	constructor(x, y, color, time, damage){
		super(2, 2, x, y, color);
		this.time = time;
		this.damage = damage;

		this.speed = -0.5 *Math.random() + 1

		var destX = x+(Math.random() - 0.5);
		var destY = y+(Math.random() - 0.5);
		this.directionX = getDirection(x, y, destX, destY)[0];
		this.directionY = getDirection(x, y, destX, destY)[1];
	}

	Update(){
		this.time --;
		if (this.time <= 0){
			gameObjects.splice(gameObjects.indexOf(this), 1);
		}
		this.move(this.x + this.directionX * this.speed, this.y + this.directionY * this.speed)
	}
}


class bullet extends gameObject{
	constructor(x, y, color, speed, damage, destX, destY){
		super(3, 3, x, y, color);
		this.speed = speed;
		this.damage = damage;

		this.directionX = getDirection(x, y, destX, destY)[0];
		this.directionY = getDirection(x, y, destX, destY)[1];
	}

	Update(){
		this.move(this.x + this.directionX*this.speed, this.y + this.directionY*this.speed);
	}
}
