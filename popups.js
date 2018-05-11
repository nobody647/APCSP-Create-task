var popups = [];

class popup{
	constructor(x, y, color, text, time, speed){
		this.x = x;
		this.y = y;
		this.color = color;
		this.text = text;
		this.max = time;
		this.speed = 1/(speed/2);

		this.time = 0;
	}
}

function drawPopups(){
	context.textAlign = "center";
	context.font = "20px Arial";

	var popup;
	for (var i = 0; i < popups.length; i++){
		popup = popups[i];
		context.fillStyle = popup.color;
		context.fillText(popup.text, popup.x, popup.y-(popup.time/popup.speed));
		popup.time ++;

		if(popup.time >= popup.max) popups.splice(popups.indexOf(popup), 1);
	}
}