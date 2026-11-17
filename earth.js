(function () {
  'use strict';

  /* ======================================================================
     Basics
     ====================================================================== */
  var PEOPLE = { a: 'Logan', b: '茄子萌' };
  var ME_KEY = 'qzm-me';
  var CHINA_BOX = { type: 'MultiPoint', coordinates: [[73.5, 18.2], [135.1, 53.6], [73.5, 53.6], [135.1, 18.2]] };
  var FIT_SKIP = /三沙|金门|连江/;
  var NOT_LISTED = { ALD: 1, ATC: 1, CLP: 1, CSI: 1, IOA: 1, KAS: 1, PGA: 1, USG: 1, ESB: 1, WSB: 1, KAB: 1, BJN: 1, SER: 1, SCR: 1 };
  var ONE_RECORD = { SGP: 1 };                 /* countries kept as one record instead of by region */
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
  function whoColor(w) { return w === 'b' ? 'var(--b)' : 'var(--a)'; }

  /* ======================================================================
     Shell
     ====================================================================== */
  var root = document.getElementById('earth');
  var els = {};
  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4z"/></svg>';

  function buildShell() {
    els.sky = h('div', { class: 'sky', 'aria-hidden': 'true' });
    els.globe = h('div', { class: 'globe3d', hidden: true });
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
    els.card = h('div', { class: 'pick-card', role: 'dialog', 'aria-label': '打卡', hidden: true });
    els.findIn = h('input', { type: 'search', id: 'qz-find', list: 'qz-find-list', placeholder: '搜国家或省份，比如 日本', autocomplete: 'off', enterkeyhint: 'go' });
    els.findList = h('datalist', { id: 'qz-find-list' });
    els.find = h('form', { class: 'find', role: 'search', onsubmit: function (ev) { ev.preventDefault(); find(els.findIn.value); } }, [
      h('label', { class: 'sr', for: 'qz-find' }, '搜国家或省份'), els.findIn, els.findList, h('button', { class: 'btn btn-s', type: 'submit' }, '去')
    ]);
    root.appendChild(els.sky);
    root.appendChild(h('header', { class: 'bar' }, [
      h('a', { class: 'home', href: './' }, ['←', h('span', null, '首页')]),
      h('div', { class: 'titles' }, [h('h1', null, '我们的地球'), els.crumbs]),
      h('div', { class: 'me' }, [h('span', null, '我是'), els.seg]),
      els.gear
    ]));
    root.appendChild(els.stage);
    els.stage.appendChild(els.globe);
    [els.find, els.hint, els.legend, els.count, els.banner, els.card].forEach(function (x) { els.stage.appendChild(x); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && pick && !document.querySelector('.dlg, .lb')) clearPick(); });
    root.appendChild(els.tip);
    root.appendChild(els.scrim);
    root.appendChild(els.panel);
    els.loading = h('div', { class: 'loading' }, '地图加载中…');
    els.stage.appendChild(els.loading);
    renderMe();
    renderLegend();
    if (window.QZSky) window.QZSky.mount(els.sky, { deep: true });
    barHeight();
  }
  function barHeight() { var b = root.querySelector('.bar'); if (b) root.style.setProperty('--bar-h', b.offsetHeight + 'px'); }

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
    [['var(--a)', nameOf('a') + ' 去过'], ['var(--b)', nameOf('b') + ' 去过'], ['var(--ab)', '两个人都去过']].forEach(function (x) {
      els.legend.appendChild(h('span', null, [h('i', { style: 'background:' + x[0] }), x[1]]));
    });
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
  var picking = null;
  function pickMe() {
    if (me) return Promise.resolve(me);
    if (picking) return picking;
    picking = new Promise(function (resolve) {
      var box = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dlg-box' }, [
        h('h3', null, '你是谁？'),
        h('p', null, '记下来的东西会标上你的名字。以后可以在右上角换。'),
        h('div', { class: 'dlg-actions' }, ['a', 'b'].map(function (w) {
          return h('button', { class: 'who', type: 'button', 'data-who': w, 'aria-pressed': 'true', onclick: function () { box.remove(); setMe(w); resolve(w); } }, nameOf(w));
        }).concat([h('button', { class: 'btn btn-ghost btn-s', type: 'button', onclick: function () { box.remove(); resolve(null); } }, '取消')]))
      ]));
      document.body.appendChild(box);
    });
    picking.then(function () { picking = null; });
    return picking;
  }
  function editNames() {
    var ia = h('input', { type: 'text', id: 'qz-name-a', value: nameOf('a'), maxlength: '16' });
    var ib = h('input', { type: 'text', id: 'qz-name-b', value: nameOf('b'), maxlength: '16' });
    var box = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dlg-box' }, [
      h('h3', null, '你们的名字'),
      h('label', { for: 'qz-name-a' }, ['浅蓝色的人', ia]),
      h('label', { for: 'qz-name-b' }, ['蓝绿色的人', ib]),
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
  var world = null, chinaFC = null;
  var provList = [], cityList = [], provById = {}, cityById = {}, citiesOf = {}, provGeo = {};
  var countries = [], countryById = {}, countryGeo = {}, regionById = {};
  function topo(t) { var k = Object.keys(t.objects)[0]; return topojson.feature(t, t.objects[k]); }
  function loadJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function loadProv(pid) {
    if (provGeo[pid]) return Promise.resolve(provGeo[pid]);
    return loadJSON('data/prov/' + pid + '.json').then(function (t) { provGeo[pid] = topo(t); return provGeo[pid]; });
  }
  function oneRecord(cid) { var c = countryById[cid]; return !!c && (!c.regions || !!ONE_RECORD[cid]); }
  function loadCountry(cid) {
    if (countryGeo[cid]) return Promise.resolve(countryGeo[cid]);
    var fromGlobe = function () {
      var f = world.features.filter(function (x) { return x.properties.id === cid; });
      return { type: 'FeatureCollection', features: f.map(function (x) { return { type: 'Feature', geometry: x.geometry, properties: { id: cid, name: x.properties.name, cp: countryById[cid].cp, fit: 1 } }; }) };
    };
    return loadJSON('data/world1/' + cid + '.json').then(topo, fromGlobe).then(function (fc) {
      if (!fc.features.length) fc = fromGlobe();
      fc.features.forEach(function (f) { regionById[f.properties.id] = { id: f.properties.id, name: f.properties.name, en: f.properties.en || '', country: cid }; });
      countryGeo[cid] = fc;
      return fc;
    });
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
  function merge(s, x) { s.a = s.a || x.a; s.b = s.b || x.b; s.has = s.has || x.has; return s; }
  function provStat(pid) {
    var p = provById[pid];
    if (p && p.direct) return stat(pid);
    var s = stat(pid);
    (citiesOf[pid] || []).forEach(function (c) { merge(s, stat(c.id)); });
    return s;
  }
  function countryStat(cid) {
    var s = { a: false, b: false, has: false }, pre = cid + '-';
    for (var id in live.places) if (id === cid || id.indexOf(pre) === 0) merge(s, stat(id));
    return s;
  }
  function vclass(s) { return s.a && s.b ? 'v-ab' : s.a ? 'v-a' : s.b ? 'v-b' : ''; }

  function onLive() {
    renderMe();
    renderLegend();
    restyle();
    var n = 0;
    for (var id in live.places) { var s = stat(id); if (s.a || s.b) n++; }
    els.count.textContent = '';
    els.count.appendChild(document.createTextNode('点亮了'));
    els.count.appendChild(h('b', null, String(n)));
    els.count.appendChild(document.createTextNode('个地方'));
    if (state.city) updatePanel();
    if (pick) renderCard();
  }

  /* ======================================================================
     Check in without going in: first tap picks a place, second tap enters
     ====================================================================== */
  var pick = null;
  function tap(ev, id, hash, label) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    if (pick && pick.id === id) { nav(hash); return; }
    pick = { id: id, hash: hash, label: label || info(id).name, leaf: /^#[cr]-/.test(hash) };
    if (globe) globe.idle = Date.now();
    stopSpin();
    renderCard();
    restyle();
  }
  function clearPick() {
    if (!pick) return;
    pick = null;
    els.card.hidden = true;
    els.hint.hidden = !!state.city;
    restyle();
  }
  function isPick(id) { return !!pick && pick.id === id; }
  function inside(id) {
    var n = 0;
    if (id === 'CHN') { provList.forEach(function (p) { var x = provStat(p.id); if (x.a || x.b) n++; }); return n; }
    if (provById[id] && !provById[id].direct) { (citiesOf[id] || []).forEach(function (c) { var x = stat(c.id); if (x.a || x.b) n++; }); return n; }
    if (countryById[id] && !oneRecord(id)) { for (var k in live.places) if (k.indexOf(id + '-') === 0) { var y = stat(k); if (y.a || y.b) n++; } }
    return n;
  }
  function renderCard() {
    var c = els.card, id = pick.id, i = info(id), d = live.places[id] || {}, vis = d.visited || {};
    c.textContent = '';
    var n = pick.leaf ? 0 : inside(id);
    c.appendChild(h('div', { class: 'pick-head' }, [
      h('h3', null, pick.label),
      h('span', { class: 'pick-sub' }, i.sub || ''),
      h('button', { class: 'x', type: 'button', 'aria-label': '关闭', onclick: clearPick }, '×')
    ]));
    var row = h('div', { class: 'pick-row' }, ['a', 'b'].map(function (w) {
      return h('button', { class: 'who', type: 'button', 'data-who': w, 'aria-pressed': String(!!vis[w]), onclick: function () { toggleVisit(id, w); } }, nameOf(w) + ' 去过');
    }));
    if (vis.a && vis.b) row.appendChild(h('span', { class: 'both-badge' }, '两个人都去过'));
    row.appendChild(h('button', { class: 'btn btn-leaf btn-s pick-go', type: 'button', onclick: function () { nav(pick.hash); } }, pick.leaf ? '打开记录 →' : '进去看看 →'));
    c.appendChild(row);
    c.appendChild(h('p', { class: 'pick-note' }, (n ? '里面点亮了 ' + n + ' 个地方 · ' : '') + (pick.leaf ? '再点一下也能打开' : '再点一下就进去')));
    c.hidden = false;
    els.hint.hidden = true;
  }

  /* ---- what a record is about ---- */
  function info(cid) {
    if (cid === 'CHN') return { name: '中国', sub: 'China', country: 'CHN' };
    if (provById[cid] && !cityById[cid]) return { name: provById[cid].name, sub: '中国', country: 'CHN', prov: cid };
    var c = cityById[cid];
    if (c) {
      var p = provById[c.prov];
      return { name: c.name, sub: p.direct ? '中国' : '中国 · ' + p.name, country: 'CHN', prov: c.prov };
    }
    if (countryById[cid]) return { name: countryById[cid].name, sub: countryById[cid].en, country: cid };
    var r = regionById[cid];
    if (r) return { name: r.name, sub: countryById[r.country].name + (r.en && r.en !== r.name ? ' · ' + r.en : ''), country: r.country };
    return { name: cid, sub: '', country: '' };
  }

  /* ---- writes ---- */
  function placeDoc(cid) { return db.collection('places').doc(cid); }
  function base(cid) { var i = info(cid), o = { name: i.name, country: i.country, updated: Date.now() }; if (i.prov) o.prov = i.prov; return o; }
  function write(p) { return p.catch(function () { toast('没保存上，检查一下网络再试'); }); }
  function needDb() { if (!db) { toast('连不上数据库，保存不了'); return false; } return true; }

  function toggleVisit(cid, w) {
    if (!needDb()) return;
    var d = live.places[cid] || {}, cur = !!(d.visited && d.visited[w]);
    var o = base(cid); o.visited = {}; o.visited[w] = !cur;
    write(placeDoc(cid).set(o, { merge: true }));
  }
  function toggleSpot(cid, key, name, w, custom) {
    if (!needDb()) return;
    var d = live.places[cid] || {}, cur = !!(d.spots && d.spots[key] && d.spots[key][w]);
    var o = base(cid); o.spots = {}; o.spots[key] = { name: name }; o.spots[key][w] = !cur;
    if (custom) o.spots[key].custom = true;
    write(placeDoc(cid).set(o, { merge: true }));
  }
  function addSpot(cid, name) {
    if (!needDb()) return;
    var key = keyOf(name), o = base(cid);
    o.spots = {}; o.spots[key] = { name: name, custom: true, a: false, b: false };
    write(placeDoc(cid).set(o, { merge: true }));
  }
  function removeField(cid, group, key) {
    if (!needDb()) return;
    write(placeDoc(cid).update(new FP(group, key), FV.delete(), 'updated', Date.now()));
  }
  function addEntry(cid, group, entry) {
    if (!needDb()) return Promise.reject();
    var o = base(cid); o[group] = {}; o[group][uid()] = entry;
    return placeDoc(cid).set(o, { merge: true });
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
              return db.collection('thumbs').doc(id).set({ city: cid, country: info(cid).country, who: who, at: Date.now(), caption: '', thumb: th.data, w: full.w, h: full.h });
            }).then(function () {
              var o = base(cid); o.photos = FV.increment(1);
              return placeDoc(cid).set(o, { merge: true });
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
  var state = { level: null };
  var globe = { rot: [-104, -30, 0], proj: null, timer: null, idle: 0, drag: false };
  var cur = {};

  function size() { var r = els.stage.getBoundingClientRect(); W = Math.max(320, r.width); H = Math.max(320, r.height); }
  function freshSvg() {
    if (globe.timer) { globe.timer.stop(); globe.timer = null; }
    if (G) { els.globe.hidden = true; G.pauseAnimation(); }
    globe.draw = null; globe.paint = null;
    cur = {};
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
    svg.on('click.bg', function () { clearPick(); });
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
      if (s.a && s.b) els.tip.appendChild(h('i', { style: 'color:var(--ab)' }, '● 两个人都去过'));
      else if (s.a) els.tip.appendChild(h('i', { style: 'color:var(--a)' }, '● ' + nameOf('a')));
      else els.tip.appendChild(h('i', { style: 'color:var(--b)' }, '● ' + nameOf('b')));
    }
    els.tip.style.left = ev.clientX + 'px';
    els.tip.style.top = ev.clientY + 'px';
    els.tip.hidden = false;
  }
  function hideTip() { if (els.tip) els.tip.hidden = true; }
  function hoverable(sel, nameFn, statFn) {
    sel.on('pointermove.tip', function (ev, d) { if (ev.pointerType === 'mouse') showTip(ev, nameFn(d), statFn(d)); })
      .on('pointerleave.tip', hideTip);
  }
  function keyable(sel, fn) {
    sel.attr('tabindex', 0).attr('role', 'button')
      .on('keydown', function (ev, d) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(ev, d); } });
  }

  /* ---------- globe ---------- */
  function renderGlobeSvg() {
    freshSvg();
    var R = Math.min(W, H) * .4;
    var proj = globe.proj = d3.geoOrthographic().rotate(globe.rot).translate([W / 2, H / 2]).scale(R).clipAngle(90).precision(.4);
    var path = d3.geoPath(proj);
    gRoot.append('circle').attr('class', 'halo').attr('cx', W / 2).attr('cy', H / 2).attr('r', R * 1.25);
    var sphere = gRoot.append('path').datum({ type: 'Sphere' }).attr('class', 'sphere');
    var goCountry = function (ev, d) { tap(ev, d.properties.id, '#w-' + d.properties.id, d.properties.name); };
    var land = gRoot.append('g').selectAll('path').data(world.features).join('path')
      .attr('aria-label', function (d) { return d.properties.name; })
      .on('click', goCountry);
    hoverable(land, function (d) { return d.properties.name; }, function (d) { return countryStat(d.properties.id); });
    keyable(land, goCountry);
    var goChina = function (ev) { tap(ev, 'CHN', '#china', '中国'); };
    var cn = gRoot.append('g').selectAll('path').data(chinaFC.features).join('path')
      .on('click', goChina)
      .on('pointerenter', function () { cn.classed('hot', true); })
      .on('pointerleave', function () { cn.classed('hot', false); });
    hoverable(cn, function (d) { return '中国 · ' + d.properties.name; }, function (d) { return merge(provStat(d.properties.id), stat('CHN')); });
    keyable(cn.filter(function (d, i) { return i === 0; }).attr('aria-label', '中国'), goChina);
    var nightP = window.QZSun ? gRoot.append('path').attr('class', 'night') : null, nightAt = 0;
    var small = countries.filter(function (c) { return !c.poly; });
    var dots = gRoot.append('g').selectAll('circle').data(small).join('circle')
      .attr('r', 2.6)
      .on('click', function (ev, d) { tap(ev, d.id, '#w-' + d.id, d.name); });
    hoverable(dots, function (d) { return d.name; }, function (d) { return countryStat(d.id); });

    globe.paint = function () {
      land.attr('class', function (d) { return 'land ' + vclass(countryStat(d.properties.id)) + (isPick(d.properties.id) ? ' pick' : ''); });
      cn.attr('class', function (d) { return 'land cn ' + vclass(merge(provStat(d.properties.id), stat('CHN'))) + (isPick('CHN') ? ' pick' : ''); });
      dots.attr('class', function (d) { return 'gdot ' + vclass(countryStat(d.id)) + (isPick(d.id) ? ' pick' : ''); });
    };
    globe.draw = function () {
      sphere.attr('d', path);
      if (nightP) {
        if (Date.now() - nightAt > 30000) { var s = window.QZSun.at(); nightAt = Date.now(); nightP.datum(d3.geoCircle().center([s.lng + 180, -s.lat]).radius(90)()); }
        nightP.attr('d', path);
      }
      land.attr('d', path); cn.attr('d', path);
      var center = [-proj.rotate()[0], -proj.rotate()[1]];
      dots.each(function (d) {
        var vis = d3.geoDistance(d.cp, center) < Math.PI / 2 - .05, p = vis ? proj(d.cp) : null;
        d3.select(this).attr('display', p ? null : 'none').attr('cx', p ? p[0] : 0).attr('cy', p ? p[1] : 0);
      });
    };
    globe.paint();
    globe.draw();

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
        if (globe.drag || pick || Date.now() - globe.idle < 2500 || document.hidden) return;
        globe.rot = [globe.rot[0] + Math.min(dt, 50) * .0016, globe.rot[1], 0];
        proj.rotate(globe.rot); globe.draw();
      });
    }
    fadeIn();
  }
  /* ---------- the real-looking globe (WebGL), with the flat one above as a fallback ---------- */
  var G = null, glState = null, gHover = null;
  var CAP = { 'v-a': [143, 211, 255], 'v-b': [46, 200, 180], 'v-ab': [255, 77, 94] };
  function canGL() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function gid(d) { return d.properties.id; }
  function gstat(d) { return d.properties.prov ? merge(provStat(d.properties.prov), stat('CHN')) : countryStat(d.properties.id); }
  function tipHtml(name, s) {
    var x = '<b>' + esc(name) + '</b>';
    if (s.a && s.b) x += ' <span style="color:#ff4d5e">● 两个人都去过</span>';
    else if (s.a) x += ' <span style="color:#8fd3ff">● ' + esc(nameOf('a')) + '</span>';
    else if (s.b) x += ' <span style="color:#2ec8b4">● ' + esc(nameOf('b')) + '</span>';
    return x;
  }
  function initGL() {
    if (glState !== null) return glState;
    glState = false;
    if (typeof window.Globe !== 'function' || !canGL()) return false;
    try {
      G = new window.Globe(els.globe, { animateIn: false })
        .backgroundColor('rgba(0,0,0,0)')
        .globeImageUrl('img/earth.jpg?v=1')
        .bumpImageUrl('img/earth-bump.jpg?v=1')
        .showAtmosphere(true).atmosphereColor('#8ec5ff').atmosphereAltitude(.13)
        .polygonSideColor(function () { return 'rgba(0,0,0,0)'; })
        .polygonsTransitionDuration(180)
        .polygonLabel(function (d) { return tipHtml(d.properties.name, gstat(d)); })
        .onPolygonHover(function (d) { gHover = d ? gid(d) : null; els.globe.style.cursor = d ? 'pointer' : ''; refreshGL(); })
        .onPolygonClick(function (d, ev) {
          if (d.properties.prov) tap(ev, 'CHN', '#china', '中国');
          else tap(ev, d.properties.id, '#w-' + d.properties.id, d.properties.name);
        })
        .pointLat(function (d) { return d.cp[1]; }).pointLng(function (d) { return d.cp[0]; })
        .pointAltitude(.012).pointRadius(.4)
        .pointLabel(function (d) { return tipHtml(d.name, countryStat(d.id)); })
        .onPointClick(function (d, ev) { tap(ev, d.id, '#w-' + d.id, d.name); })
        .onGlobeClick(function () { clearPick(); });
      var feats = world.features.concat(chinaFC.features.map(function (f) {
        return { type: 'Feature', geometry: f.geometry, properties: { id: 'CHN', prov: f.properties.id, name: '中国 · ' + f.properties.name } };
      }));
      G.polygonsData(feats);
      G.pointsData(countries.filter(function (c) { return !c.poly; }));
      var ctl = G.controls();
      ctl.autoRotateSpeed = .3; ctl.minDistance = 106; ctl.maxDistance = 700;
      G.pointOfView(homePov());
      realEarth();
      glState = true;
    } catch (e) { G = null; glState = false; }
    return glState;
  }
  /* Where you are, roughly, from the device clock: the globe opens over your side of the world, like the iPhone wallpaper */
  function homePov() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* old browser */ }
    if (/^Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar|Hong_Kong|Macau|Taipei)$|^PRC$|^ROC$/.test(tz)) return { lat: 26, lng: 104, altitude: 2.3 };
    var south = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Fiji)|^America\/(Sao_Paulo|Argentina|Santiago|Montevideo|Asuncion|Lima|La_Paz)|^Africa\/(Johannesburg|Maputo|Harare|Windhoek)/.test(tz);
    var lng = -new Date().getTimezoneOffset() / 4;
    return { lat: south ? -25 : 35, lng: ((lng + 540) % 360) - 180, altitude: 2.3 };
  }

  /* ---------- the real Earth: today's day and night, clouds, and sharp NASA imagery up close ---------- */
  var TILE_URL = function (x, y, l) { return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/' + l + '/' + y + '/' + x + '.jpeg'; };
  var sunU = { value: null }, nightU = { value: null }, sunTimer = 0, globeMesh = null, tileGroup = null, clouds = null, tilesOn = false, curAlt = 2.3, wasNear = false, t0 = Date.now();
  var DN_HEAD = [
    'uniform sampler2D qzNight;', 'uniform vec3 qzSun;', 'varying vec3 qzN;',
    'vec2 qzUv(vec3 n) {',
    '  float lat = asin(clamp(n.y, -1.0, 1.0));',
    '  float lng = 1.5707963 - atan(n.z, n.x);',
    '  return vec2(fract((lng + 3.1415927) / 6.2831853), lat / 3.1415927 + 0.5);',
    '}'].join('\n');
  var DN_GROUND = [
    'vec3 qzM = normalize(qzN);',
    'float qzS = dot(qzM, qzSun);',
    'float qzK = smoothstep(-0.09, 0.09, qzS);',
    'vec3 qzDay = gl_FragColor.rgb * (0.6 + 0.4 * smoothstep(0.0, 0.5, qzS));',
    'vec3 qzNightC = pow(linearToOutputTexel(texture2D(qzNight, qzUv(qzM))).rgb, vec3(1.35)) * 1.2;',
    'float qzGlow = max(0.0, 1.0 - abs(qzS) / 0.1) * 0.1;',
    'gl_FragColor.rgb = mix(qzNightC, qzDay, qzK) + vec3(1.0, 0.6, 0.35) * qzGlow;'].join('\n');
  var DN_CLOUD = [
    'float qzS = dot(normalize(qzN), qzSun);',
    'gl_FragColor.rgb *= 0.18 + 0.82 * smoothstep(-0.06, 0.35, qzS);',
    'gl_FragColor.a *= mix(0.08, 1.0, smoothstep(-0.12, 0.08, qzS));'].join('\n');
  /* teach a material about the sun: lit where it is day, city lights where it is night */
  function patchDN(mat, kind) {
    if (!mat || mat.qzKind) return;
    mat.qzKind = kind;
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.qzNight = nightU; sh.uniforms.qzSun = sunU;
      sh.vertexShader = 'varying vec3 qzN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n\tqzN = normalize(mat3(modelMatrix) * normal);');
      sh.fragmentShader = DN_HEAD + '\n' + sh.fragmentShader.replace('#include <dithering_fragment>', (kind === 'cloud' ? DN_CLOUD : DN_GROUND) + '\n#include <dithering_fragment>');
    };
    mat.customProgramCacheKey = function () { return 'qz-' + kind; };
    mat.needsUpdate = true;
  }
  function setSun() {
    var s = window.QZSun.at(), p = G.getCoords(s.lat, s.lng, 0), n = Math.hypot(p.x, p.y, p.z) || 1;
    sunU.value.set(p.x / n, p.y / n, p.z / n);
  }
  /* a texture made from one of our pictures, borrowing the globe's own texture type */
  function textureFrom(img, data) {
    var map = G.globeMaterial().map, t = map.clone();
    if (t.source && t.source.constructor) t.source = new t.source.constructor(img); else t.image = img;
    if (data) t.colorSpace = '';
    t.needsUpdate = true;
    return t;
  }
  function onZoomGL(pov) {
    if (!pov || !G) return;
    var alt = curAlt = pov.altitude, ctl = G.controls();
    ctl.rotateSpeed = Math.min(1, alt * .45 + .04);
    ctl.zoomSpeed = Math.min(1, 300 * alt / (100 * (1 + alt)));
    if (alt < 1 && ctl.autoRotate) ctl.autoRotate = false;
    var near = alt < .8;
    if (near !== wasNear) { wasNear = near; refreshGL(); }
    if (clouds) clouds.material.opacity = Math.max(.45, Math.min(1, .4 + alt * .9));
    if (!tilesOn && alt < .5) { tilesOn = true; G.globeTileEngineUrl(TILE_URL); }
    else if (tilesOn && alt > .7) { tilesOn = false; G.globeTileEngineUrl(null); }
  }
  function realEarth() {
    if (typeof G.getCoords !== 'function') return;
    var scene = G.scene();
    G.globeTileEngineMaxLevel(8);
    G.onZoom(onZoomGL);
    if (!window.QZSun) return;
    sunU.value = G.camera().position.clone();
    setSun();
    clearInterval(sunTimer); sunTimer = setInterval(setSun, 30000);
    patchDN(G.globeMaterial(), 'ground');
    /* globe.gl builds its scene a moment after it starts, so look for the parts until they are there */
    function findParts() {
      if (globeMesh && tileGroup) return true;
      scene.traverse(function (o) {
        if (!globeMesh && o.material && o.material === G.globeMaterial()) {
          globeMesh = o;
          /* keep the whole-Earth picture underneath the sharp tiles, so a tile that is still loading never leaves a hole */
          o.scale.setScalar(.998);
          try { Object.defineProperty(o, 'visible', { get: function () { return true; }, set: function () {}, configurable: true }); } catch (e) { /* fine without */ }
        }
        if (!tileGroup && o.thresholds && 'tileUrl' in o) tileGroup = o;
      });
      return !!(globeMesh && tileGroup);
    }
    var before = scene.onBeforeRender;
    scene.onBeforeRender = function () {
      findParts();
      if (tileGroup && tilesOn) tileGroup.children.forEach(function (t) { if (t.material && t.material.map) patchDN(t.material, 'ground'); });
      if (clouds && globeMesh) clouds.rotation.y = globeMesh.rotation.y + (Date.now() - t0) / 1000 * .0004;
      if (before) before.apply(this, arguments);
    };
    var tries = 0;
    (function wait() {
      var mat = G.globeMaterial();
      if (!mat.map || !mat.map.image || !findParts()) { if (++tries < 300) setTimeout(wait, 100); return; }
      window.QZSun.load('img/earth-night.jpg?v=1').then(function (img) { nightU.value = textureFrom(img); }, function () {});
      window.QZSun.load('img/clouds.jpg?v=1').then(function (img) {
        if (!globeMesh) return;
        var R = typeof G.getGlobeRadius === 'function' ? G.getGlobeRadius() : 100;
        var cm = new mat.constructor({ color: 0xffffff, specular: 0x000000, shininess: 1, alphaMap: textureFrom(img, true), transparent: true, depthWrite: false });
        clouds = new globeMesh.constructor(new globeMesh.geometry.constructor(R * 1.006, 96, 64), cm);
        clouds.raycast = function () {};
        clouds.renderOrder = -1;
        clouds.rotation.y = globeMesh.rotation.y;
        patchDN(cm, 'cloud');
        cm.opacity = Math.max(.45, Math.min(1, .4 + curAlt * .9));
        scene.add(clouds);
      }, function () {});
    })();
  }
  function refreshGL() {
    if (!G) return;
    G.polygonCapColor(function (d) {
      var id = gid(d), v = vclass(gstat(d)), on = gHover === id || isPick(id);
      /* up close the colour gets lighter, so the land underneath still shows */
      if (v) return 'rgba(' + CAP[v].join(',') + ',' + (curAlt < .8 ? (on ? .45 : .24) : (on ? .78 : .5)) + ')';
      return isPick(id) ? 'rgba(255,255,255,.26)' : gHover === id ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,0)';
    }).polygonStrokeColor(function (d) {
      var id = gid(d);
      return isPick(id) ? 'rgba(255,255,255,.95)' : gHover === id ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)';
    }).polygonAltitude(function (d) {
      var id = gid(d);
      return isPick(id) ? .03 : gHover === id ? .014 : .005;
    }).pointColor(function (d) {
      var v = vclass(countryStat(d.id));
      return isPick(d.id) ? '#ffffff' : v ? 'rgb(' + CAP[v].join(',') + ')' : 'rgba(255,255,255,.8)';
    });
    G.controls().autoRotate = !reduced && !pick && state.level === 'globe' && curAlt >= 1;
  }
  function renderGlobe(back) {
    if (!initGL()) { renderGlobeSvg(); return; }
    freshSvg();
    svg.remove(); svg = null;
    els.globe.hidden = false;
    G.width(W).height(H);
    G.resumeAnimation();
    refreshGL();
    if (back && !reduced) { G.pointOfView(back, 0); G.pointOfView({ lat: back.lat, lng: back.lng, altitude: 2.3 }, 900); }
  }
  function stopSpin() {
    if (!G) return;
    var c = G.controls(), damp = c.enableDamping;
    c.autoRotate = false;
    c.enableDamping = false; c.update(); c.enableDamping = damp;
  }
  function flyGL(lat, lng, alt, done) {
    stopSpin();
    G.pointOfView({ lat: lat, lng: lng, altitude: alt }, reduced ? 0 : 1100);
    setTimeout(done, reduced ? 0 : 1150);
  }
  function backPov(from) {
    if (from.level === 'china' || from.level === 'prov') return { lat: 34, lng: 104, altitude: .75 };
    if (from.level === 'country' && countryById[from.country]) { var c = countryById[from.country]; return { lat: c.cp[1], lng: c.cp[0], altitude: Math.max(.12, Math.min(1.8, (c.r || .3) * 2.6)) }; }
    return null;
  }

  function flyGlobe(center, scale1, done) {
    if (!globe.proj || !globe.draw || reduced) { done(); return; }
    if (globe.timer) { globe.timer.stop(); globe.timer = null; }
    var proj = globe.proj, r0 = proj.rotate(), r1 = [-center[0], -center[1], 0];
    while (r0[0] - r1[0] > 180) r0[0] -= 360;
    while (r1[0] - r0[0] > 180) r0[0] += 360;
    var s0 = proj.scale(), s1 = Math.max(s0, Math.min(scale1, s0 * 40));
    var ir = d3.interpolate(r0, r1), is = d3.interpolate(s0, s1);
    gRoot.select('.halo').transition().duration(400).attr('opacity', 0);
    d3.transition().duration(1100).ease(d3.easeCubicInOut).tween('fly', function () {
      return function (t) { proj.rotate(ir(t)).scale(is(t)); if (globe.draw) globe.draw(); };
    }).on('end', function () { globe.rot = [r1[0], Math.max(-75, Math.min(75, r1[1])), 0]; done(); });
  }
  function flyToChina(done) {
    if (G && !els.globe.hidden) { flyGL(34, 104, .75, done); return; }
    flyGlobe([104.3, 35], Math.min((W - 40) / .88, (H - 40) / .66), done);
  }
  function flyToCountry(cid, done) {
    var c = countryById[cid];
    if (G && !els.globe.hidden) { flyGL(c.cp[1], c.cp[0], Math.max(.12, Math.min(1.8, (c.r || .3) * 2.6)), done); return; }
    var r = Math.max(.02, Math.min(c.r || .3, 1.2));
    flyGlobe(c.cp, Math.min(W, H) * .42 / Math.sin(r), done);
  }

  /* ---------- flat maps ---------- */
  function addZoom(maxK, onZoom) {
    zoom = d3.zoom().scaleExtent([1, maxK]).clickDistance(5).on('zoom', function (ev) {
      gRoot.attr('transform', ev.transform);
      zoomK = ev.transform.k;
      onZoom(zoomK);
      hideTip();
    });
    svg.call(zoom).on('dblclick.zoom', null);
  }
  function fitRight() { return state.city && W > 700 ? Math.min(440, W * .5) : 0; }

  function renderChina(animate) {
    freshSvg();
    var pad = Math.min(W, H) * .05;
    var proj = d3.geoMercator().fitExtent([[pad, pad + 40], [W - pad, H - pad - 40]], CHINA_BOX);
    var path = d3.geoPath(proj);
    var go = function (ev, d) { tap(ev, d.properties.id, '#p-' + d.properties.id, d.properties.name); };
    var provs = gRoot.append('g').selectAll('path').data(chinaFC.features).join('path')
      .attr('d', path)
      .attr('data-id', function (d) { return d.properties.id; })
      .attr('aria-label', function (d) { return d.properties.name; })
      .on('click', go);
    hoverable(provs, function (d) { return d.properties.name; }, function (d) { return provStat(d.properties.id); });
    keyable(provs, go);
    var base = Math.max(10, Math.min(13, W / 90));
    var dots = gRoot.append('g').selectAll('circle').data(cityList).join('circle')
      .attr('cx', function (d) { return proj(d.cp)[0]; }).attr('cy', function (d) { return proj(d.cp)[1]; });
    var OFF = { 810000: [16, 10], 820000: [-16, 12], 120000: [14, 4], 110000: [-4, -8] };
    var labels = gRoot.append('g').selectAll('text').data(chinaFC.features).join('text')
      .attr('class', 'lbl prov-l hit')
      .on('click', go)
      .attr('x', function (d) { return proj(d.properties.cp)[0] + (OFF[d.properties.id] || [0, 0])[0]; })
      .attr('y', function (d) { return proj(d.properties.cp)[1] + (OFF[d.properties.id] || [0, 0])[1]; })
      .text(function (d) { return d.properties.name; });
    function sizeAll(k) {
      labels.attr('font-size', base / k).attr('stroke-width', 3 / k).attr('dy', -6 / k);
      dots.attr('r', function (d) { return (vclass(stat(d.id)) ? 3.2 : 1.5) * Math.min(1, 2.2 / k); });
    }
    cur.restyle = function () {
      provs.attr('class', function (d) { var s = provStat(d.properties.id); return 'prov ' + vclass(s) + (s.has ? ' has' : '') + (isPick(d.properties.id) ? ' pick' : ''); });
      dots.attr('class', function (d) { return 'dot ' + vclass(stat(d.id)); });
      sizeAll(zoomK);
    };
    cur.restyle();
    addZoom(8, sizeAll);
    cur.zoomTo = function (pid, done) {
      var f = chinaFC.features.filter(function (x) { return x.properties.id === pid; })[0];
      if (!f || reduced) { done(); return; }
      zoomToBounds(path.bounds(f), provs.filter(function (d) { return d.properties.id !== pid; }), done);
    };
    if (animate) fadeIn();
  }
  function zoomToBounds(b, others, done) {
    var dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1];
    var k = Math.min(8, .85 / Math.max(dx / W, dy / H));
    var t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(b[0][0] + b[1][0]) / 2, -(b[0][1] + b[1][1]) / 2);
    others.transition().duration(500).attr('opacity', .25);
    svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.transform, t).on('end', done);
  }

  /* one region map, used for a Chinese province and for any other country */
  function renderRegions(opt, animate) {
    freshSvg();
    var fc = opt.fc, pad = Math.min(W, H) * .07, right = fitRight();
    var fit = { type: 'FeatureCollection', features: fc.features.filter(opt.fitFilter) };
    if (!fit.features.length) fit = fc;
    var proj = d3.geoMercator();
    if (opt.center) proj.rotate([-opt.center[0], 0]);
    proj.fitExtent([[pad, pad + (opt.direct ? 30 : 0)], [W - pad - right, H - pad - 40]], fit);
    var path = d3.geoPath(proj);
    var open = function (ev, d) { tap(ev, opt.idOf(d), opt.openHash(d)); };
    var shapes = gRoot.append('g').selectAll('path').data(fc.features).join('path')
      .attr('d', path)
      .attr('aria-label', function (d) { return d.properties.name; })
      .on('click', open);
    hoverable(shapes, function (d) { return opt.tipName(d); }, function (d) { return stat(opt.idOf(d)); });
    keyable(shapes, open);
    var areas = fc.features.map(function (d) { return path.area(d); });
    var base = Math.max(10, Math.min(13, W / 85));
    var labels = gRoot.append('g').selectAll('text').data(fc.features).join('text')
      .attr('class', 'lbl city-l hit' + (opt.direct ? ' dim' : ''))
      .on('click', open)
      .attr('x', function (d) { var p = proj(d.properties.cp); return p ? p[0] : -999; })
      .attr('y', function (d) { var p = proj(d.properties.cp); return p ? p[1] : -999; })
      .attr('dy', '.35em')
      .text(function (d) { return opt.label(d); });
    var title = null;
    if (opt.direct) title = gRoot.append('text').attr('class', 'globe-tag').attr('x', (W - right) / 2).attr('y', pad + 12).text(opt.title + ' · 点任意地方打开记录');
    function sizeAll(k) {
      labels.attr('font-size', base / k).attr('stroke-width', 3 / k)
        .attr('display', function (d, i) {
          if (opt.noLabels) return 'none';
          if (opt.allLabels) return null;
          var w = opt.label(d).length * base;
          return areas[i] * k * k > w * w * .55 ? null : 'none';
        });
      if (title) title.attr('font-size', 15 / k);
    }
    cur.restyle = function () {
      shapes.attr('class', function (d) {
        var id = opt.idOf(d), s = stat(id);
        return 'city ' + vclass(s) + (s.has ? ' has' : '') + (!opt.direct && state.city === id ? ' sel' : '') + (isPick(id) ? ' pick' : '');
      });
      sizeAll(zoomK);
    };
    cur.restyle();
    addZoom(opt.direct ? 12 : 14, sizeAll);
    if (animate) fadeIn();
  }
  function renderProvince(pid, fc, animate) {
    var p = provById[pid];
    renderRegions({
      fc: fc, direct: !!p.direct, title: p.name, allLabels: true,
      fitFilter: function (f) { return !FIT_SKIP.test(f.properties.name); },
      idOf: function (d) { return p.direct ? pid : d.properties.id; },
      openHash: function (d) { return '#c-' + (p.direct ? pid : d.properties.id); },
      tipName: function (d) { return p.direct ? p.name + ' · ' + d.properties.name : d.properties.name; },
      label: function (d) { return d.properties.name.replace(/(市|县)$/, ''); }
    }, animate);
  }
  function renderCountry(cid, fc, animate) {
    var c = countryById[cid], one = oneRecord(cid);
    renderRegions({
      fc: fc, direct: one, title: c.name, center: c.cp, allLabels: false, noLabels: one,
      fitFilter: function (f) { return !!f.properties.fit; },
      idOf: function (d) { return one ? cid : d.properties.id; },
      openHash: function (d) { return '#r-' + (one ? cid : d.properties.id); },
      tipName: function (d) { return one ? c.name : d.properties.name + (d.properties.en && d.properties.en !== d.properties.name ? '  ' + d.properties.en : ''); },
      label: function (d) { return d.properties.name; }
    }, animate);
  }

  function restyle() {
    if (state.level === 'globe') { if (G && !els.globe.hidden) refreshGL(); else if (globe.paint) globe.paint(); }
    else if (cur.restyle) cur.restyle();
  }

  /* ======================================================================
     Finding a place by name
     ====================================================================== */
  function fillFind() {
    var seen = {};
    els.findList.textContent = '';
    var add = function (v) { if (!seen[v]) { seen[v] = 1; els.findList.appendChild(h('option', { value: v })); } };
    add('中国');
    provList.forEach(function (p) { add(p.name); });
    countries.forEach(function (c) { add(c.name); });
  }
  var pendingPick = null;
  function focusGlobe(lat, lng, r, id, hash, label) {
    els.findIn.value = '';
    els.findIn.blur();
    var then = function () { tap(null, id, hash, label); };
    if (G && !els.globe.hidden) {
      stopSpin();
      G.pointOfView({ lat: lat, lng: lng, altitude: Math.max(1.25, Math.min(2.3, (r || .3) * 3.2)) }, reduced ? 0 : 1000);
      setTimeout(then, reduced ? 0 : 1050);
    } else if (globe.proj) flyGlobe([lng, lat], globe.proj.scale(), then);
    else then();
  }
  function find(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return;
    if (q === '中国' || q === 'china') { focusGlobe(34, 104, .5, 'CHN', '#china', '中国'); return; }
    var hit = provList.filter(function (p) { return p.name.toLowerCase() === q; })[0];
    if (hit) {
      els.findIn.value = '';
      pendingPick = { id: hit.id, hash: '#p-' + hit.id, label: hit.name };
      nav('#china');
      return;
    }
    var c = countries.filter(function (x) { return x.name.toLowerCase() === q || x.en.toLowerCase() === q; })[0]
      || countries.filter(function (x) { return x.name.toLowerCase().indexOf(q) === 0 || x.en.toLowerCase().indexOf(q) === 0; })[0]
      || countries.filter(function (x) { return x.name.toLowerCase().indexOf(q) >= 0 || x.en.toLowerCase().indexOf(q) >= 0; })[0];
    if (c) { focusGlobe(c.cp[1], c.cp[0], c.r, c.id, '#w-' + c.id, c.name); return; }
    toast('没找到“' + q + '”，换个写法试试');
  }

  /* ======================================================================
     Routing: #china  #p-<province>  #c-<city>  #w-<country>  #r-<region>
     ====================================================================== */
  function nav(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function parse() {
    var x = decodeURIComponent(location.hash.slice(1)), pre = x.slice(0, 2), id = x.slice(2);
    if (x === 'china') return { level: 'china' };
    if (pre === 'p-' && provById[id]) return { level: 'prov', prov: id };
    if (pre === 'c-' && cityById[id]) return { level: 'prov', prov: cityById[id].prov, city: id };
    if (pre === 'w-' && countryById[id]) return { level: 'country', country: id };
    if (pre === 'r-') {
      var cid = countryById[id] ? id : id.split('-')[0];
      if (countryById[cid]) return { level: 'country', country: cid, city: id };
    }
    return { level: 'globe' };
  }
  var busy = false, pending = false;
  function route() {
    if (busy) { pending = true; return; }
    var to = parse(), from = state;
    var done = function () { busy = false; if (pending) { pending = false; route(); } };
    busy = true;
    pick = null; els.card.hidden = true;
    var fail = function () { toast('地图没加载出来，刷新一下试试'); done(); };
    if (to.level === 'globe') {
      closePanel(); var back = backPov(from); state = { level: 'globe' }; renderGlobe(back); after(); done();
      return;
    }
    if (to.level === 'china') {
      closePanel();
      var go = function () {
        state = { level: 'china' }; renderChina(true); after(); done();
        if (pendingPick) { var pp = pendingPick; pendingPick = null; tap(null, pp.id, pp.hash, pp.label); }
      };
      if (from.level === 'globe') flyToChina(go); else go();
      return;
    }
    var key = to.level === 'prov' ? to.prov : to.country;
    var load = to.level === 'prov' ? loadProv : loadCountry;
    var draw = to.level === 'prov' ? renderProvince : renderCountry;
    var same = from.level === to.level && (from.prov || from.country) === key;
    load(key).then(function (fc) {
      if (to.city && !info(to.city).country) { to.city = null; }
      if (same) {
        var wasOpen = !!from.city;
        state = { level: to.level, prov: to.prov, country: to.country, city: to.city || null };
        if (state.city) openPanel(); else closePanel();
        if (wasOpen !== !!state.city && W > 700) draw(key, fc, false); else restyle();
        after(); done();
        return;
      }
      var go = function () {
        state = { level: to.level, prov: to.prov, country: to.country, city: to.city || null };
        if (state.city) openPanel(); else closePanel();
        draw(key, fc, true); after(); done();
      };
      if (to.level === 'prov' && from.level === 'china' && cur.zoomTo) cur.zoomTo(to.prov, go);
      else if (to.level === 'country' && from.level === 'globe') flyToCountry(to.country, go);
      else go();
    }, fail);
  }
  function after() {
    renderCrumbs();
    var hint = { globe: '点国家先打卡 · 再点一下进去', china: '点省份先打卡 · 再点一下进去' }[state.level];
    if (state.level === 'prov') hint = provById[state.prov].direct ? '点地图打卡 · 再点一下打开记录' : '点城市先打卡 · 再点一下打开记录';
    if (state.level === 'country') hint = oneRecord(state.country) ? '点地图打卡 · 再点一下打开记录' : '点地区先打卡 · 再点一下打开记录';
    setText(els.hint, hint);
    els.hint.hidden = !!state.city || !!pick;
    els.legend.hidden = false;
    els.find.hidden = state.level !== 'globe';
  }
  function renderCrumbs() {
    var c = els.crumbs; c.textContent = '';
    var parts = [['地球', '#globe']];
    if (state.level === 'china' || state.level === 'prov') parts.push(['中国', '#china']);
    if (state.level === 'prov') {
      parts.push([provById[state.prov].name, '#p-' + state.prov]);
      if (state.city && !provById[state.prov].direct) parts.push([cityById[state.city].name, null]);
    }
    if (state.level === 'country') {
      parts.push([countryById[state.country].name, '#w-' + state.country]);
      if (state.city && !oneRecord(state.country)) parts.push([info(state.city).name, null]);
    }
    parts.forEach(function (p, i) {
      if (i) c.appendChild(h('span', { class: 'sep', 'aria-hidden': 'true' }, '›'));
      if (i === parts.length - 1 || !p[1]) c.appendChild(h('b', null, p[0]));
      else c.appendChild(h('button', { type: 'button', onclick: function () { nav(p[1]); } }, p[0]));
    });
  }

  /* ======================================================================
     Record drawer
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
  function closeCity() {
    if (state.level === 'prov') nav('#p-' + state.prov);
    else if (state.level === 'country') nav('#w-' + state.country);
  }

  function entryForm(group, opts) {
    var main = opts.textarea
      ? h('textarea', { id: 'qz-' + group + '-text', placeholder: opts.placeholder, rows: '2' })
      : h('input', { type: 'text', id: 'qz-' + group + '-text', placeholder: opts.placeholder, autocomplete: 'off' });
    var price = opts.price ? h('input', { type: 'text', id: 'qz-' + group + '-price', placeholder: '价格（可不填）', autocomplete: 'off', style: 'width:9.5em;flex:none' }) : null;
    var date = h('input', { type: 'date', id: 'qz-' + group + '-date', value: today(), 'aria-label': '日期' });
    var btn = h('button', { class: 'btn btn-leaf btn-s', type: 'submit' }, '添加');
    return h('form', { class: 'form', onsubmit: function (ev) {
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
  }

  function buildPanel(cid) {
    var i = info(cid);
    pan = { city: cid };
    els.panel.textContent = '';
    els.panel.setAttribute('aria-label', i.name);
    pan.visA = h('button', { class: 'who', type: 'button', 'data-who': 'a', onclick: function () { toggleVisit(cid, 'a'); } });
    pan.visB = h('button', { class: 'who', type: 'button', 'data-who': 'b', onclick: function () { toggleVisit(cid, 'b'); } });
    pan.both = h('span', { class: 'both-badge', hidden: true }, '两个人都去过');
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
      h('div', null, [h('h2', null, i.name), pan.sub]),
      h('button', { class: 'x', type: 'button', 'aria-label': '关闭', onclick: closeCity }, '×')
    ]));
    els.panel.appendChild(h('div', { class: 'visits' }, [pan.visA, pan.visB, pan.both]));
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
  }

  function updatePanel() {
    var cid = state.city;
    if (!cid || pan.city !== cid) return;
    var d = live.places[cid] || {}, i = info(cid);
    var vis = d.visited || {}, s = stat(cid);
    setText(pan.visA, nameOf('a') + ' 去过');
    setText(pan.visB, nameOf('b') + ' 去过');
    pan.visA.setAttribute('aria-pressed', String(!!vis.a));
    pan.visB.setAttribute('aria-pressed', String(!!vis.b));
    pan.both.hidden = !(s.a && s.b);
    setText(pan.sub, i.sub);
    updatePhotos();

    /* attractions: the starter list for this place plus the ones you added */
    var sp = d.spots || {}, seen = {}, rows = [];
    ((window.QZ_SPOTS || {})[cid] || []).forEach(function (name) { var k = keyOf(name); seen[k] = 1; rows.push({ key: k, name: name, s: sp[k] || {}, custom: false }); });
    Object.keys(sp).forEach(function (k) { if (!seen[k] && sp[k] && sp[k].name) rows.push({ key: k, name: sp[k].name, s: sp[k], custom: !!sp[k].custom }); });
    pan.spots.textContent = '';
    var done = 0, together = 0;
    rows.forEach(function (r) {
      var both = !!(r.s.a && r.s.b);
      if (r.s.a || r.s.b) done++;
      if (both) together++;
      pan.spots.appendChild(h('div', { class: 'spot' + (both ? ' both' : '') }, [
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
    setText(pan.spotN, rows.length ? '去过 ' + done + ' / ' + rows.length + (together ? ' · 一起 ' + together : '') : '');

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
            h('span', { style: 'color:' + whoColor(e.who) }, nameOf(e.who)),
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
        h('span', { style: 'font-size:13px;color:' + whoColor(t.who) }, nameOf(t.who) + ' 上传'),
        h('span', { class: 'sp' }),
        h('button', { class: 'btn btn-s btn-ghost btn-danger', type: 'button', onclick: function () {
          ask('删除这张照片？', '删了就找不回来了。', '删除').then(function (ok) {
            if (!ok || !needDb()) return;
            close();
            Promise.all([db.collection('thumbs').doc(id).delete(), db.collection('photos').doc(id).delete()]).then(function () {
              var o = base(cid); o.photos = FV.increment(-1);
              return placeDoc(cid).set(o, { merge: true });
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
  Promise.all([loadJSON('data/world.json'), loadJSON('data/china.json'), loadJSON('data/places.json'), loadJSON('data/countries.json')]).then(function (r) {
    world = topo(r[0]);
    chinaFC = topo(r[1]);
    provList = r[2].provinces; cityList = r[2].cities;
    provList.forEach(function (p) { provById[p.id] = p; citiesOf[p.id] = []; });
    cityList.forEach(function (c) { cityById[c.id] = c; if (citiesOf[c.prov]) citiesOf[c.prov].push(c); });
    countries = r[3].filter(function (c) { return !NOT_LISTED[c.id]; });
    countries.sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); });
    countries.forEach(function (c) { countryById[c.id] = c; });
    fillFind();
    els.loading.remove();
    window.addEventListener('hashchange', route);
    route();
    onLive();
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        barHeight();
        var s = state;
        if (s.level === 'globe') renderGlobe(null);
        else if (s.level === 'china') renderChina(false);
        else if (s.level === 'prov') loadProv(s.prov).then(function (fc) { renderProvince(s.prov, fc, false); });
        else if (s.level === 'country') loadCountry(s.country).then(function (fc) { renderCountry(s.country, fc, false); });
      }, 200);
    });
  }).catch(function () {
    setText(els.loading, '地图没加载出来，刷新一下试试。');
  });
})();
