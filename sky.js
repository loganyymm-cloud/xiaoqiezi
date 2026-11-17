/* A night sky: a painted Milky Way and star field, twinkling bright stars, and the odd shooting star.
   Usage: QZSky.mount(element, { base: false, deep: true }). Draws into two canvases it adds to the element.
   deep: plain black space with a few small stars, like a photo taken from orbit. */
(function () {
  'use strict';
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  /* star colours by temperature: blue-white to warm */
  var TINTS = ['#9bb0ff', '#aabfff', '#cad7ff', '#f8f7ff', '#fff4ea', '#ffd2a1', '#ffcc6f'];
  function tint() { var r = Math.random(); return r < .12 ? TINTS[0] : r < .3 ? TINTS[1] : r < .5 ? TINTS[2] : r < .78 ? TINTS[3] : r < .9 ? TINTS[4] : r < .97 ? TINTS[5] : TINTS[6]; }

  function mount(el, opts) {
    var withBase = !(opts && opts.base === false), deep = !!(opts && opts.deep), on = true;
    var base = document.createElement('canvas'), live = document.createElement('canvas');
    [base, live].forEach(function (c) { c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; el.appendChild(c); });
    var W = 0, H = 0, dpr = 1, bright = [], meteors = [], nextMeteor = 0, raf = 0, last = 0;

    function paint() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.clientWidth || window.innerWidth; H = el.clientHeight || window.innerHeight;
      [base, live].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      var g = base.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var ang = -0.55, cx = W * .55, cy = H * .5, len = Math.hypot(W, H);
      var ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, band = Math.min(W, H) * .16;
      if (withBase) paintSpace(g, ang, cx, cy, len, ux, uy, nx, ny, band);
      paintStars(g, cx, cy, len, ux, uy, nx, ny, band);
      drawLive(0);
    }

    function paintSpace(g, ang, cx, cy, len, ux, uy, nx, ny, band) {
      if (deep) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); return; }
      /* deep space */
      var bg = g.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, Math.max(W, H) * .8);
      bg.addColorStop(0, '#0b0d1f'); bg.addColorStop(1, '#03040a');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);

      /* the Milky Way: a soft band across the sky, with warm and cool glow and dark dust */
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 70; i++) {
        var t = rnd(-.55, .55) * len, o = gauss() * band * .55;
        var x = cx + ux * t + nx * o, y = cy + uy * t + ny * o, r = rnd(.6, 1.6) * band;
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        var warm = Math.random() < .35;
        gr.addColorStop(0, warm ? 'rgba(255,214,170,.045)' : 'rgba(150,170,255,.04)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      /* faint nebula tints */
      [[.18, .25, 'rgba(120,60,160,.06)'], [.82, .78, 'rgba(40,90,160,.06)'], [.7, .2, 'rgba(160,60,90,.035)']].forEach(function (n) {
        var r2 = Math.max(W, H) * .35, ng = g.createRadialGradient(W * n[0], H * n[1], 0, W * n[0], H * n[1], r2);
        ng.addColorStop(0, n[2]); ng.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = ng; g.fillRect(0, 0, W, H);
      });
      g.globalCompositeOperation = 'source-over';
      for (var j = 0; j < 40; j++) {
        var t2 = rnd(-.5, .5) * len, o2 = gauss() * band * .25;
        var dx = cx + ux * t2 + nx * o2, dy = cy + uy * t2 + ny * o2, dr = rnd(.15, .45) * band;
        var dg = g.createRadialGradient(dx, dy, 0, dx, dy, dr);
        dg.addColorStop(0, 'rgba(3,4,10,.32)'); dg.addColorStop(1, 'rgba(3,4,10,0)');
        g.fillStyle = dg; g.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
      }
    }

    function paintStars(g, cx, cy, len, ux, uy, nx, ny, band) {
      if (deep) { paintDeepStars(g); return; }
      /* dust of faint stars, thicker along the band */
      var area = W * H, n = Math.round(area / 380);
      for (var k = 0; k < n; k++) {
        var inBand = Math.random() < .55, sx, sy;
        if (inBand) { var tt = rnd(-.55, .55) * len, oo = gauss() * band * .45; sx = cx + ux * tt + nx * oo; sy = cy + uy * tt + ny * oo; }
        else { sx = Math.random() * W; sy = Math.random() * H; }
        if (sx < 0 || sy < 0 || sx > W || sy > H) continue;
        g.globalAlpha = rnd(.15, .55);
        g.fillStyle = tint();
        var s = Math.random() < .9 ? .6 : 1;
        g.fillRect(sx, sy, s, s);
      }
      /* medium stars */
      for (var m = 0, mn = Math.round(area / 6000); m < mn; m++) {
        var mx = Math.random() * W, my = Math.random() * H, mr = rnd(.6, 1.1);
        g.globalAlpha = rnd(.5, .9); g.fillStyle = tint();
        g.beginPath(); g.arc(mx, my, mr, 0, 6.2832); g.fill();
      }
      g.globalAlpha = 1;

      /* bright stars that twinkle, drawn live */
      bright = [];
      for (var b = 0, bn = Math.max(14, Math.round(area / 24000)); b < bn; b++) {
        bright.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(.9, 1.7), c: tint(), ph: rnd(0, 6.28), sp: rnd(.6, 1.8), spike: Math.random() < .25 });
      }
    }

    function paintDeepStars(g) {
      var area = W * H;
      for (var k = 0, n = Math.round(area / 2600); k < n; k++) {
        g.globalAlpha = Math.pow(Math.random(), 2) * .45 + .06;
        g.fillStyle = Math.random() < .8 ? '#f4f6ff' : tint();
        var s = Math.random() < .85 ? .5 : .8;
        g.fillRect(Math.random() * W, Math.random() * H, s, s);
      }
      for (var m = 0, mn = Math.round(area / 45000); m < mn; m++) {
        g.globalAlpha = rnd(.35, .7); g.fillStyle = '#f7f8ff';
        g.beginPath(); g.arc(Math.random() * W, Math.random() * H, rnd(.5, .85), 0, 6.2832); g.fill();
      }
      g.globalAlpha = 1;
      bright = [];
      for (var b = 0, bn = Math.max(4, Math.round(area / 150000)); b < bn; b++) {
        bright.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(.6, 1), c: '#f4f6ff', ph: rnd(0, 6.28), sp: rnd(.3, .8), spike: false });
      }
    }

    function spawn(now) {
      var fromLeft = Math.random() < .5;
      var ang = (fromLeft ? 1 : -1) * rnd(.45, .75);
      var speed = rnd(700, 1300), life = rnd(.6, 1.15);
      meteors.push({
        x: rnd(W * .1, W * .9), y: rnd(-H * .05, H * .4),
        vx: Math.sin(ang) * speed, vy: Math.cos(ang) * speed,
        len: rnd(110, 260), life: life, age: 0, w: rnd(1, 1.8)
      });
      if (deep) { meteors[meteors.length - 1].len *= .6; meteors[meteors.length - 1].w = rnd(.7, 1.1); nextMeteor = now + rnd(14000, 32000); return; }
      nextMeteor = now + rnd(2200, 6500);
      if (Math.random() < .12) nextMeteor = now + rnd(250, 700);
    }

    function drawLive(ts) {
      var g = live.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var t = ts / 1000;
      for (var i = 0; i < bright.length; i++) {
        var s = bright[i], a = deep ? .7 + .3 * Math.sin(t * s.sp + s.ph) : .55 + .45 * Math.sin(t * s.sp + s.ph);
        g.globalAlpha = a;
        var gl = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        gl.addColorStop(0, s.c); gl.addColorStop(.25, s.c); gl.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gl; g.beginPath(); g.arc(s.x, s.y, s.r * 4, 0, 6.2832); g.fill();
        if (s.spike) {
          g.globalAlpha = a * .5; g.strokeStyle = s.c; g.lineWidth = .6;
          g.beginPath(); g.moveTo(s.x - s.r * 7, s.y); g.lineTo(s.x + s.r * 7, s.y); g.moveTo(s.x, s.y - s.r * 7); g.lineTo(s.x, s.y + s.r * 7); g.stroke();
        }
      }
      g.globalAlpha = 1;
      for (var k = meteors.length - 1; k >= 0; k--) {
        var m = meteors[k], p = m.age / m.life;
        var fade = p < .15 ? p / .15 : 1 - (p - .15) / .85;
        var hx = m.x, hy = m.y, sp = Math.hypot(m.vx, m.vy);
        var tx = hx - m.vx / sp * m.len, ty = hy - m.vy / sp * m.len;
        var tg = g.createLinearGradient(hx, hy, tx, ty);
        tg.addColorStop(0, 'rgba(255,255,255,' + (.95 * fade) + ')');
        tg.addColorStop(.3, 'rgba(190,215,255,' + (.45 * fade) + ')');
        tg.addColorStop(1, 'rgba(160,190,255,0)');
        g.strokeStyle = tg; g.lineWidth = m.w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
        var hg = g.createRadialGradient(hx, hy, 0, hx, hy, 5);
        hg.addColorStop(0, 'rgba(255,255,255,' + (.9 * fade) + ')'); hg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, 5, 0, 6.2832); g.fill();
      }
    }

    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (document.hidden) { last = ts; return; }
      var dt = Math.min(.05, (ts - (last || ts)) / 1000);
      last = ts;
      if (!nextMeteor) nextMeteor = ts + (deep ? rnd(6000, 15000) : rnd(800, 2500));
      if (ts > nextMeteor) spawn(ts);
      for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.age += dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.age > m.life) meteors.splice(i, 1);
      }
      drawLive(ts);
    }

    paint();
    if (!reduced) raf = requestAnimationFrame(loop);
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (on) paint(); }, 200); });
    return {
      repaint: paint,
      setBase: function (v) { v = !!v; if (v !== withBase) { withBase = v; if (on) paint(); } },
      setOn: function (v) {
        v = !!v; if (v === on) return; on = v;
        base.style.display = live.style.display = v ? 'block' : 'none';
        cancelAnimationFrame(raf);
        if (v) { meteors = []; paint(); if (!reduced) raf = requestAnimationFrame(loop); }
      }
    };
  }

  window.QZSky = { mount: mount };
})();
