document.getElementById("upgradeShots").onmousedown = function (event) {
	if (player.coins >= 1) {
		player.weapons[0].shots++;
		player.coins--;
		document.getElementById("upgradeShots").innerHTML = "Shots: "+player.weapons[0].shots;
	}
}

document.getElementById("upgradeMaxHP").onmousedown = function (event) {
	if (player.coins >= 1) {
		player.maxHP += 10;
		player.coins--;
		document.getElementById("upgradeMaxHP").innerHTML = "Max HP: "+ player.maxHP;
	}
}

document.getElementById("upgradeHPRegen").onmousedown = function (event) {
	if (player.coins >= 1) {
		player.HPRegen += 0.005;
		player.coins--;
		document.getElementById("upgradeHPRegen").innerHTML = "HP Regen: "+ player.HPRegen/.04;
	}
}
