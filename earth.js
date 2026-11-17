(function () {
  'use strict';

  /* ======================================================================
     Basics
     ====================================================================== */
  var PEOPLE = { a: 'Logan', b: '茄子萌' };
  var ME_KEY = 'qzm-me';
  var CHINA_BOX = { type: 'MultiPoint', coordinates: [[73.5, 18.2], [135.1, 53.6], [73.5, 53.6], [135.1, 18.2]] };
  var FIT_SKIP = /三沙|金门|连江/;
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var me = null;
  try { me = localStorage.getItem(ME_KEY); } catch (e) { /* storage off */ }
  if (me !== 'a' && me !== 'b') me = null;

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  function setText(el, s) { if (el.textContent !== s) el.textContent = s; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function keyOf(name) {
    var x = 5381;
    for (var i = 0; i < name.length; i++) x = ((x << 5) + x + name.charCodeAt(i)) >>> 0;
    return 'k' + x.toString(36);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function nameOf(w) { return PEOPLE[w] || (w === 'a' ? 'Logan' : '茄子萌'); }
  function count(o) { return o ? Object.keys(o).length : 0; }

  /* ======================================================================
     Shell
     ====================================================================== */
  var root = document.getElementById('earth');
  var els = {};
  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4z"/></svg>';

  function buildShell() {
    els.stars = h('canvas', { 'aria-hidden': 'true' });
    els.crumbs = h('nav', { class: 'crumbs', 'aria-label': '位置' });
    els.meA = h('button', { type: 'button', 'data-who': 'a', onclick: function () { setMe('a'); } });
    els.meB = h('button', { type: 'button', 'data-who': 'b', onclick: function () { setMe('b'); } });
    els.seg = h('div', { class: 'seg', role: 'group', 'aria-label': '我是' }, [els.meA, els.meB]);
    els.gear = h('button', { class: 'gear', type: 'button', 'aria-label': '设置名字', onclick: editNames });
    els.gear.innerHTML = GEAR;
    els.stage = h('div', { class: 'stage' });
    els.hint = h('div', { class: 'hint', role: 'status' });
    els.legend = h('div', { class: 'legend', 'aria-hidden': 'true' });
    els.count = h('div', { class: 'count' });
    els.banner = h('div', { class: 'banner', role: 'status', hidden: true });
    els.tip = h('div', { class: 'tip', hidden: true });
    els.scrim = h('div', { class: 'scrim', onclick: closeCity });
    els.panel = h('aside', { class: 'panel', 'aria-hidden': 'true' });
    root.appendChild(h('div', { class: 'sky' }, els.stars));
    root.appendChild(h('header', { class: 'bar' }, [
      h('a', { class: 'home', href: './' }, ['←', h('span', null, '首页')]),
      h('div', { class: 'titles' }, [h('h1', null, '我们的地球'), els.crumbs]),
      h('div', { class: 'me' }, [h('span', null, '我是'), els.seg]),
      els.gear
    ]));
    root.appendChild(els.stage);
    els.stage.appendChild(els.hint);
    els.stage.appendChild(els.legend);
    els.stage.appendChild(els.count);
    els.stage.appendChild(els.banner);
    root.appendChild(els.tip);
    root.appendChild(els.scrim);
    root.appendChild(els.panel);
    els.loading = h('div', { class: 'loading' }, '地图加载中…');
    els.stage.appendChild(els.loading);
    renderMe();
    renderLegend();
    drawStars();
  }

  function renderMe() {
    setText(els.meA, nameOf('a'));
    setText(els.meB, nameOf('b'));
    els.meA.setAttribute('aria-pressed', String(me === 'a'));
    els.meB.setAttribute('aria-pressed', String(me === 'b'));
    els.seg.classList.toggle('ask', !me);
  }
  function setMe(w) {
    me = w;
    try { localStorage.setItem(ME_KEY, w); } catch (e) { /* storage off */ }
    renderMe();
    if (state.city) updatePanel();
  }
  function renderLegend() {
    els.legend.textContent = '';
    [['a', 'var(--leaf)', nameOf('a') + ' 去过'], ['b', 'var(--blush)', nameOf('b') + ' 去过'], ['ab', 'var(--gold)', '一起去过']].forEach(function (x) {
      els.legend.appendChild(h('span', null, [h('i', { style: 'background:' + x[1] }), x[2]]));
    });
  }
  function drawStars() {
    var c = els.stars, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, hh = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr);
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    var n = Math.round(w * hh / 6000);
    for (var i = 0; i < n; i++) {
      g.globalAlpha = .2 + Math.random() * .6;
      g.fillStyle = '#fff';
      var s = Math.random() < .12 ? 1.6 : 1;
      g.fillRect(Math.random() * w, Math.random() * hh, s, s);
    }
  }

  function toast(msg) {
    if (els.toast) els.toast.remove();
    els.toast = h('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(els.toast);
    var t = els.toast;
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2600);
  }
  function ask(title, text, okLabel) {
    return new Promise(function (resolve) {
      var box;
      function done(v) { box.remove(); resolve(v); }
      box = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dlg-box' }, [
        h('h3', null, title), text ? h('p', null, text) : null,
        h('div', { class: 'dlg-actions' }, [
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { done(false); } }, '取消'),
          h('button', { class: 'btn btn-danger', type: 'button', onclick: function () { done(true); } }, okLabel || '确定')
        ])
      ]));
      document.body.appendChild(box);
      box.querySelector('.btn-danger').focus();
    });
  }
  function pickMe() {
    if (me) return Promise.resolve(me);
    return new Promise(function (resolve) {
      var box = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dlg-box' }, [
        h('h3', null, '你是谁？'),
        h('p', null, '记下来的东西会标上你的名字。以后可以在右上角换。'),
        h('div', { class: 'dlg-actions' }, ['a', 'b'].map(function (w) {
          return h('button', { class: 'who', type: 'button', 'data-who': w, 'aria-pressed': 'true', onclick: function () { box.remove(); setMe(w); resolve(w); } }, nameOf(w));
        }).concat([h('button', { class: 'btn btn-ghost btn-s', type: 'button', onclick: function () { box.remove(); resolve(null); } }, '取消')]))
      ]));
      document.body.appendChild(box);
    });
  }
  function editNames() {
    var ia = h('input', { type: 'text', id: 'qz-name-a', value: nameOf('a'), maxlength: '16' });
    var ib = h('input', { type: 'text', id: 'qz-name-b', value: nameOf('b'), maxlength: '16' });
    var box = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dlg-box' }, [
      h('h3', null, '你们的名字'),
      h('label', { for: 'qz-name-a' }, ['绿色的人', ia]),
      h('label', { for: 'qz-name-b' }, ['粉色的人', ib]),
      h('div', { class: 'dlg-actions' }, [
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { box.remove(); } }, '取消'),
        h('button', { class: 'btn btn-leaf', type: 'button', onclick: function () {
          var a = ia.value.trim() || 'Logan', b = ib.value.trim() || '茄子萌';
          box.remove();
          if (!db) { toast('连不上数据库，名字没保存'); return; }
          db.collection('places').doc('_people').set({ a: a, b: b }, { merge: true }).catch(function () { toast('名字没保存上，再试一次'); });
        } }, '保存')
      ])
    ]));
    document.body.appendChild(box);
    ia.focus();
  }

  /* ======================================================================
     Map data
     ====================================================================== */
  var world = null, chinaFC = null, provList = [], cityList = [], provById = {}, cityById = {}, citiesOf = {}, provGeo = {};
  function topo(t) { var k = Object.keys(t.objects)[0]; return topojson.feature(t, t.objects[k]); }
  function loadJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function loadProv(pid) {
    if (provGeo[pid]) return Promise.resolve(provGeo[pid]);
    return loadJSON('data/prov/' + pid + '.json').then(function (t) { provGeo[pid] = topo(t); return provGeo[pid]; });
  }

  /* ======================================================================
     Live data (Firestore)
     ====================================================================== */
  var db = null, FV = null, FP = null;
  var live = { places: {} };
  var thumbs = {}, thumbUnsub = null, uploading = 0;

  function initDb() {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (!cfg || !cfg.projectId || !fb || typeof fb.initializeApp !== 'function') { showBanner('连不上同步数据库，现在只能看地图，记录存不了。'); return; }
    try {
      var app = fb.apps && fb.apps.length ? fb.app() : fb.initializeApp(cfg);
      db = fb.firestore(app);
      FV = fb.firestore.FieldValue; FP = fb.firestore.FieldPath;
    } catch (e) { db = null; showBanner('连不上同步数据库，现在只能看地图，记录存不了。'); return; }
    db.collection('places').onSnapshot(function (snap) {
      var next = {};
      snap.forEach(function (d) {
        if (d.id === '_people') {
          var p = d.data() || {};
          PEOPLE = { a: p.a || 'Logan', b: p.b || '茄子萌' };
        } else next[d.id] = d.data() || {};
      });
      live.places = next;
      hideBanner();
      onLive();
    }, function () { showBanner('同步断开了，刷新一下试试。'); });
  }
  function showBanner(t) { setText(els.banner, t); els.banner.hidden = false; }
  function hideBanner() { els.banner.hidden = true; }

  function stat(id) {
    var d = live.places[id];
    if (!d) return { a: false, b: false, has: false };
    var a = !!(d.visited && d.visited.a), b = !!(d.visited && d.visited.b);
    var sp = d.spots || {};
    for (var k in sp) { if (sp[k] && sp[k].a) a = true; if (sp[k] && sp[k].b) b = true; }
    var has = a || b || count(d.did) > 0 || count(d.saw) > 0 || count(d.bought) > 0 || (d.photos || 0) > 0;
    return { a: a, b: b, has: has };
  }
  function provStat(pid) {
    var p = provById[pid];
    if (p && p.direct) return stat(pid);
    var s = { a: false, b: false, has: false };
    (citiesOf[pid] || []).forEach(function (c) { var x = stat(c.id); s.a = s.a || x.a; s.b = s.b || x.b; s.has = s.has || x.has; });
    return s;
  }
  function vclass(s) { return s.a && s.b ? 'v-ab' : s.a ? 'v-a' : s.b ? 'v-b' : ''; }

  function onLive() {
    renderMe();
    renderLegend();
    restyle();
    var n = 0;
    cityList.forEach(function (c) { var s = stat(c.id); if (s.a || s.b) n++; });
    els.count.innerHTML = '';
    els.count.appendChild(document.createTextNode('点亮了'));
    els.count.appendChild(h('b', null, String(n)));
    els.count.appendChild(document.createTextNode('座城市'));
    if (state.city) updatePanel();
  }

  /* ---- writes ---- */
  function cityDoc(cid) { return db.collection('places').doc(cid); }
  function base(cid) { var c = cityById[cid]; return { name: c ? c.name : cid, prov: c ? c.prov : '', updated: Date.now() }; }
  function write(p) { return p.catch(function () { toast('没保存上，检查一下网络再试'); }); }
  function needDb() { if (!db) { toast('连不上数据库，保存不了'); return false; } return true; }

  function toggleVisit(cid, w) {
    if (!needDb()) return;
    var d = live.places[cid] || {}, cur = !!(d.visited && d.visited[w]);
    var o = base(cid); o.visited = {}; o.visited[w] = !cur;
    write(cityDoc(cid).set(o, { merge: true }));
  }
  function toggleSpot(cid, key, name, w, custom) {
    if (!needDb()) return;
    var d = live.places[cid] || {}, cur = !!(d.spots && d.spots[key] && d.spots[key][w]);
    var o = base(cid); o.spots = {}; o.spots[key] = { name: name }; o.spots[key][w] = !cur;
    if (custom) o.spots[key].custom = true;
    write(cityDoc(cid).set(o, { merge: true }));
  }
  function addSpot(cid, name) {
    if (!needDb()) return;
    var key = keyOf(name), o = base(cid);
    o.spots = {}; o.spots[key] = { name: name, custom: true, a: false, b: false };
    write(cityDoc(cid).set(o, { merge: true }));
  }
  function removeField(cid, group, key) {
    if (!needDb()) return;
    write(cityDoc(cid).update(new FP(group, key), FV.delete(), 'updated', Date.now()));
  }
  function addEntry(cid, group, entry) {
    if (!needDb()) return Promise.reject();
    var o = base(cid); o[group] = {}; o[group][uid()] = entry;
    return cityDoc(cid).set(o, { merge: true });
  }

  /* ---- photos ---- */
  function watchThumbs(cid) {
    if (thumbUnsub) { thumbUnsub(); thumbUnsub = null; }
    if (!db) return;
    thumbUnsub = db.collection('thumbs').where('city', '==', cid).onSnapshot(function (snap) {
      var arr = [];
      snap.forEach(function (d) { var x = d.data() || {}; x.id = d.id; arr.push(x); });
      arr.sort(function (p, q) { return (q.at || 0) - (p.at || 0); });
      thumbs[cid] = arr;
      if (state.city === cid) updatePhotos();
    }, function () { /* keep what is shown */ });
  }
  function loadImage(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return createImageBitmap(file); }).catch(function () { return viaImg(file); });
    }
    return viaImg(file);
  }
  function viaImg(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }
  function shrinkTo(img, max, qualities, limit) {
    var w = img.width || img.naturalWidth, hh = img.height || img.naturalHeight;
    var k = Math.min(1, max / Math.max(w, hh));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(hh * k));
    var g = c.getContext('2d');
    g.fillStyle = '#1d1126'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    var out = '';
    qualities.some(function (q) { out = c.toDataURL('image/jpeg', q); return out.length < limit; });
    return { data: out, w: c.width, h: c.height };
  }
  function upload(cid, files) {
    var list = Array.prototype.slice.call(files || [], 0, 20);
    if (!needDb() || !list.length) return;
    pickMe().then(function (who) {
      if (!who) return;
      uploading += list.length; updatePhotos();
      list.reduce(function (chain, file) {
        return chain.then(function () {
          return loadImage(file).then(function (img) {
            var full = shrinkTo(img, 1600, [.85, .75, .65, .55, .45], 900000);
            if (full.data.length >= 900000) full = shrinkTo(img, 1200, [.7, .55, .45], 900000);
            var th = shrinkTo(img, 420, [.72, .6], 120000);
            if (img.close) img.close();
            var id = db.collection('thumbs').doc().id;
            return db.collection('photos').doc(id).set({ city: cid, data: full.data }).then(function () {
              return db.collection('thumbs').doc(id).set({ city: cid, prov: (cityById[cid] || {}).prov || '', who: who, at: Date.now(), caption: '', thumb: th.data, w: full.w, h: full.h });
            }).then(function () {
              var o = base(cid); o.photos = FV.increment(1);
              return cityDoc(cid).set(o, { merge: true });
            });
          }).catch(function () { toast('有一张照片没传上去（格式打不开或网络断了）'); });
        }).then(function () { uploading--; updatePhotos(); });
      }, Promise.resolve());
    });
  }

  /* ======================================================================
     Map rendering
     ====================================================================== */
  var W = 0, H = 0, svg = null, gRoot = null, zoom = null, zoomK = 1;
  var state = { level: null, prov: null, city: null };
  var globe = { rot: [-104, -30, 0], proj: null, timer: null, idle: 0, drag: false };
  var cur = { proj: null, path: null };

  function size() { var r = els.stage.getBoundingClientRect(); W = Math.max(320, r.width); H = Math.max(320, r.height); }
  function freshSvg() {
    if (globe.timer) { globe.timer.stop(); globe.timer = null; }
    if (svg) svg.remove();
    size();
    svg = d3.select(els.stage).insert('svg', ':first-child').attr('viewBox', [0, 0, W, H]).attr('role', 'img');
    var defs = svg.append('defs');
    var oc = defs.append('radialGradient').attr('id', 'qz-ocean').attr('cx', '38%').attr('cy', '32%').attr('r', '75%');
    oc.append('stop').attr('offset', '0%').attr('stop-color', '#2d2052');
    oc.append('stop').attr('offset', '70%').attr('stop-color', '#170f2e');
    oc.append('stop').attr('offset', '100%').attr('stop-color', '#0e0820');
    var ha = defs.append('radialGradient').attr('id', 'qz-halo');
    ha.append('stop').attr('offset', '70%').attr('stop-color', 'rgba(155,140,255,0)');
    ha.append('stop').attr('offset', '86%').attr('stop-color', 'rgba(155,140,255,.18)');
    ha.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(155,140,255,0)');
    gRoot = svg.append('g');
    zoom = null; zoomK = 1;
    hideTip();
  }
  function fadeIn() {
    if (reduced) return;
    gRoot.attr('opacity', 0).transition().duration(380).attr('opacity', 1);
  }

  /* ---------- tooltip ---------- */
  function showTip(ev, name, s) {
    els.tip.textContent = name;
    if (s && (s.a || s.b)) {
      if (s.a) els.tip.appendChild(h('i', { style: 'color:var(--leaf)' }, '● ' + nameOf('a')));
      if (s.b) els.tip.appendChild(h('i', { style: 'color:var(--blush)' }, '● ' + nameOf('b')));
    }
    els.tip.style.left = ev.clientX + 'px';
    els.tip.style.top = ev.clientY + 'px';
    els.tip.hidden = false;
  }
  function hideTip() { if (els.tip) els.tip.hidden = true; }
  function hoverable(sel, nameFn, statFn) {
    sel.on('pointermove', function (ev, d) { if (ev.pointerType === 'mouse') showTip(ev, nameFn(d), statFn(d)); })
      .on('pointerleave', hideTip);
  }
  function keyable(sel, fn, label) {
    sel.attr('tabindex', 0).attr('role', 'button').attr('aria-label', label)
      .on('keydown', function (ev, d) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(ev, d); } });
  }

  /* ---------- globe ---------- */
  function renderGlobe() {
    freshSvg();
    var R = Math.min(W, H) * .4;
    var proj = globe.proj = d3.geoOrthographic().rotate(globe.rot).translate([W / 2, H / 2]).scale(R).clipAngle(90).precision(.4);
    var path = d3.geoPath(proj);
    gRoot.append('circle').attr('class', 'halo').attr('cx', W / 2).attr('cy', H / 2).attr('r', R * 1.25);
    var sphere = gRoot.append('path').datum({ type: 'Sphere' }).attr('class', 'sphere');
    var grat = gRoot.append('path').datum(d3.geoGraticule10()).attr('class', 'grat');
    var land = gRoot.append('g').selectAll('path').data(world.features.filter(function (f) { return f.id !== '156' && f.id !== '158'; })).join('path').attr('class', 'land');
    var cn = gRoot.append('g').selectAll('path').data(chinaFC.features).join('path')
      .attr('class', function (d) { return 'cn-globe ' + vclass(provStat(d.properties.id)); })
      .on('click', function () { nav('#china'); })
      .on('pointerenter', function () { cn.classed('hot', true); })
      .on('pointerleave', function () { cn.classed('hot', false); hideTip(); })
      .on('pointermove', function (ev, d) { if (ev.pointerType === 'mouse') showTip(ev, '中国 · ' + d.properties.name, provStat(d.properties.id)); });
    keyable(cn.filter(function (d, i) { return i === 0; }), function () { nav('#china'); }, '进入中国地图');
    var tag = gRoot.append('text').attr('class', 'globe-tag').attr('font-size', Math.max(16, R * .09)).text('中国');

    globe.draw = function () {
      sphere.attr('d', path); grat.attr('d', path);
      land.attr('d', path); cn.attr('d', path);
      var c = [104, 35.5], vis = d3.geoDistance(c, [-proj.rotate()[0], -proj.rotate()[1]]) < 1.25;
      var p = proj(c);
      tag.attr('opacity', vis ? 1 : 0).attr('x', p ? p[0] : -99).attr('y', p ? p[1] : -99);
    };
    globe.draw();
    globe.cn = cn;

    svg.call(d3.drag().clickDistance(5)
      .on('start', function () { globe.drag = true; hideTip(); })
      .on('drag', function (ev) {
        var k = 70 / proj.scale(), r = proj.rotate();
        globe.rot = [r[0] + ev.dx * k, Math.max(-75, Math.min(75, r[1] - ev.dy * k)), 0];
        proj.rotate(globe.rot); globe.draw();
      })
      .on('end', function () { globe.drag = false; globe.idle = Date.now(); }));
    globe.idle = Date.now();
    svg.on('pointermove.idle pointerdown.idle', function () { globe.idle = Date.now(); });
    if (!reduced) {
      var last = 0;
      globe.timer = d3.timer(function (t) {
        var dt = t - last; last = t;
        if (globe.drag || Date.now() - globe.idle < 2500 || document.hidden) return;
        globe.rot = [globe.rot[0] + Math.min(dt, 50) * .0016, globe.rot[1], 0];
        proj.rotate(globe.rot); globe.draw();
      });
    }
    fadeIn();
  }
  function flyToChina(done) {
    if (!globe.proj || reduced) { done(); return; }
    if (globe.timer) { globe.timer.stop(); globe.timer = null; }
    var proj = globe.proj, r0 = proj.rotate(), r1 = [-104.3, -35, 0];
    while (r0[0] - r1[0] > 180) r0[0] -= 360;
    while (r1[0] - r0[0] > 180) r0[0] += 360;
    var s0 = proj.scale(), s1 = Math.min((W - 40) / .88, (H - 40) / .66);
    var ir = d3.interpolate(r0, r1), is = d3.interpolate(s0, s1);
    gRoot.select('.halo').transition().duration(400).attr('opacity', 0);
    d3.transition().duration(1100).ease(d3.easeCubicInOut).tween('fly', function () {
      return function (t) { proj.rotate(ir(t)).scale(is(t)); globe.draw(); };
    }).on('end', function () { globe.rot = r1; done(); });
  }

  /* ---------- flat maps (China and a province) ---------- */
  function addZoom(maxK, onZoom) {
    zoom = d3.zoom().scaleExtent([1, maxK]).clickDistance(5).on('zoom', function (ev) {
      gRoot.attr('transform', ev.transform);
      zoomK = ev.transform.k;
      onZoom(zoomK);
      hideTip();
    });
    svg.call(zoom).on('dblclick.zoom', null);
  }

  function renderChina(animate) {
    freshSvg();
    var pad = Math.min(W, H) * .05;
    var proj = d3.geoMercator().fitExtent([[pad, pad], [W - pad, H - pad - 40]], CHINA_BOX);
    var path = d3.geoPath(proj);
    cur.proj = proj; cur.path = path;
    var provs = gRoot.append('g').selectAll('path').data(chinaFC.features).join('path')
      .attr('d', path)
      .attr('data-id', function (d) { return d.properties.id; })
      .on('click', function (ev, d) { nav('#p-' + d.properties.id); });
    hoverable(provs, function (d) { return d.properties.name; }, function (d) { return provStat(d.properties.id); });
    keyable(provs, function (ev, d) { nav('#p-' + d.properties.id); }, '');
    provs.attr('aria-label', function (d) { return d.properties.name; });
    var base = Math.max(10, Math.min(13, W / 90));
    var dots = gRoot.append('g').selectAll('circle').data(cityList).join('circle')
      .attr('cx', function (d) { return proj(d.cp)[0]; }).attr('cy', function (d) { return proj(d.cp)[1]; });
    var OFF = { 810000: [16, 10], 820000: [-16, 12], 120000: [14, 4], 110000: [-4, -8] };
    var labels = gRoot.append('g').selectAll('text').data(chinaFC.features).join('text')
      .attr('class', 'lbl prov-l')
      .attr('x', function (d) { return proj(d.properties.cp)[0] + (OFF[d.properties.id] || [0, 0])[0]; })
      .attr('y', function (d) { return proj(d.properties.cp)[1] + (OFF[d.properties.id] || [0, 0])[1]; })
      .text(function (d) { return d.properties.name; });
    function sizeAll(k) {
      labels.attr('font-size', base / k).attr('stroke-width', 3 / k).attr('dy', -6 / k);
      dots.attr('r', function (d) { return (vclass(stat(d.id)) ? 3.2 : 1.5) / Math.sqrt(k) / Math.sqrt(k) * Math.min(k, 2.2); });
    }
    cur.restyle = function () {
      provs.attr('class', function (d) { var s = provStat(d.properties.id); return 'prov ' + vclass(s) + (s.has ? ' has' : ''); });
      dots.attr('class', function (d) { return 'dot ' + vclass(stat(d.id)); });
      sizeAll(zoomK);
    };
    cur.restyle();
    addZoom(8, sizeAll);
    cur.flyTo = function (pid, done) {
      var f = chinaFC.features.filter(function (x) { return x.properties.id === pid; })[0];
      if (!f || reduced) { done(); return; }
      var b = path.bounds(f), dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1];
      var k = Math.min(8, .85 / Math.max(dx / W, dy / H));
      var t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(b[0][0] + b[1][0]) / 2, -(b[0][1] + b[1][1]) / 2);
      provs.filter(function (d) { return d.properties.id !== pid; }).transition().duration(500).attr('opacity', .25);
      svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.transform, t).on('end', done);
    };
    if (animate) fadeIn();
  }

  function renderProvince(pid, fc, animate) {
    freshSvg();
    var p = provById[pid];
    var pad = Math.min(W, H) * .07;
    var fit = { type: 'FeatureCollection', features: fc.features.filter(function (f) { return !FIT_SKIP.test(f.properties.name); }) };
    if (!fit.features.length) fit = fc;
    var right = state.city && W > 700 ? Math.min(440, W * .5) : 0;
    var proj = d3.geoMercator().fitExtent([[pad, pad], [W - pad - right, H - pad - 40]], fit);
    var path = d3.geoPath(proj);
    cur.proj = proj; cur.path = path;
    var open = function (ev, d) { nav('#c-' + (p.direct ? pid : d.properties.id)); };
    var cities = gRoot.append('g').selectAll('path').data(fc.features).join('path')
      .attr('d', path)
      .on('click', open);
    hoverable(cities, function (d) { return p.direct ? p.name + ' · ' + d.properties.name : d.properties.name; }, function (d) { return stat(p.direct ? pid : d.properties.id); });
    keyable(cities, open, '');
    cities.attr('aria-label', function (d) { return d.properties.name; });
    var base = Math.max(10, Math.min(13, W / 85));
    var labels = gRoot.append('g').selectAll('text').data(fc.features).join('text')
      .attr('class', 'lbl city-l' + (p.direct ? ' dim' : ''))
      .attr('x', function (d) { return proj(d.properties.cp)[0]; })
      .attr('y', function (d) { return proj(d.properties.cp)[1]; })
      .attr('dy', '.35em')
      .text(function (d) { return d.properties.name.replace(/(市|县)$/, ''); });
    var title = null;
    if (p.direct) {
      var c = proj(p.cp);
      title = gRoot.append('text').attr('class', 'globe-tag').attr('x', W / 2 - right / 2).attr('y', pad + 10).text(p.name + ' · 点任意地方打开记录');
    }
    function sizeAll(k) {
      labels.attr('font-size', base / k).attr('stroke-width', 3 / k);
      if (title) title.attr('font-size', 15 / k);
    }
    cur.restyle = function () {
      cities.attr('class', function (d) {
        var id = p.direct ? pid : d.properties.id, s = stat(id);
        return 'city ' + vclass(s) + (s.has ? ' has' : '') + (state.city && state.city === id && !p.direct ? ' sel' : '');
      });
      sizeAll(zoomK);
    };
    cur.restyle();
    addZoom(10, sizeAll);
    if (animate) fadeIn();
  }

  function restyle() {
    if (state.level === 'globe' && globe.cn) globe.cn.attr('class', function (d) { return 'cn-globe ' + vclass(provStat(d.properties.id)); });
    else if (cur.restyle) cur.restyle();
  }

  /* ======================================================================
     Routing: #china, #p-<province>, #c-<city>
     ====================================================================== */
  function nav(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function parse() {
    var x = location.hash.slice(1);
    if (x === 'china') return { level: 'china' };
    if (x.slice(0, 2) === 'p-' && provById[x.slice(2)]) return { level: 'prov', prov: x.slice(2) };
    if (x.slice(0, 2) === 'c-' && cityById[x.slice(2)]) return { level: 'prov', prov: cityById[x.slice(2)].prov, city: x.slice(2) };
    return { level: 'globe' };
  }
  var busy = false, pending = false;
  function route() {
    if (busy) { pending = true; return; }
    var to = parse(), from = state;
    var done = function () { busy = false; if (pending) { pending = false; route(); } };
    busy = true;
    if (to.level === 'globe') {
      closePanel(); state = { level: 'globe' }; renderGlobe(); after(); done();
    } else if (to.level === 'china') {
      closePanel();
      var go = function () { state = { level: 'china' }; renderChina(true); after(); done(); };
      if (from.level === 'globe') flyToChina(go); else go();
    } else {
      var same = from.level === 'prov' && from.prov === to.prov;
      if (same) {
        var wasOpen = !!from.city;
        state = { level: 'prov', prov: to.prov, city: to.city || null };
        if (state.city) openPanel(); else closePanel();
        if (wasOpen !== !!state.city && W > 700) { loadProv(to.prov).then(function (fc) { renderProvince(to.prov, fc, false); after(); done(); }); return; }
        restyle(); after(); done();
        return;
      }
      loadProv(to.prov).then(function (fc) {
        var go = function () {
          state = { level: 'prov', prov: to.prov, city: to.city || null };
          if (state.city) openPanel(); else closePanel();
          renderProvince(to.prov, fc, true); after(); done();
        };
        if (from.level === 'china' && cur.flyTo) cur.flyTo(to.prov, go); else go();
      }).catch(function () { toast('地图没加载出来，刷新一下试试'); done(); });
    }
  }
  function after() {
    renderCrumbs();
    var hints = { globe: '拖动转地球 · 点中国进去', china: '点省份放大 · 滚轮或双指缩放', prov: state.prov && provById[state.prov].direct ? '点地图打开你们的记录' : '点城市写你们的记录' };
    setText(els.hint, hints[state.level]);
    els.hint.hidden = !!state.city;
    els.legend.hidden = state.level === 'globe';
  }
  function renderCrumbs() {
    var c = els.crumbs; c.textContent = '';
    var parts = [['地球', '#globe']];
    if (state.level !== 'globe') parts.push(['中国', '#china']);
    if (state.level === 'prov') parts.push([provById[state.prov].name, '#p-' + state.prov]);
    if (state.city && !provById[state.prov].direct) parts.push([cityById[state.city].name, null]);
    parts.forEach(function (p, i) {
      if (i) c.appendChild(h('span', { class: 'sep', 'aria-hidden': 'true' }, '›'));
      if (i === parts.length - 1 || !p[1]) c.appendChild(h('b', null, p[0]));
      else c.appendChild(h('button', { type: 'button', onclick: function () { nav(p[1]); } }, p[0]));
    });
  }

  /* ======================================================================
     City drawer
     ====================================================================== */
  var pan = {};
  function openPanel() {
    var cid = state.city;
    if (pan.city !== cid) buildPanel(cid);
    root.classList.add('open');
    els.panel.setAttribute('aria-hidden', 'false');
    watchThumbs(cid);
    updatePanel();
  }
  function closePanel() {
    root.classList.remove('open');
    els.panel.setAttribute('aria-hidden', 'true');
    if (thumbUnsub) { thumbUnsub(); thumbUnsub = null; }
  }
  function closeCity() { if (state.prov) nav('#p-' + state.prov); }

  function entryForm(group, opts) {
    var main = opts.textarea
      ? h('textarea', { id: 'qz-' + group + '-text', placeholder: opts.placeholder, rows: '2' })
      : h('input', { type: 'text', id: 'qz-' + group + '-text', placeholder: opts.placeholder, autocomplete: 'off' });
    var price = opts.price ? h('input', { type: 'text', id: 'qz-' + group + '-price', placeholder: '价格（可不填）', autocomplete: 'off', style: 'width:9.5em;flex:none' }) : null;
    var date = h('input', { type: 'date', id: 'qz-' + group + '-date', value: today(), 'aria-label': '日期' });
    var btn = h('button', { class: 'btn btn-leaf btn-s', type: 'submit' }, '添加');
    var form = h('form', { class: 'form', onsubmit: function (ev) {
      ev.preventDefault();
      var text = main.value.trim();
      if (!text) { main.focus(); return; }
      pickMe().then(function (who) {
        if (!who) return;
        var e = { who: who, date: date.value || today(), at: Date.now() };
        if (opts.price) { e.item = text; e.price = price.value.trim(); } else e.text = text;
        btn.disabled = true;
        addEntry(state.city, group, e).then(function () { main.value = ''; if (price) price.value = ''; }, function () { toast('没保存上，检查一下网络再试'); })
          .then(function () { btn.disabled = false; });
      });
    } }, [
      h('label', { class: 'sr', for: 'qz-' + group + '-text' }, opts.placeholder),
      opts.price ? h('div', { class: 'form-row' }, [h('div', { class: 'grow' }, main), price]) : main,
      h('div', { class: 'form-row' }, [date, h('span', { class: 'grow' }), btn])
    ]);
    return form;
  }

  function buildPanel(cid) {
    var c = cityById[cid], p = provById[c.prov];
    pan = { city: cid };
    els.panel.textContent = '';
    els.panel.setAttribute('aria-label', c.name);
    pan.visA = h('button', { class: 'who', type: 'button', 'data-who': 'a', onclick: function () { toggleVisit(cid, 'a'); } });
    pan.visB = h('button', { class: 'who', type: 'button', 'data-who': 'b', onclick: function () { toggleVisit(cid, 'b'); } });
    pan.sub = h('p');

    var file = h('input', { type: 'file', accept: 'image/*', multiple: true, class: 'sr', tabindex: '-1', id: 'qz-photo-file', onchange: function () { upload(cid, file.files); file.value = ''; } });
    pan.grid = h('div', { class: 'grid' });
    pan.photoN = h('span', { class: 'n' });
    pan.noPhoto = h('p', { class: 'empty' }, '还没有照片。');

    pan.spots = h('div', { class: 'spots' });
    pan.spotN = h('span', { class: 'n' });
    var spotIn = h('input', { type: 'text', id: 'qz-spot-name', placeholder: '加一个景点', autocomplete: 'off', maxlength: '40' });
    var spotForm = h('form', { class: 'form', onsubmit: function (ev) {
      ev.preventDefault();
      var v = spotIn.value.trim();
      if (!v) { spotIn.focus(); return; }
      addSpot(cid, v); spotIn.value = '';
    } }, h('div', { class: 'form-row' }, [h('label', { class: 'sr', for: 'qz-spot-name' }, '景点名字'), h('div', { class: 'grow' }, spotIn), h('button', { class: 'btn btn-s', type: 'submit' }, '添加')]));

    function listSec(group, title, form) {
      var list = h('div', { class: 'entries' }), n = h('span', { class: 'n' });
      pan[group] = list; pan[group + 'N'] = n;
      return h('section', { class: 'sec' }, [h('div', { class: 'sec-h' }, [h('h3', null, title), n]), list, form]);
    }

    els.panel.appendChild(h('div', { class: 'p-head' }, [
      h('div', null, [h('h2', null, c.name), pan.sub]),
      h('button', { class: 'x', type: 'button', 'aria-label': '关闭', onclick: closeCity }, '×')
    ]));
    els.panel.appendChild(h('div', { class: 'visits' }, [pan.visA, pan.visB]));
    pan.body = h('div', { class: 'p-body' }, [
      h('section', { class: 'sec' }, [
        h('div', { class: 'sec-h' }, [h('h3', null, '照片'), pan.photoN, h('button', { class: 'btn btn-s act', type: 'button', onclick: function () { file.click(); } }, '+ 上传照片'), file]),
        pan.noPhoto, pan.grid
      ]),
      h('section', { class: 'sec' }, [h('div', { class: 'sec-h' }, [h('h3', null, '景点打卡'), pan.spotN]), pan.spots, spotForm]),
      listSec('did', '做了什么', entryForm('did', { textarea: true, placeholder: '今天一起做了什么…' })),
      listSec('saw', '看到什么', entryForm('saw', { textarea: true, placeholder: '看到了什么…' })),
      listSec('bought', '买了什么', entryForm('bought', { price: true, placeholder: '买了什么' }))
    ]);
    els.panel.appendChild(pan.body);
    pan.p = p;
  }

  function updatePanel() {
    var cid = state.city;
    if (!cid || pan.city !== cid) return;
    var d = live.places[cid] || {}, c = cityById[cid];
    var vis = d.visited || {};
    setText(pan.visA, nameOf('a') + ' 去过');
    setText(pan.visB, nameOf('b') + ' 去过');
    pan.visA.setAttribute('aria-pressed', String(!!vis.a));
    pan.visB.setAttribute('aria-pressed', String(!!vis.b));
    setText(pan.sub, pan.p.direct ? '中国' : '中国 · ' + pan.p.name);
    updatePhotos();

    /* spots: starter list for this city plus the ones you added */
    var sp = d.spots || {}, seen = {}, rows = [];
    ((window.QZ_SPOTS || {})[cid] || []).forEach(function (name) { var k = keyOf(name); seen[k] = 1; rows.push({ key: k, name: name, s: sp[k] || {}, custom: false }); });
    Object.keys(sp).forEach(function (k) { if (!seen[k] && sp[k] && sp[k].name) rows.push({ key: k, name: sp[k].name, s: sp[k], custom: !!sp[k].custom }); });
    pan.spots.textContent = '';
    var done = 0;
    rows.forEach(function (r) {
      if (r.s.a || r.s.b) done++;
      pan.spots.appendChild(h('div', { class: 'spot' }, [
        h('span', { class: 'spot-name' }, r.name),
        ['a', 'b'].map(function (w) {
          return h('button', { class: 'who mini', type: 'button', 'data-who': w, 'aria-pressed': String(!!r.s[w]), onclick: function () { toggleSpot(cid, r.key, r.name, w, r.custom); } }, nameOf(w));
        }),
        r.custom ? h('button', { class: 'rm', type: 'button', 'aria-label': '删除 ' + r.name, onclick: function () {
          ask('删除这个景点？', r.name, '删除').then(function (ok) { if (ok) removeField(cid, 'spots', r.key); });
        } }, '×') : null
      ].reduce(function (a, x) { return a.concat(x); }, [])));
    });
    if (!rows.length) pan.spots.appendChild(h('p', { class: 'empty' }, '这里还没有景点，在下面加一个。'));
    setText(pan.spotN, rows.length ? done + ' / ' + rows.length : '');

    ['did', 'saw', 'bought'].forEach(function (g) {
      var map = d[g] || {}, ids = Object.keys(map);
      ids.sort(function (x, y) { var p = map[x], q = map[y]; return (q.date || '').localeCompare(p.date || '') || (q.at || 0) - (p.at || 0); });
      var list = pan[g];
      list.textContent = '';
      ids.forEach(function (id) {
        var e = map[id] || {};
        var text = g === 'bought'
          ? h('p', { class: 'entry-text' }, [h('b', null, e.item || ''), e.price ? h('span', { class: 'price' }, e.price) : null])
          : h('p', { class: 'entry-text' }, e.text || '');
        list.appendChild(h('div', { class: 'entry', 'data-who': e.who || '' }, [
          h('div', { class: 'entry-meta' }, [
            h('span', { style: 'color:' + (e.who === 'b' ? 'var(--blush)' : 'var(--leaf)') }, nameOf(e.who)),
            h('span', null, e.date || ''),
            h('button', { class: 'rm', type: 'button', 'aria-label': '删除这条', onclick: function () {
              ask('删除这条记录？', g === 'bought' ? (e.item || '') : (e.text || '').slice(0, 60), '删除').then(function (ok) { if (ok) removeField(cid, g, id); });
            } }, '×')
          ]),
          text
        ]));
      });
      setText(pan[g + 'N'], ids.length ? String(ids.length) : '');
    });
  }

  function updatePhotos() {
    var cid = state.city;
    if (!cid || pan.city !== cid) return;
    var arr = thumbs[cid] || [];
    pan.grid.textContent = '';
    for (var i = 0; i < uploading; i++) pan.grid.appendChild(h('div', { class: 'ph busy' }, '上传中…'));
    arr.forEach(function (t) {
      var b = h('button', { class: 'ph', type: 'button', 'aria-label': t.caption || '照片', onclick: function () { viewPhoto(cid, t.id); } }, h('i', { 'data-who': t.who || '' }));
      b.style.backgroundImage = 'url("' + t.thumb + '")';
      pan.grid.appendChild(b);
    });
    pan.noPhoto.hidden = arr.length > 0 || uploading > 0;
    pan.grid.hidden = !(arr.length > 0 || uploading > 0);
    setText(pan.photoN, arr.length ? String(arr.length) : '');
  }

  function viewPhoto(cid, id) {
    var t = (thumbs[cid] || []).filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var img = h('img', { src: t.thumb, alt: t.caption || '照片', class: 'soft' });
    var cap = h('input', { type: 'text', id: 'qz-caption', value: t.caption || '', placeholder: '写一句话…', maxlength: '120' });
    var box;
    function close() { document.removeEventListener('keydown', onKey); box.remove(); }
    function onKey(ev) { if (ev.key === 'Escape') close(); }
    function saveCap() {
      var v = cap.value.trim();
      if (v === (t.caption || '') || !needDb()) return;
      db.collection('thumbs').doc(id).update({ caption: v }).then(function () { t.caption = v; toast('已保存'); }, function () { toast('没保存上，再试一次'); });
    }
    box = h('div', { class: 'lb', role: 'dialog', 'aria-modal': 'true', 'aria-label': '照片' }, [
      h('div', { class: 'lb-top' }, [
        h('span', { style: 'font-size:13px;color:' + (t.who === 'b' ? 'var(--blush)' : 'var(--leaf)') }, nameOf(t.who) + ' 上传'),
        h('span', { class: 'sp' }),
        h('button', { class: 'btn btn-s btn-ghost btn-danger', type: 'button', onclick: function () {
          ask('删除这张照片？', '删了就找不回来了。', '删除').then(function (ok) {
            if (!ok || !needDb()) return;
            close();
            Promise.all([db.collection('thumbs').doc(id).delete(), db.collection('photos').doc(id).delete()]).then(function () {
              var o = base(cid); o.photos = FV.increment(-1);
              return cityDoc(cid).set(o, { merge: true });
            }).catch(function () { toast('没删掉，再试一次'); });
          });
        } }, '删除'),
        h('button', { class: 'btn btn-s', type: 'button', onclick: close }, '关闭')
      ]),
      h('div', { class: 'lb-img', onclick: function (ev) { if (ev.target === ev.currentTarget) close(); } }, img),
      h('form', { class: 'lb-cap', onsubmit: function (ev) { ev.preventDefault(); saveCap(); } }, [
        h('label', { class: 'sr', for: 'qz-caption' }, '照片说明'), cap,
        h('button', { class: 'btn btn-leaf btn-s', type: 'submit' }, '保存')
      ])
    ]);
    document.body.appendChild(box);
    document.addEventListener('keydown', onKey);
    if (db) db.collection('photos').doc(id).get().then(function (s) {
      var d = s.exists ? s.data() : null;
      if (d && d.data) { img.src = d.data; img.classList.remove('soft'); }
    }, function () { /* keep the small one */ });
  }

  /* ======================================================================
     Go
     ====================================================================== */
  buildShell();
  initDb();
  Promise.all([loadJSON('data/world.json'), loadJSON('data/china.json'), loadJSON('data/places.json')]).then(function (r) {
    world = topo(r[0]);
    chinaFC = topo(r[1]);
    provList = r[2].provinces; cityList = r[2].cities;
    provList.forEach(function (p) { provById[p.id] = p; citiesOf[p.id] = []; });
    cityList.forEach(function (c) { cityById[c.id] = c; if (citiesOf[c.prov]) citiesOf[c.prov].push(c); });
    els.loading.remove();
    window.addEventListener('hashchange', route);
    route();
    onLive();
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        drawStars();
        var s = state; state = { level: null };
        if (s.level === 'globe') { state = s; renderGlobe(); }
        else if (s.level === 'china') { state = s; renderChina(false); }
        else if (s.level === 'prov') { state = s; loadProv(s.prov).then(function (fc) { renderProvince(s.prov, fc, false); }); }
      }, 200);
    });
  }).catch(function () {
    setText(els.loading, '地图没加载出来，刷新一下试试。');
  });
})();
