
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
//var rawTextData = xmlFileLoader("./data/base64Images");
//var imgArr = toImageArray(rawTextData);

var ImagePlayer = function(url, fps, width, frameCount) {
  this.url = url;
  this.imagesString;
  this.imagesArray;
  this.fps = fps;
  this.frameCount = frameCount;
  this.frameIndex = 0;
  this.paused;
  this.timer_start;
  this.imageEl;
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
    if( !this.imageEl) this._appendFirstImage(this.imagesArray[this.frameIndex]);
    if(window.performance) console.log(window.performance.now() - this.timer_start);
    this.imageEl = document.getElementById('imageFromVideo');
    this.imageEl.width = this.width;
    function render() {
      if (this.frameCount && this.frameIndex == this.frameCount) return;
      if ( this.frameCount && this.frameIndex === this.imagesArray.length) {
        this.paused = true;
        console.log("PAUSED to buffer download");
        return;
      }
      setTimeout(function() {
        this.frameIndex++;
        window.requestAnimationFrame(render.bind(this));
      }.bind(this), 1000 / this.fps);
      this.imageEl.src = "data:image/jpeg;base64," + this.imagesArray[this.frameIndex];
    };
    render.call(this);
    // console.log(this.imagesArray.length);
  },

  _appendFirstImage: function(imgString) {
    var base64String = "data:image/jpeg;base64," + imgString;
    this.imageEl = document.createElement('img');
    this.imageEl.id = "imageFromVideo"
    this.imageEl.src = base64String;
    document.body.appendChild(this.imageEl);
  },

  _load: function() {
    // var octetStreamURL = "./data/base64Images_bak";
    var xhr;
    this.xhr = xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, true);
    xhr.addEventListener('progress', this._updateProgress.bind(this), false);
    xhr.onload = function() {
      if(xhr.readyState === 4) {
        if(xhr.status === 200) {
          this.frameCount = this.imagesArray.length;
          if (window.performance) this.timer_start = window.performance.now();
        }
      }
    }.bind(this);
    xhr.onerror = function(e) {
      console.err(xhr.statusText);
    };
    xhr.send();
  },

  _updateProgress: (function(oEvent) {
    var imgArr = this.imagesArray = [''];
    var xhr = this.xhr;
    var start = 0;
    var end;
    var partialArr;
    var chunkIndex = 0;
    var tempStr = "";
    var sum = 0;
    var that = this;
    return function(oEvent) {
      if (oEvent.type && this.xhr.responseText.length) {
        end = this.xhr.responseText.length;
        partialArr = this._base64ImageToString(imgArr[imgArr.length - 1] + this.xhr.responseText.substring(start, end));
        this.imagesArray.pop();
        Array.prototype.push.apply(imgArr, partialArr)
        start = end;
        if(chunkIndex === 0 || PAUSED) {
          PAUSED = false;
          this._play();
        }
        chunkIndex++;
        console.log(chunkIndex);  //TODO: why isn't this being logged? 
      }
    };
  })(this),
};

var im = new ImagePlayer("./data/base64Images_bak", 23, "320");
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