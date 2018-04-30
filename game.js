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

var score = 0;
var ticks = 0;

function setup() {
	console.log("Hello world!");

	setInterval(function () {
		update();
	}, 16)

	gameObjects = [];
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");

	player = new playerCharacter(30, 30, 0, 0, "blue", 100, 10, 10, true)
	gameObjects.push(player);

	document.addEventListener('keydown', function (event) {
		if (event.which == 38 || event.which == 87) { //up
			upPressed = true;
		} else if (event.which == 40 || event.which == 83) { //down
			downPressed = true;
		} else if (event.which == 37 || event.which == 65) { //left
			leftPressed = true;
		} else if (event.which == 39 || 68) { //right
			rightPressed = true;
		}
	});
	document.addEventListener('keyup', function (event) {
		if (event.which == 38 || event.which == 87) { //up
			upPressed = false;
		} else if (event.which == 40 || event.which == 83) { //down
			downPressed = false;
		} else if (event.which == 37 || event.which == 65) { //left
			leftPressed = false;
		} else if (event.which == 39 || event.which == 68) { //right
			rightPressed = false;
		}
	});
	canvas.onmousedown = function (event) {
		if (event.button == 0) mousePressed = true;
	};
	document.onmouseup = function () {
		mousePressed = false;
	};
	canvas.onmousemove = function (event) {
		var rect = canvas.getBoundingClientRect();
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;
	};
	document.addEventListener('contextmenu', event => event.preventDefault());
}

function update() {
	var obj;
	context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas

	for (var i = 0; i < gameObjects.length; i++) { //loops thru all gameObjects
		obj = gameObjects[i];

		if (typeof obj.Update === "function") obj.Update(); //calls the object's update method if it exists

		if (typeof obj.hp === "number" && typeof obj.Die === "function") { //kills gameObjects that are killable and have an hp of 0
			if (obj.hp <= 0) obj.Die();
		}

		context.fillStyle = obj.color;
		context.fillRect(obj.x, obj.y, obj.width, obj.height); //draws the object
	}

	if (Math.random() <= Math.sqrt(ticks / 10000)/200 + .005) spawnEnemy(Math.sqrt(ticks / 10000)/200 + .01); //Spawns enemies based on the difficulty


	if (Math.random() <= .001 && player.hp < 100){ //Health powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "green", 1, function(obj){
			obj.hp += 50;
		}));
	}

	if (Math.random() <= .0005 && player.ammo < 30){ //Ammo powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "gray", 1, function(obj){
			obj.ammo += 10;
		}));
	}
	
	if (Math.random() <= .0001){ //Nuke powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "orange", 1, function(obj){
			console.log("Nuke");
			gameObjects = [player, this];
			context.fillStyle = "yellow";
			context.fillRect(0, 0, canvas.width, canvas.height);
		}));
	}

	drawUI();
	ticks ++;
}

function drawUI() {
	var uiY = canvas.height - 105; //Height of UI box
	context.font = "30px Arial";

	context.fillStyle = "rgba(200, 200, 200, 0.5)";
	context.fillRect(0, uiY, 300, 105); //Draws box around UI elements

	context.fillStyle = "black";

	context.fillText("HP", 0, canvas.height - 75);
	fillBar(player.hp / 100, "red", 120, canvas.height - 100, 100, 30); //Draws HP indicator and bar

	context.fillText("AMMO", 0, canvas.height - 40);
	fillBar(player.ammo / 30, "red", 120, canvas.height - 65, 100, 30); //Draws ammo indicator and bar

	context.fillText("SCORE", 0, canvas.height - 5);
	context.fillStyle = "red";
	context.fillText(score, 120, canvas.height - 5); //draws score indicator

}

function fillBar(percent, color, x, y, width, height) {
	percent = constrain(percent, 0, 1); //Constrains the percentage between 0 and 1

	var oldStroke = context.strokeStyle;
	var oldFill = context.fillStyle; //Stores the current colors

	context.fillStyle = color;
	context.strokeStyle = color;
	context.strokeRect(x, y, width, height); //Draws box around bar
	context.fillRect(x, y, width * percent, height); //Fills bar

	context.strokeStyle = oldStroke;
	context.fillStyle = oldFill; //Resets colors to old values
}

