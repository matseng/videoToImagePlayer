
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
//var rawTextData = xmlFileLoader("./data/base64Images");
//var imgArr = toImageArray(rawTextData);
var Sugr = Sugr || {};
Sugr.support = Sugr.support || {};

Sugr.support.imageplayer = (function() {

  var _imagesArray, _frameIndex = 0, _imageEl, _paused, _timerStart;

  var ImagePlayer = function(url, fps, width, frameCount) {
    this.url = url;
    // this.imagesString;
    // _imagesArray;
    this.fps = fps;
    this.frameCount = frameCount;
    // _frameIndex = 0;
    // _paused;
    // _timerStart;
    // _imageEl;
    this.width =  width;
  }

  ImagePlayer.prototype = {

    play: function() {
      this._load();
    },

    _base64ImageToString: function(rawTextData) {
      return rawTextData.split('\n')
        .filter(function(val) {
          return val !=+ "";
        }
      )
    },

    _play: function() {
      if( !_imageEl) this._appendFirstImage(_imagesArray[_frameIndex]);
      // if(window.performance) console.log(window.performance.now() - _timerStart);
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
        _imageEl.src = "data:image/jpeg;base64," + _imagesArray[_frameIndex];
      };
      render.call(this);
      // console.log(_imagesArray.length);
    },

    _appendFirstImage: function(imgString) {
      var base64String = "data:image/jpeg;base64," + imgString;
      _imageEl = document.createElement('img');
      _imageEl.id = "imageFromVideo"
      _imageEl.src = base64String;
      document.body.appendChild(_imageEl);
    },

    _load: function() {
      var xhr;
      this.xhr = xhr = new XMLHttpRequest();
      xhr.open('GET', this.url, true);
      xhr.addEventListener('progress', this._updateProgress.bind(this), false);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 2) {
          if (window.performance && !_timerStart) _timerStart = window.performance.now();
        }
      }.bind(this);
      xhr.onload = function() {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            this.frameCount = _imagesArray.length;
          }
        }
      }.bind(this);
      xhr.onerror = function(e) {
        console.err(xhr.statusText);
      };
      xhr.send();
    },

    _updateProgress: (function(oEvent) {
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
          partialArr = this._base64ImageToString(_imagesArray[_imagesArray.length - 1] + this.xhr.responseText.substring(start, end));
          _imagesArray.pop();
          Array.prototype.push.apply(_imagesArray, partialArr)
          start = end;
          if(chunkIndex === 0 || _paused) {
            _paused = false;
            this._play();
          }
          chunkIndex++;
          console.log(chunkIndex);  //TODO: why isn't this being logged? 
        }
      };
    })(),
  };

  return ImagePlayer;

})()


var im = new Sugr.support.imageplayer("./data/base64Images_bak", 23, "320");
im.play();

// var LENGTH;
// var PAUSED;
// var INDEX = 0;
// var TIMER_START;

// playImages(imgArr, 30);

// var octetStreamURL = "http://tapenvy.com/encoded_images"; //"http://localhost:8001/data/encoded_images" //"http://m.lkqd.net/media?format=img&domain=lkqd.net&adId=1&adSystem=LKQD&vrs=3&width=690&height=460&fr=27&iq=24&url=http%3A%2F%2Fad.lkqd.net%2Fserve%2Fqa.mp4";


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