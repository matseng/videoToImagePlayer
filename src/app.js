if (this.readyState == 4 || w.length - k < L * 1.2) {
    if (k > E + 5) {
        N = true;
        R.abort()
    } else {
        var F = e.substring(A + 1).split("\n").filter(function(e) {
            return e != ""
        });
        A = e.lastIndexOf("\n");
        if (this.readyState != 4)
            F.pop();
        F = F.map(function(e) {
            try {
                return Xa(e)
            } catch (t) {
                return ""
            }
        }).filter(function(e) {
            return e != ""
        });
        w = w.concat(F)
    }
}

function Xa(e) {
            var t;
            if (window.requestAnimationFrame) {
                var a = window.atob(e);
                var i = a.length;
                var r = new Uint8Array(new ArrayBuffer(i));
                for (var n = 0; n < i; n++) {
                    r[n] = a.charCodeAt(n)
                }
                var l = new Blob([r], {
                    type: "image/jpeg"
                });
                t = Qa.createObjectURL(l)
            } else {
                t = "data:image/png;base64," + e
            }
            return t
        }