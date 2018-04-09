var canvas;
var context;
var objects = [];

$(document).ready(function(){
	console.log("Hello world!");

	setup();

	gameObject(50, 50, 0, 0);
	gameObject(50, 50, 0, -20);
	gameObject(50, 50, -20, 0);

	setInterval(function () {
		update();
	 }, 16)
});

function setup(){
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");
}

function update(){
	var obj;
	context.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
	context.fillStyle = "red";

	for(var i = 0; i < objects.length; i++){
		obj = objects[i];
		obj.x ++;
		context.fillRect(obj.x, obj.y, obj.width, obj.height);
	}
}

function gameObject(width, height, x, y){
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	objects.push(this);
}
