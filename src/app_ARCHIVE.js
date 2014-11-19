
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
//var rawTextData = xmlFileLoader("./data/base64Images");
//var imgArr = toImageArray(rawTextData);

function toImageArray(rawTextData) {
  return rawTextData.split('\n')
    .filter(function(val) {
      return val !=+ "";
    }
  )
};

var LENGTH;
var PAUSED;
var INDEX = 0;
var TIMER_START;

function playImages(imgArr, fps) {
  appendImage(imgArr[0]);
  if(window.performance) console.log(window.performance.now() - TIMER_START);
  var imageEl = document.getElementById('imageFromVideo');
  imageEl.width = "320";
  var src;
  function render(i) {
    if (i == imgArr.length) return;
    setTimeout(function() {
      window.requestAnimationFrame(render.bind(this, i + 1));
    }, 1000 / fps);
    imageEl.src = "data:image/png;base64," + imgArr[i];
  };
  render(1);
};

function playImages2(imgArr, fps) {
  if(window.performance) console.log(window.performance.now() - TIMER_START);
  if( !document.getElementById('imageFromVideo')) appendImage(imgArr[INDEX]);
  var imageEl = document.getElementById('imageFromVideo');
  imageEl.width = "320";
  var src;
  function render() {
    if (LENGTH && INDEX == LENGTH) return;
    if (INDEX === imgArr.length - 1) {
      PAUSED = true;
      console.log("PAUSED");
      return;
    }
    setTimeout(function() {
      INDEX++;
      window.requestAnimationFrame(render);
    }, 1000 / fps);
    imageEl.src = "data:image/jpeg;base64," + imgArr[INDEX];
  };
  render();
  console.log(imgArr.length);
};

function appendImage(imgString) {
  var t = "data:image/jpeg;base64," + imgString;
  var img = document.createElement('img');
  img.id = "imageFromVideo"
  img.src = t;
  document.body.appendChild(img);
};

// playImages(imgArr, 30);

// var octetStreamURL = "http://tapenvy.com/encoded_images"; //"http://localhost:8001/data/encoded_images" //"http://m.lkqd.net/media?format=img&domain=lkqd.net&adId=1&adSystem=LKQD&vrs=3&width=690&height=460&fr=27&iq=24&url=http%3A%2F%2Fad.lkqd.net%2Fserve%2Fqa.mp4";
// var octetStreamURL = "./data/base64Images_bak"
// var octetStreamURL = "./data/base64ImagesMySpace10x"
var octetStreamURL = "./data/base64ImagesMySpace";

var xhr = new XMLHttpRequest();
xhr.open('GET', octetStreamURL, true);
xhr.addEventListener('progress', updateProgress, false);


// progress on transfers from the server to the client (downloads)
var imgArr2 = [""];
var start = 0;
var end;
var partial;
var partialArr;
var chunkIndex = 0;

var tempStr = "";
var sum = 0;
function updateProgress (oEvent) {
  if (oEvent.type && xhr.responseText.length) {
    end = xhr.responseText.length;
    partialArr = toImageArray(imgArr2[imgArr2.length - 1] + xhr.responseText.substring(start, end));
    imgArr2.pop();
    Array.prototype.push.apply(imgArr2, partialArr)
    start = end;
    if(chunkIndex === 0 || PAUSED) {
      PAUSED = false;
      playImages2(imgArr2, 23);
    }
    chunkIndex++;
    console.log(chunkIndex);
  }
};

xhr.onload = function() {
  if(xhr.readyState === 4) {
    if(xhr.status === 200) {
      // playImages(toImageArray(xhr.responseText), 30);
      LENGTH = imgArr2.length;
    }
  }
}
xhr.onerror = function(e) {
  console.err(xhr.statusText);
};
xhr.send();
if (window.performance) TIMER_START = window.performance.now();


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