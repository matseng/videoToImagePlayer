var Sugr = Sugr || {};
Sugr.imageplayer = (function() {

  var _imagesArray = [""], _imagesArrayType, _frameIndex = 0, _containerEl, _videoEl, _imageEl, _clicked, _paused, _timerStart; 
  var _audio = {
    src: "",
    srcPrefix: "data:audio/mp3;base64,",
    array: [""],
    element: null,

  };

  function _split(rawTextData) {
    return rawTextData.split('\n')
      .filter(function(val) {
        return val !=+ "";
      }
    )
  };

  function _play() {
    var expectedFps;
    // if (window.performance && _timerStart) console.log(window.performance.now() - _timerStart);
    if( !_imageEl) {
      _appendImageElement.call(this);
    }

    function render(delta) {
      delta = delta || 0;
      if ( !this.frameCount && _frameIndex === _imagesArray.length) {
        _paused = true;
        console.log("PAUSED to buffer download");
        return;
      }
      if( _clicked ) {
        return;
      }

      if (_audio.source) {
        // debugger
        expectedFrameIndex = Math.round(this.fps * (_audio.source.context.currentTime + _audio.offset));
        console.log('actual vs expecte frame index: ', _frameIndex, expectedFrameIndex);
        if (expectedFrameIndex > _frameIndex) {
          console.log(expectedFrameIndex, _frameIndex);
          _frameIndex = expectedFrameIndex;
        }
      }
      if (this.frameCount && _frameIndex >= this.frameCount) {
        return;
      }


      setTimeout(function() {
        _frameIndex++;
        window.requestAnimationFrame(render.bind(this));
      }.bind(this), 1000 / this.fps);
      if(_frameIndex === _imagesArray.length) return;
      if ( !_imagesArray[_frameIndex] ) return;
      if (_imagesArrayType === 'base64') _imageEl.src = "data:image/jpeg;base64," + _imagesArray[_frameIndex];
      if (_imagesArrayType === 'url') _imageEl.src = _imagesArray[_frameIndex];
      // _imagesArray[_frameIndex] = null;
    };    
    render.call(this);
  };

  function _appendImageElement(imgString) {
    _imageEl = document.createElement('img');
    _imageEl.id = "imageFromVideo";
    _imageEl.width = this.width;
    _imageEl.style.position = 'absolute';
    _imageEl.style.top = '0px';
    _imageEl.style.left = '0px';
    _containerEl.appendChild(_imageEl);
    _imageEl.addEventListener('click', _onclick.bind(this));
    console.log('append image element');
  };

  function _onclick() {
    _audioPlay.call(this);
  };

  var flag = false;
  function _onclick_OLD() {
    console.log("ONCLICK", _videoEl);
    var self = this;
    console.log(_audio.element.canPlayType());
    _audio.element.play();
    // if(_audio.element) _audio.element.currentTime = 1 / self.fps * (_frameIndex);
    _audio.element.addEventListener('play', function() {
      
      if (flag) return
      // _audio.element.pause();
      console.log("1. play audio");
      _audio.element.addEventListener('canplaythrough', function() {
        if (flag) return
        console.log("2. canplaythrough");
        _audio.element.addEventListener('progress', function() {
          if (flag) return
          console.log("3. progress");
          console.log(1 / self.fps * (_frameIndex));
          _audio.element.currentTime = 1 / self.fps * (_frameIndex);
          _audio.element.addEventListener('seeked', function() {
            console.log("4. seeked");
            _audio.element.play();
            flag = true;
            // debugger
          })
        })
      })
    })
    var width = parent.window.innerWidth;
    var height = parent.window.innerHeight;
    console.log(width, height);
    _imageEl.width = height;
    _imageEl.height = width;
    // _containerEl.style.position = 'fixed';
    _containerEl.style.position = 'relative';
    _containerEl.style.width = height;
    _containerEl.style.height = width;
    var translateX = -height / 2 + width / 2;
    var translateY = -width / 2 + height /2;
    _containerEl.style.transition = '0.5s';
    _imageEl.style.transition = '0.5s';
    _containerEl.style.webkitTransform = "translate(" + translateX + "px," + translateY + "px)" + "rotate(90deg)";
    _containerEl.style.transform = "translate(" + translateX + "px," + translateY + "px)" + "rotate(90deg)";
  };

  function _autoplay() {
    _load.call(this, {
      onsend: function() {
      }.bind(this),

      onprogress: _updateProgressConstructor(_base64StringToImageUrl, _imagesArray).bind(this),

      oncomplete: function() {
        this.frameCount = _imagesArray.length;
      }.bind(this),

      onerror: function() {},
    }, this.url);

    _load.call(this, {
      onsend: function() {
      }.bind(this),

      onprogress: _updateProgressConstructorAudio(null, _audio, 'audio').bind(this),

      oncomplete: function() {
        // debugger
        var div = document.createElement('div');
        _audio.element = document.createElement('audio');
        // _audio.element.setAttribute('controls', false);
        // div.style.position = 'relative';
        div.style.position = 'relative';
        div.style.width = '1px';
        div.style.height = '1px';
        // _audio.element.setAttribute('autoplay', true);
        // _audio.element.src = _audio.srcPrefix + _audio.src;
        _audio.element.src = _audio.srcPrefix + _split(_audio.src);
        // _audio.element.src = _base64StringToAac(_split(_audio.src), 'audio/aac');
        // _audio.element.src = _base64StringToImageUrl(_split(_audio.src), 'audio/aac');
        
        // _audio.element.src = 'audio/myspace.aac';

        div.appendChild(_audio.element);
        _containerEl.appendChild(div);
        // this.frameCount = _imagesArray.length;
      }.bind(this),

      onerror: function() {},
    }, 'data/base64MySpaceAudio', _audio);

  };

  function _load(eventHandler, url, obj) {
    // url = this.url || url
    var xhr = new XMLHttpRequest();
    if (!obj) {
      this.xhr = xhr;
    } else {
      obj.xhr = xhr;
    }

    xhr.open('GET', url, true);
    
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

  function _base64StringToImageUrl(base64Str, type) {
    var decodedData = window.atob(base64Str);  // decode base64 string to an octet aka character (see http://en.wikipedia.org/wiki/Base64)
    var bitArr = new Uint8Array(new ArrayBuffer(decodedData.length));  // initialize array: each char corresponds to 8 bits that will compose an image
    for(var i = 0; i < decodedData.length; i++) {
      bitArr[i] = decodedData.charCodeAt(i);  // unsigned 8 bit integer
    }
    var blob = new Blob([bitArr], {type: type});
    var mediaURL;
    // if (window.webkitURL) {
      // mediaURL = window.webkitURL.createObjectURL(blob);
    // } else {
      mediaURL = window.URL.createObjectURL(blob);
    // }
    return mediaURL;
  };

  function _base64StringToAac(base64Str) {
    // debugger
    var decodedData = window.atob(base64Str);  // decode base64 string to an octet string (see http://en.wikipedia.org/wiki/Base64)
    var bitArr = new Uint8Array(new ArrayBuffer(decodedData.length));  // initialize array: each octet character corresponds to 8 bits that will compose an image
    for(var i = 0; i < decodedData.length; i++) {
      bitArr[i] = decodedData.charCodeAt(i);  // unsigned 8 bit integer
    }
    var blob = new Blob([bitArr], {type: 'audio/aac'});
    var audioUrl = window.URL.createObjectURL(blob);
    return audioUrl;
    // return blob;
  };

  function _updateProgressConstructor(callback, result, type) {
    var start = 0;
    var end;
    var partialArrBase64;
    var chunk;
    var chunkIndex = 0;
    var remainder = '';
    return function(oEvent) {
      if (oEvent.type && this.xhr.responseText.length) {
        end = this.xhr.responseText.length;
        chunk = this.xhr.responseText.substring(start, end);
        partialArrBase64 = _split(remainder + chunk);
        for(var i = 0; partialArrBase64.length > 1 && i < partialArrBase64.length - 1; i++) {
        // for(var i = 0; i < partialArrBase64.length - 1; i++) {
          if (false && window.URL && window.URL.createObjectURL && window.atob && Blob) {
            _imagesArrayType = 'url';
            result.push(callback(partialArrBase64[i], 'image/jpg'));
          } else {
            _imagesArrayType = 'base64';
            result.push(partialArrBase64[i]);
          }
        }
        if(chunkIndex === 0 || ( _paused && result.length % this.fps === 0 )) {
        // if(chunkIndex === 0 || (_paused && partialArrBase64.length > 23)) {
          // console.log(partialArrBase64.length);
          _paused = false;
          _play.call(this);
        }
        if(partialArrBase64.length > 1) {
        // if(partialArrBase64.length > 2) {
          remainder = partialArrBase64[partialArrBase64.length - 1];
          start = end;
          chunkIndex++;
        } else {
          console.log(partialArrBase64.length);
          // remainder = remainder + chunk;
        }
        partialArrBase64 = null;
      }
    };
  };

  function _updateProgressConstructorAudio(callback, result, type) {
    var start = 0;
    var end;
    var partialArrBase64;
    var chunk;
    var chunkIndex = 0;
    var remainder = '';
    result.src = "";
    return function(oEvent) {
      if (oEvent.type && result.xhr.responseText.length) {
        end = result.xhr.responseText.length;
        chunk = result.xhr.responseText.substring(start, end);
        result.src += chunk;
        start = end;

        // partialArrBase64 = _split(remainder + chunk);
        // for(var i = 0; i < partialArrBase64.length - 1; i++) {
        //   if (window.URL && window.URL.createObjectURL && window.atob && Blob) {
        //     _imagesArrayType = 'url';
        //     result.push(callback(partialArrBase64[i]));
        //   } else {
        //     _imagesArrayType = 'base64';
        //     result.push(partialArrBase64[i]);
        //   }
        // }
        // remainder = partialArrBase64[partialArrBase64.length - 1];
        // start = end;
        // if(chunkIndex === 0 || _paused) {
        //   _paused = false;
        //   _play.call(this);
        // }
        // chunkIndex++;
        // console.log(chunkIndex);
      }
    };
  };

  var ImagePlayer = function(url, fps, width, frameCount) {
    this.url = url;
    this.fps = fps;
    this.frameCount = frameCount;
    this.width =  width;
  };

  ImagePlayer.prototype = {
    
    autoplay: function() {
      _autoplay.call(this);
    },

    setContainer: function(containerEl) {
      _containerEl = containerEl;
      if(_containerEl.style.position === "") _containerEl.style.position = 'relative'
      // _videoEl = containerEl.getElementsByTagName('video')[0];
    },
  };


  // new audio context
  // source
  // set buffer
  var _audioContext, _audioSource, _audioBuffer;
  // _audioSource = window.parent.window._audioSource;

  if ('AudioContext' in window) {
    _audioContext = new AudioContext();
  } else if ('webkitAudioContext' in window) {
    _audioContext = new webkitAudioContext();
  } else {
    alert('Your browser does not support yet Web Audio API');
  }

  var load = (function (url) {

    console.log('Length of base63 file: ', window.parent.mySpaceAudio.length);
    var arrayBuff = window.parent.Base64Binary.decodeArrayBuffer(window.parent.mySpaceAudio);
    // var arrayBuff = Base64Binary.decodeArrayBuffer(mySpaceAudio);

    _audioContext.decodeAudioData(arrayBuff, function(audioData) {
      _audioBuffer = audioData;
      console.log('AUDIO LOADED');
      // setTimeout(function() {play()}, 2000);
      // window.onload = play;

    });
    
  
  }());

  function _audioPlay() {

    _audio.offset = 1 / this.fps * _frameIndex;
    _audioSource = _audioContext.createBufferSource();
    _audioSource.buffer = _audioBuffer;
    _audioSource.connect(_audioContext.destination);

    // _audioSource.currentTime = 10;
    // debugger
    if ('AudioContext' in window) {
      _audioSource.start(0, _audio.offset);
    } else if ('webkitAudioContext' in window) {
      // _audioSource.noteOn(0, 10);
      _audioSource.start(0, _audio.offset);
      console.log('AUDIO should be playing');
    }   
    _audio.source = _audioSource;
  };

  return ImagePlayer;

})();


  // window.parent.document.body.addEventListener('click', function() {play()});

window.parent.onload = run;

function run() {
  var scriptURL = _getScriptURL();
  var queryObj = _queryStringToObject(scriptURL);
  var im = new Sugr.imageplayer(queryObj.url, queryObj.fps, queryObj.width);
  // var base64MySpaceAudio = window.parent.mySpaceAudio;
  console.log(window.parent, im);
  window.parent._setContainer(im);
  im.autoplay();

  function _getScriptURL() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    return myScript.src;
  };


  function _queryStringToObject(str) {
    var baseURL;
    if (typeof str !== 'string') {
      return {};
    }
    str = str.substring( str.indexOf('?') + 1 );
    str = str.trim().replace(/^(\?|#)/, '');

    if (!str) {
      return {};
    }

    return str.trim().split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];

      key = decodeURIComponent(key);
      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if(typeof val === typeof "") {
        var array = val.split(',');
        if(array.length == 1) {
          val = array[0];
        } 
        else {
          val = array;
        }
      }

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }

      return ret;
    }, {});
  };
};
