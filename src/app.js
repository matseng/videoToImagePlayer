
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
var rawTextData = xmlFileLoader("./data/base64Images");
var imgArr = toImageArray(rawTextData);

function toImageArray(rawTextData) {
  return rawTextData.split('\n')
    .filter(function(val) {
      return val !=+ "";
    }
  )
};

function playImages(imgArr, fps) {
  appendImage(imgArr[0]);
  var imageEl = document.getElementById('imageFromVideo');
  var src;
  function render(i) {
    if (i == imgArr.length) return;
    setTimeout(function() {
      window.requestAnimationFrame(render.bind(this, i + 1));
    }, 1000 / fps);
    imageEl.src = "data:image/png;base64," + imgArr[i];
  };
  render(1);
  console.log(imgArr.length);
};

var LENGTH;
function playImages2(imgArr, fps) {
  appendImage(imgArr[0]);
  var imageEl = document.getElementById('imageFromVideo');
  var src;
  function render(i) {
    if (LENGTH && i == LENGTH) return;
    // if i === imgArr.length then need to wait for more images to load
    setTimeout(function() {
      window.requestAnimationFrame(render.bind(this, i + 1));
    }, 1000 / fps);
    imageEl.src = "data:image/png;base64," + imgArr[i];
  };
  render(1);
  console.log(imgArr.length);
};

function appendImage(imgString) {
  var t = "data:image/png;base64," + imgString;
  var img = document.createElement('img');
  img.id = "imageFromVideo"
  img.src = t;
  document.body.appendChild(img);
};

// playImages(imgArr, 30);

var octetStreamURL = "http://m.lkqd.net/media?format=img&domain=lkqd.net&adId=1&adSystem=LKQD&vrs=3&width=690&height=460&fr=27&iq=24&url=http%3A%2F%2Fad.lkqd.net%2Fserve%2Fqa.mp4";

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
    console.log(chunkIndex);
    if(chunkIndex === 0 ) {
      playImages2(imgArr2, 30);
    }
    chunkIndex++;
    console.log(chunkIndex);
    // console.log(xhr.responseText.length);
    // tempStr =  xhr.responseText.substring(start, end);
    // console.log(tempStr.length);
    // sum += tempStr.length;
    // start = end;

  } else {
    console.log("Error with progress event");
    // Unable to compute progress information since the total size is unknown
  }
  console.log(imgArr2.length);
};

xhr.onload = function() {
  if(xhr.readyState === 4) {
    if(xhr.status === 200) {
      // console.log(xhr.responseText.length);
// appendImage(imgArr[0]);
      LENGTH = xhr.responseText.length;
    }
  }
}
xhr.onerror = function(e) {
  console.err(xhr.statusText);
};
xhr.send();


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