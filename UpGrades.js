function UpgradeHealth() {
	if (coincount > 0) {
		PlayerHealth = PlayerHealth + 10;
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}

}
function UpgradeAmmo() {
	if (coincount > 0) {
		damage = damage + 5;
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}
}
function Upgradeshrap() {
	if (coincount > 0) {
		shrapdam = shrapdam + 5;
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}
}
function Upgraderegen() {
	if (coincount > 0) {
		regen = regen + .05;
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}
}
function Upgradedis() {
	if (coincount > 0) {
		blast = blast + 2
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}
}
function Upgradefire() {
	if (coincount > 0) {
		fire = fire - .5;
		coincount--;
		document.getElementById("coins").innerHTML = "Coins: " + coincount;
	}
}