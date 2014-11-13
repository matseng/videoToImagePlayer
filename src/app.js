
// var rawTextData = xmlFileLoader("http://localhost:8000/data/base64SingleImage");
var rawTextData = xmlFileLoader("http://localhost:8000/data/base64Images");
var imgArr = rawTextData.split('\n').filter(function(val) {
  return val !=+ "";
});

function playImages(imgArr, i, fps) {
  var imageEl = document.getElementById('imageFromVideo');
  var src;
  function render(imgArr, i) {
    if (i == imgArr.length) return;
    setTimeout(function() {
      window.requestAnimationFrame(render.bind(this, imgArr, i + 1));
    }, 1000 / fps);
    imageEl.src = "data:image/png;base64," + imgArr[i];
  };
  render(imgArr, i);
};

function appendImage(imgString) {
  var t = "data:image/png;base64," + imgString;
  var img = document.createElement('img');
  img.id = "imageFromVideo"
  img.src = t;
  document.body.appendChild(img);
};

appendImage(imgArr[0]);
playImages(imgArr, 1, 30);

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