class powerUp extends gameObject {
	constructor(x, y, color, strength, equip) {
		super(10, 10, x, y, color);
		this.strength = strength;

		this.equip = equip;
	}
}

spawners.push(function (seed) {
	if (seed <= .001 && player.hp < 100) { //Health powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "green", 1, function (obj) {
			obj.hp += 50;
		}));
	}
});

spawners.push(function (seed) {
	if (seed <= .0005 && player.ammo < 30) { //Ammo powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "gray", 1, function (obj) {
			obj.ammo += 10;
		}));
	}
});

spawners.push(function (seed) {
	if (seed <= .0001) { //Nuke powerup
		gameObjects.push(new powerUp(Math.random() * canvas.width, Math.random() * canvas.height, "orange", 1, function (obj) {
			console.log("Nuke");
			gameObjects = [player, this]; 
			context.fillStyle = "yellow";
			context.fillRect(0, 0, canvas.width, canvas.height);
		}));
	}
});