class weapon {
	constructor(shots, damage, speed, spread, cooldown, ammoConsumption, continual, color, bulletType, fire, hit) {
		this.shots = shots;
		this.damage = damage;
		this.speed = speed;
		this.spread = spread;
		this.cooldown = cooldown;
		this.ammoConsumption = ammoConsumption;
		this.continual = continual;
		this.color = color;
		this.bulletType = bulletType;

		this.heat = 0;

		if (fire) this.Fire = fire;
		if (hit) this.Hit = hit;
	}


	Fire(startX, startY, destX, destY) {
		if (this.heat <= 0 && player.ammo >= this.ammoConsumption) {
			for (var i = 0; i < this.shots; i++) {
				var direction = getDirection(startX - 2.5, startY - 2.5, destX, destY);

				direction[0] += randomPlusOrMinus(Math.random()) * this.spread;
				direction[1] += randomPlusOrMinus(Math.random()) * this.spread;
				var bullet = new this.bulletType(startX, startY, this.color, this.speed, this.damage, direction[0], direction[1], destX, destY)
				gameObjects.push(bullet);
			}
			this.heat = this.cooldown;
			player.ammo -= this.ammoConsumption;
		}
	}

	Hit() {}
}

class flak extends gameObject {
	constructor(x, y, color, speed, damage, dirX, dirY, destX, destY) {
		super(5, 5, x, y, color);
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

		//this.directionX = getDirection(x, y, destX, destY)[0];
		//this.directionY = getDirection(x, y, destX, destY)[1];

		this.directionX = destX;
		this.directionY = destY;
	}

	Update() {
		this.time--;

		this.move(this.x + this.directionX * this.speed, this.y + this.directionY * this.speed);

		var collision = getCollisions(this)[0]; //Damage
		if (collision && "hp" in collision && collision.color != this.color) {
			collision.hp -= this.damage;
			gameObjects.splice(gameObjects.indexOf(this), 1);
			console.log("Direct hit!");
		}

		if (this.time <= 0 || this.lastX == this.x || this.lastY == this.y) { //Despawns bullet if timeout or reached edge
			gameObjects.splice(gameObjects.indexOf(this), 1);
		}

		this.lastX = this.x;
		this.lastY = this.y;
	}
}