function constrain(input, min, max){ //constrains a number between a min and a max
	if (input < min) input = min;
	if (input > max) input = max;
	return input;
}

function getDirection(startX, startY, endX, endY) { //i hate geometry. https://i.imgur.com/J83605g.png
	var distX = endX - startX
	var distY = endY - startY

	var hypotonoose = Math.sqrt((distX ** 2) + (distY ** 2)); //yes, i know, i cant spell

	return [distX / hypotonoose, distY / hypotonoose, distX, distY];
}

function getCollisions(original) { //Returns an array of all objects that are colliding with the input
	var output = [];

	for (var i = 0; i < gameObjects.length; i++) { //Loops tru all gameObjects
		var obj = gameObjects[i];

		if (obj == original) continue;

		if (original.IsInside(obj)) {
			output.push(obj); //Adds colliding object to output array
		}
	}

	return output;
}

function spawnEnemy(difficulty){
	var shoot = Math.random() * .05 + difficulty * .1;
	var scoot = Math.random() * .01 + .002 +  difficulty * .05;
	gameObjects.push(new enemy(20, 20, Math.random()*canvas.width, Math.random() * canvas.height, "red", 40, 10, shoot, scoot));
}

class gameObject {
	constructor(width, height, x, y, color) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.color = color;
	}

	get centerX() {
		return this.x + this.width / 2;
	}
	get centerY() {
		return this.y + this.height / 2;
	}

	move(destX, destY) {
		if (destX < 0) destX = 0;
		if (destY < 0) destY = 0;

		if (destX + this.width > canvas.width) destX = canvas.width - this.width;
		if (destY + this.height > canvas.height) destY = canvas.height - this.height;

		this.x = destX;
		this.y = destY;
	}

	IsInside(obj) {
		if (obj.x < this.x + this.width &&
			obj.x + obj.width > this.x &&
			obj.y < this.y + this.height &&
			obj.height + obj.y > this.y) {
			return true;
		}
		return false;
	}
}

class playerCharacter extends gameObject {
	constructor(width, height, x, y, color, hp, speed, ammo, ctrl) {
		super(width, height, x, y, color);
		this.hp = hp;
		this.speed = speed;
		this.ammo = ammo;
		this.ctrl = ctrl;

		this.reload = 0;

		canvas.addEventListener("mousedown", function (event) {
			var rect = canvas.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var y = event.clientY - rect.top;

			if (event.button == 2) {
				player.ShootFlak(x, y);
			}
			if (event.button == 1) {
				//gameObjects.push(new enemy(20, 20, player.x, player.y, "red", 40, 10, Math.random() *.05, Math.random() * .01 + .01)); //debug enemy spawning
			}
			event.preventDefault();
		});
	}

	ShootFlak(destX, destY) {
		if (this.ammo >= 1) {
			this.ammo--;
			gameObjects.push(new flak(5, 5, this.centerX - 2.5, this.centerY - 2.5, this.color, 15, 40, destX, destY));
			console.log("Bang!");
		}
	}
	ShootBullet(destX, destY) {
		if (this.reload <= 0) {
			gameObjects.push(new bullet(this.centerX - 2.5, this.centerY - 2.5, this.color, 20, 10, destX, destY));
			console.log("Pow!");
			this.reload = 7;
		} else {
			this.reload--;
		}
	}

	Update() {
		if (this.ctrl) {
			if (upPressed) this.move(this.x, this.y - this.speed);
			if (downPressed) this.move(this.x, this.y + this.speed);
			if (leftPressed) this.move(this.x - this.speed, this.y);
			if (rightPressed) this.move(this.x + this.speed, this.y);

			if (mousePressed) this.ShootBullet(mouseX, mouseY);

		}

		if (this.ammo <= 30) this.ammo += 0.002;
		if (this.hp <= 100) this.hp += 0.04;

		var collision = getCollisions(this)[0];
		if (collision && "equip" in collision){
			collision.equip(this);
			gameObjects.splice(gameObjects.indexOf(collision), 1);
		}
	}

	Die() {
		context.fillStyle = "black";
		context.font = "50px Arial";
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign="center"; 
		context.fillText("Game Over", canvas.width/2, canvas.height/2);
		this.hp = 1000000;

		setTimeout(function(){
			alert("Your score was "+ score +". CLick OK to try again");
			location.reload();
		}, 50)
	}
}

