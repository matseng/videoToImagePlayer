var Sugr = Sugr || {};
Sugr.imageplayer = (function() {

  var _imagesArray = [""], _imagesArrayType, _frameIndex = 0, _containerEl, _videoEl, _imageEl, _clicked, _paused, _timerStart; 
  var _audio = {
    src: "",
    // srcPrefix: "data:audio/aac;base64,",
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
    if (window.performance && _timerStart) console.log(window.performance.now() - _timerStart);
    if( !_imageEl) {
      _appendImageElement.call(this);
    }

    function render() {
      if (this.frameCount && _frameIndex === this.frameCount) return;
      if ( this.frameCount && _frameIndex === _imagesArray.length) {
        _paused = true;
        console.log("PAUSED to buffer download");
        return;
      }
      if( _clicked ) {
        return;
      }

      setTimeout(function() {
        _frameIndex++;
        window.requestAnimationFrame(render.bind(this));
      }.bind(this), 1000 / this.fps);
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
    // _imageEl.addEventListener('touchstart', _onclick.bind(this));
    _imageEl.addEventListener('click', _onclick.bind(this));
    console.log('append image element');
  };

  function _onclick() {
    console.log("ONCLICK", _videoEl);
    _audio.element.play();
    var self = this;
    
    var seekHandler = function() {
      _videoEl.currentTime = 1 / self.fps * (_frameIndex - 2);
      _clicked = true;
      if (_imagesArrayType === 'base64') _imageEl.src = "data:image/jpeg;base64," + _imagesArray[_imagesArray.length - 1];
      if (_imagesArrayType === 'url') _imageEl.src = _imagesArray[_imagesArray.length - 1];
      _videoEl.removeEventListener('progress', seekHandler, false);
      console.log('PROGRESS and SEEK EVENT');
    };

    _videoEl.addEventListener('play', function() {
      _videoEl.addEventListener('canplaythrough', function() {
        _videoEl.addEventListener('progress', seekHandler, false);
      });
    });

    _videoEl.play();
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
        _audio.element.setAttribute('controls', true);
        _audio.element.setAttribute('autoplay', true);
        _audio.element.src = _audio.srcPrefix + _audio.src;
        // _audio.element.src = _base64StringToImageUrl(_audio.src, 'audio/aac');
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
    var imgUrl = window.URL.createObjectURL(blob);
    return imgUrl;
  };

  function _base64StringToAac(base64Str) {
    debugger
    var decodedData = window.atob(base64Str);  // decode base64 string to an octet string (see http://en.wikipedia.org/wiki/Base64)
    var bitArr = new Uint8Array(new ArrayBuffer(decodedData.length));  // initialize array: each octet character corresponds to 8 bits that will compose an image
    for(var i = 0; i < decodedData.length; i++) {
      bitArr[i] = decodedData.charCodeAt(i);  // unsigned 8 bit integer
    }
    var blob = new Blob([bitArr], {type: 'audio/aac'});
    var imgUrl = window.URL.createObjectURL(blob);
    return imgUrl;
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
        console.log(start, end);
        chunk = this.xhr.responseText.substring(start, end);
        partialArrBase64 = _split(remainder + chunk);
        for(var i = 0; i < partialArrBase64.length - 1; i++) {
          if (false && window.URL && window.URL.createObjectURL && window.atob && Blob) {
            debugger
            _imagesArrayType = 'url';
            result.push(callback(partialArrBase64[i], 'image/jpg'));
          } else {
            _imagesArrayType = 'base64';
            result.push(partialArrBase64[i]);
            // console.log(result.length);
          }
        }
        remainder = partialArrBase64[partialArrBase64.length - 1];
        partialArrBase64 = null;
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

  function _updateProgressConstructorAudio(callback, result, type) {
    var start = 0;
    var end;
    var partialArrBase64;
    var chunk;
    var chunkIndex = 0;
    var remainder = '';
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
      _videoEl = containerEl.getElementsByTagName('video')[0];
    },
  };

  return ImagePlayer;

})();


(function run() {
  var scriptURL = _getScriptURL();
  var queryObj = _queryStringToObject(scriptURL);
  var im = new Sugr.imageplayer(queryObj.url, queryObj.fps, queryObj.width);
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
})();
