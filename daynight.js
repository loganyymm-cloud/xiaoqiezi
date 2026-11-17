/* Where the sun is right now, and an Earth picture lit the way the real one is. */
(function () {
  'use strict';
  var RAD = Math.PI / 180;

  /* the point on Earth with the sun straight overhead (accurate to a small fraction of a degree) */
  function at(ms) {
    var d = ((ms == null ? Date.now() : ms) - Date.UTC(2000, 0, 1, 12)) / 864e5;
    var g = (357.529 + 0.98560028 * d) * RAD;
    var q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
    var e = (23.439 - 0.00000036 * d) * RAD;
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD;
    var dec = Math.asin(Math.sin(e) * Math.sin(L)) / RAD;
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    var lng = ra - gmst * 15;
    lng = ((lng % 360) + 540) % 360 - 180;
    return { lat: dec, lng: lng };
  }

  /* how high the sun is over a place, from -1 (straight below) to 1 (straight above) */
  function height(lat, lng, sun) {
    sun = sun || at();
    return Math.sin(lat * RAD) * Math.sin(sun.lat * RAD) + Math.cos(lat * RAD) * Math.cos(sun.lat * RAD) * Math.cos((lng - sun.lng) * RAD);
  }

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* a flat (equirectangular) Earth image: daylight where the sun is up, city lights where it is night */
  function bake(dayImg, nightImg, w, h, ms) {
    var sun = at(ms);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(dayImg, 0, 0, w, h);
    var day = g.getImageData(0, 0, w, h);
    g.drawImage(nightImg, 0, 0, w, h);
    var night = g.getImageData(0, 0, w, h).data, px = day.data;
    var sd = Math.sin(sun.lat * RAD), cd = Math.cos(sun.lat * RAD), cosL = new Float32Array(w);
    for (var x = 0; x < w; x++) cosL[x] = Math.cos(((x + .5) / w * 360 - 180 - sun.lng) * RAD);
    for (var y = 0; y < h; y++) {
      var lat = (90 - (y + .5) / h * 180) * RAD, a = Math.sin(lat) * sd, b = Math.cos(lat) * cd;
      for (x = 0; x < w; x++) {
        var s = a + b * cosL[x], k = smooth(-.1, .1, s), i = (y * w + x) * 4;
        var glow = Math.max(0, 1 - Math.abs(s) / .1) * .22;
        var shade = .78 + .22 * Math.max(0, s);
        px[i] = Math.min(255, night[i] * 1.15 * (1 - k) + px[i] * shade * k + 255 * glow * .9);
        px[i + 1] = Math.min(255, night[i + 1] * 1.15 * (1 - k) + px[i + 1] * shade * k + 140 * glow);
        px[i + 2] = Math.min(255, night[i + 2] * 1.15 * (1 - k) + px[i + 2] * shade * k + 70 * glow);
      }
    }
    g.putImageData(day, 0, 0);
    return c;
  }

  function load(src) {
    return new Promise(function (ok, bad) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = bad; i.src = src; });
  }

  window.QZSun = { at: at, height: height, bake: bake, load: load };
})();
