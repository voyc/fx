/**
	class Game
	singleton
	@constructor
	Provides animation loop. 
	Calls onRender callback function
*/
voyc.Game = function() {
	this.running = false;
	this.onRender = function(timestamp) {};
	this.previousTimestamp = 0;
	if (log) {
		this.starttime = 0;
		this.elapsed = 0;
		this.frames = 0;
		this.fps = 0;
	}
}

voyc.Game.prototype.start = function () {
	log&&console.log('game engine start');
	this.running = true;
	var self = this;
	window.requestAnimationFrame(function(timestamp) {self.step(timestamp)});
}

voyc.Game.prototype.stop = function () {
	log&&console.log('game engine stop');
	this.running = false;
}

voyc.Game.prototype.toggle = function () {
	if (this.running) {
		this.stop();
	}
	else {
		this.start();
	}
}

voyc.Game.prototype.step = function (timestamp) {
	if (log) {
		if (!this.starttime) this.starttime = timestamp;
		this.elapsed = timestamp - this.starttime;
		this.frames++;
		this.fps = (this.frames / (this.elapsed / 1000));
	}
	var delta = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;
	this.render(timestamp);
	if (this.running) {
		var self = this;
		window.requestAnimationFrame(function(timestamp) {self.step(timestamp)});
	}
}

voyc.Game.prototype.render = function (timestamp) {
	log&&!(this.frames % 1000)&&console.log('render ' + this.elapsed.toFixed(0) + ' ' + this.frames + ' ' + this.fps.toFixed(2));
	this.onRender(timestamp);
}
