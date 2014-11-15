
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
//var rawTextData = xmlFileLoader("./data/base64Images");
//var imgArr = toImageArray(rawTextData);
var Sugr = Sugr || {};
Sugr.imageplayer = (function() {

  var _imagesArray, _imagesArrayType, _frameIndex = 0, _imageEl, _paused, _timerStart;

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
    _imageEl = document.getElementById('imageFromVideo');
    _imageEl.width = this.width;

    function render() {
      if (this.frameCount && _frameIndex == this.frameCount) return;
      if ( this.frameCount && _frameIndex === _imagesArray.length) {
        _paused = true;
        console.log("PAUSED to buffer download");
        return;
      }
      setTimeout(function() {
        _frameIndex++;
        window.requestAnimationFrame(render.bind(this));
      }.bind(this), 1000 / this.fps);
      if (_imagesArrayType === 'base64') _imageEl.src = "data:image/jpeg;base64," + _imagesArray[_frameIndex];
      if (_imagesArrayType === 'url') _imageEl.src = _imagesArray[_frameIndex];
      _imagesArray[_frameIndex] = null;
    };
    
    render.call(this);
  };

  function _appendImageElement(imgString) {
    _imageEl = document.createElement('img');
    _imageEl.id = "imageFromVideo";
    _imageEl.width = this.width;
    document.body.appendChild(_imageEl);
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
            _imagesArray.push(_base64StringToImageUrl(partialArrBase64[i]));  //Note: about 130ms on MacBook Air 2012
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
  };

  return ImagePlayer;

})();

(function run() {
  // var im = new Sugr.imageplayer("./data/base64Images_bak", 23, "320");
  var scriptURL = _getScriptURL();
  var queryObj = _queryStringToObject(scriptURL);
  var im = new Sugr.imageplayer(queryObj.url, queryObj.fps, queryObj.width);
  im.autoplay();

  function _getScriptURL() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    return myScript.src;
  };


  function _queryStringToObject(str) {
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

// if (this.readyState == 4 || w.length - k < L * 1.2) {
//     if (k > E + 5) {
//         N = true;
//         R.abort()
//     } else {
//         var F = e.substring(A + 1).split("\n").filter(function(e) {
//             return e != ""
//         });
//         A = e.lastIndexOf("\n");
//         if (this.readyState != 4)
//             F.pop();
//         F = F.map(function(e) {
//             try {
//                 return Xa(e)
//             } catch (t) {
//                 return ""
//             }
//         }).filter(function(e) {
//             return e != ""
//         });
//         w = w.concat(F)
//     }
// }

// function Xa(e) {
//             var t;
//             if (window.requestAnimationFrame) {
//                 var a = window.atob(e);
//                 var i = a.length;
//                 var r = new Uint8Array(new ArrayBuffer(i));
//                 for (var n = 0; n < i; n++) {
//                     r[n] = a.charCodeAt(n)
//                 }
//                 var l = new Blob([r], {
//                     type: "image/jpeg"
//                 });
//                 t = Qa.createObjectURL(l)
//             } else {
//                 t = "data:image/png;base64," + e
//             }
//             return t
//         }