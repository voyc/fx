/**
	class Asset
	loads and holds a set of images
	designed for async loading with retry
	@constructor
*/
voyc.Asset = function() {
	this.paths = [];
	this.images = {};
	this.attempts = {};
	this.maxretries = 3;
	this.pathcount = 0;
	this.imagecount = 0;
};

voyc.Asset.prototype.toString = function() {
	return 'Asset';
}

// return one image by name
voyc.Asset.prototype.get = function(name) {
	return this.images[name];
}

// load a list of images
voyc.Asset.prototype.load = function (paths, cb) {
	this.paths = paths;  // array of {key:,path:} objects
	this.cb = cb;  // function called after each successful load, and at completion

	var key, path;
	for (var i=0; i<this.paths.length; i++) {
		key = this.paths[i].key;
		path = this.paths[i].path;
		this.attempts[key] = {
			img: {},
			retry: 0,
			key:key,
			path:path
		}
		this.pathcount++;
		this.loadImage(this.attempts[key]);
	}
}

// function getImage returns a promise.  (Therefore, getImage IS a promise.)
voyc.Asset.prototype.loadImage = function(attempt) {
	var self = this;
	attempt.img = new Image();
	attempt.img.onload = function() {
		self.loadSuccess(attempt);
	}
	attempt.img.onerror = function() {
		self.loadFail(attempt);
	}
	attempt.img.onabort = function() {
		self.loadFail(attempt);
	}
	attempt.img.src = attempt.path;
}

voyc.Asset.prototype.loadSuccess = function(attempt) {
	this.images[attempt.key] = attempt.img;
	this.imagecount++;
	this.cb(true, attempt.key);
	if (this.imagecount >= this.pathcount) {
		this.cb(true, '');
	}
	voyc.dispatcher.publish(voyc.Event.FileLoaded, this, {file:attempt.key});
}

voyc.Asset.prototype.loadFail = function(attempt) {
	attempt.retry++;
	if (attempt.retry > this.maxretries) {
		var msg = 'failed asset load '+attempt.path;
		this.cb(false, msg);
	}
	else {
		this.loadImage(attempt);
	}
}
