/**
	class Effect
	@constructor
**/

voyc.Effect = function(x, y, imagename, rows, cols, soundname) {
	// inputs
	this.x = x;
	this.y = y;
	this.imagename = imagename;
	this.rows = rows;
	this.cols = cols;
	this.soundname = soundname;

	// derived
	this.image = voyc.Effect.asset.get(imagename);
	this.w = this.image.width / this.cols;
	this.h = this.image.height / this.rows;
	this.numframes = this.rows * this.cols;

	// working
	this.frame = 0;
	this.xprev = x;
	this.yprev = y;
	this.xdiff = 0;
	this.ydiff = 0;
	this.lat = 0;
	this.lng = 0;
}

voyc.Effect.asset = null;  // asset manager
voyc.Effect.sound = null;  // sound manager

voyc.Effect.prototype.draw = function(ctx) {
	if (this.frame == 0) {
		voyc.Effect.sound.play(this.soundname);
	}

	// calc row & col
	var i=0, row=0, col=0;
	while (i<this.frame) {
		i++;
		col++;
		if (col > this.cols) {
			col = 0;
			row++;
		}
	}

	ctx.drawImage(
		this.image,  // image

		(col * this.w), // source x
		(row * this.h), // source y
		this.w, // source w
		this.h, // source h

		this.x - (this.w/2),  // target x
		this.y - (this.h/2),  // target y
		this.w,  // target w
		this.h   // target h
	);
	
	this.frame++;
	return !(this.frame >= this.numframes);  // return false to stop the animation
}

voyc.Effect.prototype.moveTo = function(x,y) {
	this.x = x;
	this.y = y;
}

voyc.Effect.prototype.jumpTo = function(x,y) {
	this.x = x;
	this.y = y;
}
