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

spawners.push(function(seed){
	if (seed <= Math.sqrt(ticks / 10000)/200 + .005){
		 spawnEnemy(Math.sqrt(ticks / 10000)/200 + .01);
	}
});