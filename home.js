(function () {
  'use strict';

  /* stars */
  var c = document.getElementById('stars'), dpr = Math.min(window.devicePixelRatio || 1, 2);
  function stars() {
    var w = window.innerWidth, hh = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr);
    var g = c.getContext('2d'); g.scale(dpr, dpr);
    for (var i = 0, n = Math.round(w * hh / 5000); i < n; i++) {
      g.globalAlpha = .2 + Math.random() * .6; g.fillStyle = '#fff';
      var s = Math.random() < .12 ? 1.6 : 1;
      g.fillRect(Math.random() * w, Math.random() * hh, s, s);
    }
  }
  stars();
  window.addEventListener('resize', stars);

  /* the little eggplant from the game */
  var EGG = ['....gG.....', '...gGGg....', '..GGGGGG...', '..GgPPgG...', '..KPPPPK...', '.KPLPPPPK..', '.KPLPPPPK..', 'KPLPPPPPPK.', 'KPPePPePPK.', 'KPrPPPPrPK.', 'KPPPPPPPpK.', 'KPPPPPPppK.', '.KPPPPppK..', '..KKKKKK...'];
  var COL = { G: '#7fcf5e', g: '#3f8f3a', P: '#8a45b8', p: '#6a2f96', L: '#b98be0', K: '#3a1650', e: '#2a0f3a', r: '#e58fb0' };
  try {
    var e = document.createElement('canvas'); e.width = 11; e.height = 14;
    var eg = e.getContext('2d');
    EGG.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (COL[row[x]]) { eg.fillStyle = COL[row[x]]; eg.fillRect(x, y, 1, 1); } });
    document.documentElement.style.setProperty('--egg', 'url(' + e.toDataURL() + ')');
  } catch (err) { /* no canvas: no egg */ }

  /* ---- countdown summary ---- */
  var DEFAULT_NAMES = { met: '我们认识', fly: '老婆飞到加拿大', bday: '老婆生日 😘' };
  function partsIn(tz, ms) {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
      return { y: o.year, m: o.month, d: o.day, h: o.hour % 24, mi: o.minute, s: o.second };
    } catch (err) { var d = new Date(ms); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes(), s: d.getSeconds() }; }
  }
  function wallToUtc(y, m, d, hh, mi, tz) {
    if (!tz || tz === 'local') return new Date(y, m - 1, d, hh, mi).getTime();
    var guess = Date.UTC(y, m - 1, d, hh, mi);
    function off(ms) { var p = partsIn(tz, ms); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - ms; }
    return guess - off(guess - off(guess));
  }
  function describe(ev, now) {
    var a = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(ev.date || ''); if (!a) return null;
    var t = /^(\d{1,2}):(\d{2})/.exec(ev.time || '') || [0, 0, 0];
    var y = +a[1], m = +a[2], d = +a[3], tz = ev.tz || 'local';
    var target = wallToUtc(y, m, d, +t[1], +t[2], tz);
    if (ev.repeat && now >= target) {
      var cy = partsIn(tz, now).y;
      target = wallToUtc(cy, m, d, +t[1], +t[2], tz);
      if (now >= target + 86400000) target = wallToUtc(cy + 1, m, d, +t[1], +t[2], tz);
      if (now >= target) return { name: ev.name || DEFAULT_NAMES[ev.id] || '', word: '就是今天', n: null };
    }
    var days = Math.floor(Math.abs(target - now) / 86400000);
    return now < target ? { name: ev.name || DEFAULT_NAMES[ev.id] || '', word: '还有', n: days } : { name: ev.name || DEFAULT_NAMES[ev.id] || '', word: '已经', n: days };
  }
  function showCountdown(s) {
    if (!s || !Array.isArray(s.events)) return;
    if (s.title) document.getElementById('cd-title').textContent = s.title;
    var now = Date.now(), ul = document.getElementById('cd-lines');
    ul.textContent = '';
    var main = null;
    s.events.forEach(function (ev) {
      var x = describe(ev, now); if (!x) return;
      if (ev.id === s.main) main = x;
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(x.name + ' ' + x.word));
      if (x.n != null) { var b = document.createElement('b'); b.textContent = x.n; li.appendChild(b); li.appendChild(document.createTextNode('天')); }
      ul.appendChild(li);
    });
    var n = String(main && main.n != null ? main.n : '').padStart(3, '0').slice(-3);
    ['d1', 'd2', 'd3'].forEach(function (id, i) { document.getElementById(id).textContent = n[i] || '0'; });
  }
  function fromPage() {
    return fetch('countdown.html').then(function (r) { return r.text(); }).then(function (t) {
      var m = /<script type="application\/json" id="qz-data">([\s\S]*?)<\/script>/.exec(t);
      return m ? JSON.parse(m[1]) : null;
    });
  }

  /* ---- live data ---- */
  var cfg = window.QZ_FIREBASE, fb = window.firebase, db = null;
  try { if (cfg && cfg.projectId && fb) db = (fb.apps.length ? fb.app() : fb.initializeApp(cfg)) && fb.firestore(); } catch (err) { db = null; }
  fromPage().then(showCountdown, function () {});
  if (db) {
    db.collection('pages').doc(cfg.pageId || 'xiaoqiezi').onSnapshot(function (snap) {
      if (!snap.exists) return;
      try { showCountdown(JSON.parse(snap.data().state)); } catch (err) { /* keep the page copy */ }
    }, function () {});
    db.collection('places').onSnapshot(function (snap) {
      var lit = 0, photos = 0, names = null;
      snap.forEach(function (d) {
        var x = d.data() || {};
        if (d.id === '_people') { names = x; return; }
        var a = !!(x.visited && x.visited.a), b = !!(x.visited && x.visited.b);
        for (var k in (x.spots || {})) { if (x.spots[k] && x.spots[k].a) a = true; if (x.spots[k] && x.spots[k].b) b = true; }
        if (a || b) lit++;
        photos += Math.max(0, x.photos || 0);
      });
      var ul = document.getElementById('earth-lines');
      ul.textContent = '';
      [['点亮了', lit, '座城市'], ['一起存了', photos, '张照片']].forEach(function (r) {
        var li = document.createElement('li'), b = document.createElement('b');
        b.textContent = r[1];
        li.appendChild(document.createTextNode(r[0])); li.appendChild(b); li.appendChild(document.createTextNode(r[2]));
        ul.appendChild(li);
      });
      if (names) {
        var p = document.getElementById('names'); p.textContent = '';
        var ba = document.createElement('b'), bb = document.createElement('b');
        ba.textContent = names.a || 'Logan'; bb.textContent = names.b || '茄子萌';
        p.appendChild(ba); p.appendChild(document.createTextNode(' & ')); p.appendChild(bb);
      }
    }, function () {});
  }
})();
