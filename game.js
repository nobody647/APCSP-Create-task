var canvas;
var context;
var gameObjects = [];
var spawners = [];
var player;

var gameState = "playing";

var upPressed;
var downPressed;
var leftPressed;
var rightPressed;
var leftMousePressed;
var rightMousePressed;
var mouseX;
var mouseY;

var score = 100;
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
			event.preventDefault();
		} else if (event.which == 40 || event.which == 83) { //down
			downPressed = true;
			event.preventDefault();
		} else if (event.which == 37 || event.which == 65) { //left
			leftPressed = true;
			event.preventDefault();
		} else if (event.which == 39 || event.which == 68) { //right
			rightPressed = true;
			event.preventDefault();
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
		if (event.button == 0) leftMousePressed = true;
		if (event.button == 2) rightMousePressed = true;
		if (gameState == "paused") gameState = "playing";
	};
	document.onmouseup = function () {
		leftMousePressed = false;
		rightMousePressed = false;
	};
	canvas.onmousemove = function (event) {
		var rect = canvas.getBoundingClientRect();
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;
	};
	document.addEventListener('contextmenu', event => event.preventDefault());
}

function update() {
	if (!document.hasFocus()) {
		gameState = "paused";
	}
	switch (gameState) {
		case "playing":
			context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
			drawGameObjects();
			drawPopups();
			drawUI();
			ticks++;
			break;
		case "paused":
			drawPaused();
			break;
		case "over":
			drawGameOver();
			break;
	}

}

function drawGameObjects() {
	var obj;

	for (var i = 0; i < gameObjects.length; i++) { //loops thru all gameObjects
		obj = gameObjects[i];

		if (typeof obj.Update === "function") obj.Update(); //calls the object's update method (if it exists)

		if (typeof obj.hp === "number" && typeof obj.Die === "function") { //kills gameObjects that are killable and have an hp of 0
			if (obj.hp <= 0) obj.Die();
		}

		context.fillStyle = obj.color;
		context.fillRect(obj.x, obj.y, obj.width, obj.height); //draws the object
	}

	var seed = Math.random();
	for (var i = 0; i < spawners.length; i++) { //Does spawning of all enemies, powerups, etc.
		spawners[i](seed);
	}
}

function drawPaused() {
	context.fillStyle = "black";
	context.font = "50px Arial";
	context.textAlign = "center";

	context.fillText("Paused", canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
	context.fillStyle = "black";
	context.font = "80px Arial";
	context.textAlign = "center";

	context.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
	context.fillText("Score: " + score, canvas.width / 2, (canvas.height / 2) + 80);
}

function drawUI() {
	var uiY = canvas.height - 105; //Height of UI box
	context.font = "30px Arial";
	context.textAlign = "start";

	context.fillStyle = "rgba(200, 200, 200, 0.5)";
	context.fillRect(0, uiY, 300, 105); //Draws box around UI elements

	context.fillStyle = "black";

	context.fillText("HP", 0, canvas.height - 75);
	fillBar(player.hp / player.maxHP, "red", 120, canvas.height - 100, 100, 30); //Draws HP indicator and bar

	context.fillText("AMMO", 0, canvas.height - 40);
	fillBar(player.ammo / player.maxAmmo, "red", 120, canvas.height - 65, 100, 30); //Draws ammo indicator and bar

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

function constrain(input, min, max) { //constrains a number between a min and a max
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

function getDistance(obj1, obj2){
	var xDiff = Math.abs(obj1.x - obj2.x);
	var yDiff = Math.abs(obj1.y - obj2.y);

	return Math.sqrt(xDiff**2 + yDiff**2);
}

function getClosest(obj, restriction){
	var closest;
	for (var i = 0; i < gameObjects.length; i++){
		if (gameObjects[i] == obj) break;
		if (!restriction(gameObjects[i])) break;

		if (!closest) closest = gameObjects[i];
		if (getDistance(obj, gameObjects[i]) < getDistance(obj, closest)) closest = gameObjects[i];
	}
	return closest;
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

function randomPlusOrMinus(input) {
	if (Math.random() >= .5) input = -input;
	return input;
}

function spawnEnemy(difficulty) {
	var shoot = Math.random() * .05 + difficulty * .1;
	var scoot = Math.random() * .01 + .002 + difficulty * .05;
	gameObjects.push(new enemy(20, 20, Math.random() * canvas.width, Math.random() * canvas.height, "red", 40, 10, shoot, scoot));
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
		this.coins = 0;
		this.maxHP = 100;
		this.maxAmmo = 30;
		this.HPRegen = 0.04;
		this.ammoRegen = 0.002;
		this.weapons = [new weapon(1, 15, 25, 0.05, 5, 0, true, this.color, bullet), new weapon(1, 20, 15, .05, 10, 1, false, this.color, flak)];

		canvas.addEventListener("mousedown", function (event) {
			var rect = canvas.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var y = event.clientY - rect.top;


			if (event.button == 0) {
				if (!player.weapons[0].continual) {
					player.weapons[0].Fire(player.centerX, player.centerY, mouseX, mouseY);
				}
			}
			if (event.button == 2) {
				if (!player.weapons[1].continual) {
					player.weapons[1].Fire(player.centerX, player.centerY, mouseX, mouseY);
				}
			}
			if (event.button == 1) {
				//gameObjects.push(new enemy(20, 20, player.x, player.y, "red", 40, 10, Math.random() *.05, Math.random() * .01 + .01)); //debug enemy spawning
			}
			event.preventDefault();
		});
	}
	set coins(newCoins) {
		this._coins = newCoins;
		document.getElementById("coinCount").innerHTML = "Coins: " + newCoins;
	}

	get coins() { return this._coins; }

	Update() {
		if (this.ctrl) {
			if (upPressed) this.move(this.x, this.y - this.speed);
			if (downPressed) this.move(this.x, this.y + this.speed);
			if (leftPressed) this.move(this.x - this.speed, this.y);
			if (rightPressed) this.move(this.x + this.speed, this.y);

			if (leftMousePressed && this.weapons[0].continual) this.weapons[0].Fire(player.centerX, player.centerY, mouseX, mouseY);
			if (rightMousePressed && this.weapons[1].continual) this.weapons[1].Fire(player.centerX, player.centerY, mouseX, mouseY);

		}

		if (this.ammo <= 30) this.maxAmmo += this.ammoRegen;
		if (this.hp <= this.maxHP) this.hp += this.HPRegen;

		var collision = getCollisions(this)[0];
		if (collision && "equip" in collision) {
			collision.equip(this);
			gameObjects.splice(gameObjects.indexOf(collision), 1);
		}


		for (var i = 0; i < this.weapons.length; i++) {
			this.weapons[i].heat--;
		}
	}

	Die() {
		gameState = "over";

		setTimeout(function () {
			alert("Click OK to try again");
			location.reload();
		}, 500)
	}
}