class flak extends gameObject {
	constructor(width, height, x, y, color, speed, damage, destX, destY) {
		super(width, height, x, y, color);
		this.speed = speed;
		this.damage = damage;
		this.destX = destX;
		this.destY = destY;
	}

	Update() {
		var direction = getDirection(this.x, this.y, this.destX, this.destY);

		this.move(this.x + direction[0] * this.speed, this.y + direction[1] * this.speed);

		if (Math.abs(direction[2]) < this.speed && Math.abs(direction[3]) < this.speed) {
			this.Explode();
		}
	}

	Explode() {
		console.log("Boom!");

		for (var i = 0; i < this.damage; i++) {
			gameObjects.push(new shrapnel(this.x, this.y, this.color, 20, 10));
		}

		gameObjects.splice(gameObjects.indexOf(this), 1);
	}
}

class shrapnel extends gameObject {
	constructor(x, y, color, time, damage) {
		super(2, 2, x, y, color);
		this.time = time;
		this.damage = damage;

		this.speed = -1 * Math.random() + 4

		var destX = x + (Math.random() - 0.5);
		var destY = y + (Math.random() - 0.5);
		this.directionX = getDirection(x, y, destX, destY)[0];
		this.directionY = getDirection(x, y, destX, destY)[1];
	}

	Update() {
		this.time--;
		if (this.time <= 0) {
			gameObjects.splice(gameObjects.indexOf(this), 1);
		}
		this.move(this.x + this.directionX * this.speed, this.y + this.directionY * this.speed)

		var collision = getCollisions(this)[0]; //Damage
		if (collision && "hp" in collision && collision.color != this.color) {
			collision.hp -= this.damage;
			gameObjects.splice(gameObjects.indexOf(this), 1);
			console.log("Direct hit!");
		}
	}
}


class bullet extends gameObject {
	constructor(x, y, color, speed, damage, destX, destY) {
		super(3, 3, x, y, color);
		this.speed = speed;
		this.damage = damage;

		this.time = 300;

		this.directionX = getDirection(x, y, destX, destY)[0];
		this.directionY = getDirection(x, y, destX, destY)[1];
	}

	Update() {
		this.time --;

		this.move(this.x + this.directionX * this.speed, this.y + this.directionY * this.speed);

		var collision = getCollisions(this)[0]; //Damage
		if (collision && "hp" in collision && collision.color != this.color) {
			collision.hp -= this.damage;
			gameObjects.splice(gameObjects.indexOf(this), 1);
			console.log("Direct hit!");
		}

		if (this.time <= 0 || this.lastX == this.x || this.lastY == this.y){ //Despawns bullet if timeout or reached edge
			gameObjects.splice(gameObjects.indexOf(this), 1);
		}

		this.lastX = this.x;
		this.lastY = this.y;
	}
}

class enemy extends gameObject {
	constructor(width, height, x, y, color, hp, speed, shoot, scoot) {
		super(width, height, x, y, color);
		this.hp = hp;
		this.speed = speed;
		this.shoot = shoot;
		this.scoot = scoot;

		var destX = x + (Math.random() - 0.5);
		var destY = y + (Math.random() - 0.5);
		this.AIDirection = getDirection(x, y, destX, destY);
	}
	Update() {
		this.move(this.x + this.AIDirection[0], this.y + this.AIDirection[1]);
		
		if (Math.random() < this.shoot) this.Shoot();

		if (Math.random() < this.scoot || this.lastX == this.x || this.lastY == this.y) {
			var destX = this.x + (Math.random() - 0.5);
			var destY = this.y + (Math.random() - 0.5);
			this.AIDirection = getDirection(this.x, this.y, destX, destY);
		}

		this.lastX = this.x;
		this.lastY = this.y;
	}
	Die() {
		console.log("oof");
		gameObjects.splice(gameObjects.indexOf(this), 1);
		score += Math.floor((this.scoot + this.shoot)*1000);
	}
	Shoot() {
		gameObjects.push(new bullet(this.centerX, this.centerY, this.color, 5, 10, player.centerX, player.centerY));
	}
}

class powerUp extends gameObject{
	constructor(x, y, color, strength, equip){
		super(10, 10, x, y, color);
		this.strength = strength;

		this.equip = equip;
	}
}


setup();