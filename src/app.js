/**
* Image player for playing a series jpegs stored as base64 string
*
* @example: new Sugr.imageplayer('data/base64ImagesMySpace', 23, 320, document.getElementById('video-container'));
*
* @param {string} url  The url of base64 string of images
* @param {number} fps  Frames per second
* @param {number} width  Width in pixels
* @param {element} containerEl  HTML PARENT element of <video> tag
* @param {number} frameCount  (OPTIONAL) Total number of frames
*
* @notes: Initial video does not have sound
* Optimized for iOS 7.1 and later
*/

var Sugr = Sugr || {};

Sugr.imageplayer = (function() {

  var _imagesArray, _imagesArrayType, _frameIndex = 0, _containerEl, _videoEl, _imageEl, _toggle, _paused, _timerStart;

  function _split(rawTextData) {
    return rawTextData.split('\n')
      .filter(function(val) {
        return val !=+ "";
      }
    )
  };

  function _play() {
    if (window.performance && _timerStart) console.log(window.performance.now() - _timerStart);
    if( !_imageEl) {
      _appendImageElement.call(this);
    }
    
    if(_frameIndex >= _imagesArray.length) _frameIndex = _imagesArray.length - 1;

    function render() {
      if ( this.frameCount && _frameIndex >= this.frameCount ) return;
      if ( !this.frameCount && _frameIndex === _imagesArray.length ) {
        _paused = true;
        console.log("PAUSED to buffer download");
        return;
      }
      if( _toggle ) {
        return;
      }

      setTimeout(function() {
        _frameIndex++;
        window.requestAnimationFrame(render.bind(this));
      }.bind(this), 1000 / this.fps);
      if(_frameIndex >= _imagesArray.length) _frameIndex = _imagesArray.length - 1;
      if (_imagesArrayType === 'base64') _imageEl.src = "data:image/jpeg;base64," + _imagesArray[_frameIndex];
      if (_imagesArrayType === 'url') _imageEl.src = _imagesArray[_frameIndex];
    };    
    render.call(this);
  };

  function _appendImageElement(imgString) {
    _imageEl = document.createElement('img');
    _imageEl.id = "imageFromVideo";
    _imageEl.width = this.width;
    _containerEl.appendChild(_imageEl);
    _imageEl.addEventListener('click', _onclick.bind(this));
    console.log('append image element');
  };

  var loading = {
    loadingEl: document.createElement('div'),
    
    display: function() {
      this.loadingEl.textContent = 'Loading...'
      _containerEl.appendChild(this.loadingEl);
    },

    remove: function() {
      _containerEl.removeChild(this.loadingEl)
    }
  };

  var clicked;
  var initialized;
  var frameIndexOnInitialPlay;
  var timeStampOnInitialPlay;
  function _onclick() {
    console.log("1. ONCLICK", _videoEl.currentTime);
    _toggle = true;
    var self = this;
    initialized = false;
    loading.display();
    
    if (_frameIndex === self.frameCount) {
      _frameIndex = 1;
      frameIndexOnInitialPlay = 1;
      timeStampOnInitialPlay = null;
    }

    _videoEl.addEventListener('play', playHandler, false);

    function playHandler(event) {
      frameIndexOnInitialPlay = frameIndexOnInitialPlay || _frameIndex;
      timeStampOnInitialPlay = timeStampOnInitialPlay || event.timeStamp;
      console.log(frameIndexOnInitialPlay, timeStampOnInitialPlay);
      _videoEl.pause();
      if( !clicked ) {
        clicked = clicked || true;
        console.log('2. play: ', _videoEl.currentTime);
        _videoEl.addEventListener('canplaythrough', canplaythroughHandler, false);
        // _videoEl.addEventListener('canplay', canplaythroughHandler, false);
      } else {
        canplaythroughHandler();
        progressHandler();
      }
      _videoEl.removeEventListener('play', playHandler, false);
    };
    
    function canplaythroughHandler() {
      console.log('3. canplayHandler', _videoEl.currentTime);
      _videoEl.addEventListener('progress', progressHandler, false);
      _videoEl.addEventListener('webkitendfullscreen', webkitendfullscreenHandler, false);
      // _videoEl.pause();
      _videoEl.removeEventListener('canplaythrough', canplaythroughHandler, false);
      // _videoEl.removeEventListener('canplay', canplaythroughHandler, false);
    };

    function progressHandler() {
      if( !initialized ) {
        console.log('4. progressHandler ', _videoEl.currentTime);
        _videoEl.addEventListener('seeked', seekedHander);
        _videoEl.currentTime = 1 / self.fps * _frameIndex;
        _videoEl.removeEventListener('progress', progressHandler, false);
        initialized = true;
      }
    };

    function seekedHander() {
      console.log('5. seekedHander: ', _videoEl.currentTime);
      console.log('5.1 Buffered: ', _videoEl.buffered.start(_videoEl.buffered.length - 1), _videoEl.buffered.end(_videoEl.buffered.length - 1));
      _videoEl.addEventListener('canplaythrough', canplaythroughSeeked, false);
      _videoEl.play();
      _videoEl.removeEventListener('seeked', seekedHander, false);
    };

    function canplaythroughSeeked() {
      _videoEl.play();
      _videoEl.removeEventListener('canplaythrough', canplaythroughSeeked, false);
    };
    
    function webkitendfullscreenHandler(event) {
      console.log(event.timeStamp, timeStampOnInitialPlay);
      loading.remove();
      _frameIndex = frameIndexOnInitialPlay + Math.round(self.fps * (event.timeStamp - timeStampOnInitialPlay) / 1000);
      console.log(_frameIndex);
      _toggle = false;
      _play.call(self);
      _videoEl.removeEventListener('webkitendfullscreen', webkitendfullscreenHandler, false);

    };

    _videoEl.play();
  };


  function waiting() {
    console.log('waiting');
  };

  function _autoplay() {
    _load.call(this, {
      onsend: function() {
      }.bind(this),

      onprogress: _updateProgressConstructor().bind(this),

      oncomplete: function() {
        this.frameCount = _imagesArray.length;
      }.bind(this),

      onerror: function() {},
    });
  };

  function _load(eventHandler) {
    var xhr;
    this.xhr = xhr = new XMLHttpRequest();

    xhr.open('GET', this.url, true);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 2) {
        eventHandler.onsend();
      }
    };
    
    xhr.onload = function() {
      if(xhr.readyState === 4) {
        if(xhr.status === 200) {
          eventHandler.oncomplete();
        }
      }
    }
    
    xhr.addEventListener('progress', eventHandler.onprogress, false);
    
    xhr.onerror = function() {
      console.err(xhr.statusText);
      eventHandler.onerror();
    };

    xhr.send();
    if (window.performance && !_timerStart) _timerStart = window.performance.now();
  };

  function _base64StringToImageUrl(base64Str) {
    var decodedData = window.atob(base64Str);  // decode base64 string to an octet aka character (see http://en.wikipedia.org/wiki/Base64)
    var bitArr = new Uint8Array(new ArrayBuffer(decodedData.length));  // initialize array: each char corresponds to 8 bits that will compose an image
    for(var i = 0; i < decodedData.length; i++) {
      bitArr[i] = decodedData.charCodeAt(i);  // unsigned 8 bit integer
    }
    var blob = new Blob([bitArr], {type: 'image/jpg'});
    var imgUrl = window.URL.createObjectURL(blob);
    return imgUrl;
  };

  function _updateProgressConstructor() {
    var start = 0;
    var end;
    var partialArrBase64;
    var partialArrImgUrl = [];
    var chunk;
    var chunkIndex = 0;
    var tempStr = "";
    var sum = 0;
    _imagesArray = [''];
    var remainder = '';
    return function(oEvent) {
      if (oEvent.type && this.xhr.responseText.length) {
        end = this.xhr.responseText.length;
        chunk = this.xhr.responseText.substring(start, end);
        partialArrBase64 = _split(remainder + chunk);
        for(var i = 0; i < partialArrBase64.length - 1; i++) {
          if (false && window.URL && window.URL.createObjectURL && window.atob && Blob) {
            _imagesArrayType = 'url';
            _imagesArray.push(_base64StringToImageUrl(partialArrBase64[i]));
          } else {
            _imagesArrayType = 'base64';
            _imagesArray.push(partialArrBase64[i]);
          }
        }
        remainder = partialArrBase64[partialArrBase64.length - 1];
        start = end;
        if(chunkIndex === 0 || _paused) {
          _paused = false;
          _play.call(this);
        }
        chunkIndex++;
        console.log(chunkIndex);
      }
    };
  };

  var ImagePlayer = function(url, fps, width, containerEl, frameCount) {
    this.url = url;
    this.fps = fps;
    this.frameCount = frameCount;
    this.width =  width;
    this.setContainer(containerEl);
    this.autoplay();
  };

  ImagePlayer.prototype = {
    
    autoplay: function() {
      _autoplay.call(this);
    },

    setContainer: function(containerEl) {
      _containerEl = containerEl;
      if(_containerEl.style.position === "") _containerEl.style.position = 'relative'
      _videoEl = containerEl.getElementsByTagName('video')[0];
    },
  };

  return ImagePlayer;

})();
