
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
//var rawTextData = xmlFileLoader("./data/base64Images");
//var imgArr = toImageArray(rawTextData);
var Sugr = Sugr || {};
Sugr.support = Sugr.support || {};

Sugr.support.imageplayer = (function() {

  var _imagesArray, _imagesArrayType, _frameIndex = 0, _imageEl, _paused, _timerStart;

  function _split(rawTextData) {
    return rawTextData.split('\n')
      .filter(function(val) {
        return val !=+ "";
      }
    )
  };

  function _play() {
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
    // var base64String = "data:image/jpeg;base64," + imgString;
    _imageEl = document.createElement('img');
    _imageEl.id = "imageFromVideo";
    _imageEl.width = this.width;
    // _imageEl.src = base64String;
    // _imageEl.src = imgString;
    document.body.appendChild(_imageEl);
    // debugger
  };

  function _autoplay() {
    _load.call(this, {
      onsend: function() {
        if (window.performance && !_timerStart) _timerStart = window.performance.now();
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
  };

  function _updateProgressConstructor_OLD() {
    var start = 0;
    var end;
    var partialArr;
    var chunkIndex = 0;
    var tempStr = "";
    var sum = 0;
    return function(oEvent) {
      _imagesArray = _imagesArray || [''];
      if (oEvent.type && this.xhr.responseText.length) {
        end = this.xhr.responseText.length;
        partialArr = _split(_imagesArray[_imagesArray.length - 1] + this.xhr.responseText.substring(start, end));
        _imagesArray.pop();
        Array.prototype.push.apply(_imagesArray, partialArr)
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

  function _base64StringToImageUrl(base64Str) {
    var decodedData = window.atob(base64Str);  // decode base64 string to "text" (see http://en.wikipedia.org/wiki/Base64)
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
          if (window.URL && window.URL.createObjectURL) {
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

var im = new Sugr.support.imageplayer("./data/base64Images_bak", 23, "320");
im.autoplay();

// var LENGTH;
// var PAUSED;
// var INDEX = 0;
// var TIMER_START;

// playImages(imgArr, 30);

// var base64StreamURL = "http://tapenvy.com/encoded_images"; //"http://localhost:8001/data/encoded_images" //"http://m.lkqd.net/media?format=img&domain=lkqd.net&adId=1&adSystem=LKQD&vrs=3&width=690&height=460&fr=27&iq=24&url=http%3A%2F%2Fad.lkqd.net%2Fserve%2Fqa.mp4";


// progress on transfers from the server to the client (downloads)






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