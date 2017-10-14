/** enum */
voyc.LoadState = {
	PENDING:1,
	LOADING:2,
	SUCCESS:3,
	FAILED:4,
}

/** @constructor */
voyc.Sound = function() {
	this.context = new window.AudioContext();
	this.bufferList = {};
	this.cb = null;
	this.maxAttempts = 3;
}

voyc.Sound.prototype.toString = function() {
	return('Sound');
}

// load array of sound files
voyc.Sound.prototype.loadSounds = function(urlpattern, names, cb) {
	this.cb = cb;
	var url, name;
	for (var i=0; i<names.length; i++) {
		var name = names[i];
		url = urlpattern.replace('%sound%', name);
		this.bufferList[name] = {url:url, state:voyc.LoadState.LOADING, attempt:1 };
		this.loadSound(url, name);
	}
}

// load one sound file
voyc.Sound.prototype.loadSound = function(url, name) {
	// read sound file from url
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function() {
		// decode the audio file data in returned in request.response
		loader.context.decodeAudioData(
			/** @type {ArrayBuffer} */ (request.response),
			function(buffer) {
				if (buffer) {
					// success
					loader.bufferList[name].buffer = buffer;
					loader.bufferList[name].state = voyc.LoadState.SUCCESS;
					//console.log('sound ' + name + ' loaded');
				}
				else {
					loader.bufferList[name].state = voyc.LoadState.PENDING;
					console.log('sound ' + name + ' failed, buffer empty');
				}
				loader.onSoundLoad();
			},
			function(error) {
				loader.bufferList[name].state = voyc.LoadState.PENDING;
				console.log('sound ' + name + ' failed, ' + error);
				loader.onSoundLoad();
			}
		);
	}

	request.onerror = function() {
		loader.bufferList[name].state = voyc.LoadState.PENDING;
		console.log('sound ' + name + ' failed, onerror');
		loader.onSoundLoad();
	}

	request.send();
}

voyc.Sound.prototype.onSoundLoad = function() {
	var count=0;
	var success=0;
	var fail=0;
	for (var name in this.bufferList) {
		count++;
		var sound = this.bufferList[name];
		if (sound.state == voyc.LoadState.SUCCESS) {
			success++;
			//voyc.dispatcher.publish(voyc.Event.FileLoaded, this, {note:name});
		}
		else if (sound.state == voyc.LoadState.PENDING) {
			if (sound.attempt < this.maxAttempts) {
				sound.state = voyc.LoadState.LOADING;
				sound.attempt++;
				this.loadSound(sound.url, sound.name);
			}
			else {
				sound.state = voyc.LoadState.FAILED;
				fail++;
			}
		}
	}
	if (count == (success + fail)) {
		this.cb(count==success);  // finished
	}
}

voyc.Sound.prototype.play = function(name) {
	var source = this.context.createBufferSource(); // creates a sound source
	source.buffer = this.bufferList[name].buffer;   // tell the source which sound to play
	source.connect(this.context.destination);       // connect the source to the context's destination (the speakers)
	source.start(0);                                // play the source now
											        // note: on older systems, may have to use deprecated noteOn(time);
}
