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

var score = 100;
var ticks = 0;
var Highscore = 0;
var damage = 10;
var shrapdam = 10;
var enhealth = 40;
var PlayerHealth = 100;
var coincount = 0;
var blast = 20;
var fire = 10;  
var regen = .1;

$(document).ready(function () {
	console.log("Hello world!");

	setup();

	setInterval(function () {
		update();
	}, 16)
});

function setup() {
	gameObjects = [];
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");

	player = new playerCharacter(30, 30, 0, 0, "blue", PlayerHealth, 10, 10, true)
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

	for (var i = 0; i < gameObjects.length; i++) {
		obj = gameObjects[i];

		context.fillStyle = obj.color;

		if (typeof obj.Update === "function") obj.Update(); //calls the objects update function

		if (typeof obj.hp === "number" && typeof obj.Die === "function") {
			if (obj.hp <= 0) obj.Die();
		}

		context.fillRect(obj.x, obj.y, obj.width, obj.height);
	}

	if (Math.random() <= Math.sqrt(ticks / 10000) / 200 + .005) spawnEnemy(Math.sqrt(ticks / 10000) / 200 + .01);


	if (Math.random() <= .001 && player.hp < PlayerHealth) { //Health powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "green", 1, function (obj) {
			obj.hp += 50;
		}));
	}

	if (Math.random() <= .0005 && player.ammo < 30) { //Ammo powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "gray", 1, function (obj) {
			obj.ammo += 50;
		}));
	}

	if (Math.random() <= .0001) { //Nuke powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "orange", 1, function (obj) {
			console.log("Nuke");
			gameObjects = [player, this];
			context.fillStyle = "yellow";
			context.fillRect(0, 0, canvas.width, canvas.height);
		}));
	}

	


	drawUI();
	ticks++;
}

function drawUI() {
	var uiY = canvas.height - 105;
	context.fillStyle = "rgba(200, 200, 200, 0.5)";
	context.font = "30px Roboto";

	context.fillRect(0, uiY, 300, 105);

	context.fillStyle = "black";
	context.fillText("HP", 0, canvas.height - 75);
	fillBar(player.hp / PlayerHealth, "red", 100, canvas.height - 100, 100, 30)

	context.fillText("AMMO", 0, canvas.height - 40);
	fillBar(player.ammo / 30, "red", 100, canvas.height - 65, 100, 30)

	context.fillText("SCORE", 0, canvas.height - 5)
	context.fillStyle = "red"
	context.fillText(score, 100, canvas.height - 5)


}

function fillBar(percent, color, x, y, width, height) {
	if (percent > 1) percent = 1;
	if (percent < 0) percent = 0;
	var oldStroke = context.strokeStyle;
	var oldFill = context.fillStyle;

	context.fillStyle = color;
	context.strokeStyle = color;
	context.strokeRect(x, y, width, height);
	context.fillRect(x, y, width * percent, height);

	context.strokeStyle = oldStroke;
	context.fillStyle = oldFill;
}

function getDirection(startX, startY, endX, endY) { //i hate geometry. https://i.imgur.com/J83605g.png
	var distX = endX - startX
	var distY = endY - startY

	var hypotonoose = Math.sqrt((distX ** 2) + (distY ** 2)); //yes, i know, i cant spell

	return [distX / hypotonoose, distY / hypotonoose, distX, distY];
}

function getCollisions(original) { //Returns an array of all objects that are colliding with the input
	var output = [];

	for (var i = 0; i < gameObjects.length; i++) {
		let obj = gameObjects[i];
		if (obj == original) continue;

		if (original.IsInside(obj)) {
			output.push(obj);
		}
	}

	return output;
}



function randomPlusOrMinus(input){
	if (Math.random() >= .5) input = -input;
	return input;
}

function spawnEnemy(difficulty){
	var shoot = Math.random() * .05 + difficulty * .1;
	var scoot = Math.random() * .01 + .002 + difficulty * .05;
	gameObjects.push(new enemy(20, 20, Math.random() * canvas.width, Math.random() * canvas.height, "red", enhealth, 10, shoot, scoot));
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
		this.weapons = [new weapon(1, 10, 20, 0.05, bullet), new weapon(1, 20, 15, .05, flak)];

		canvas.addEventListener("mousedown", function (event) {
			var rect = canvas.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var y = event.clientY - rect.top;

			if (event.button == 2) {
				//player.ShootFlak(x, y);
				this.weapons[1].Fire();
			}
			if (event.button == 1) {
				gameObjects.push(new enemy(20, 20, player.x, player.y, "red", 40, 10, Math.random() * .05, Math.random() * .01 + .01)); //debug enemy spawning
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
			gameObjects.push(new bullet(this.centerX - 2.5, this.centerY - 2.5, this.color, blast, damage, destX, destY));
			console.log("Pow!");
			this.reload = fire;
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

			if (mousePressed) this.weapons[0].Fire(mouseX, mouseY);

		}

		if (this.ammo <= 30) this.ammo += 0.01;
		if (this.hp <= PlayerHealth) this.hp += regen;

		var collision = getCollisions(this)[0];
		if (collision && "equip" in collision) {
			collision.equip(this);
			gameObjects.splice(gameObjects.indexOf(collision), 1);
		}
	}

	Die() {
		context.fillStyle = "black";
		context.font = "50px Roboto";
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
		this.hp = 1000000;

		setTimeout(function () {
			alert("Your score was " + score + ". Click OK to try again");
			location.reload();
		}, 2000)

	}
}



class powerUp extends gameObject {
	constructor(x, y, color, strength, equip) {
		super(10, 10, x, y, color);
		this.strength = strength;

		this.equip = equip;
	}

}

