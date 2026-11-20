(function () {
  'use strict';
  /* All our trips: Toronto (places/_trip) plus every one planned here (places/_trip_<id>). */
  var Q = window.QZTrip;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var NAMES = { a: 'Logan', b: '茄子萌' };
  var me = null;
  try { me = localStorage.getItem('qzm-me'); } catch (e) { /* storage off */ }
  if (me !== 'a' && me !== 'b') me = null;
  function renderWho() {
    var box = $('who'); box.textContent = '';
    box.appendChild(el('span', 'lab', '我是'));
    ['a', 'b'].forEach(function (w) {
      var b = el('button', null, NAMES[w]); b.type = 'button';
      b.setAttribute('aria-pressed', String(me === w));
      b.onclick = function () { me = w; try { localStorage.setItem('qzm-me', w); } catch (e) { /* fine */ } renderWho(); };
      box.appendChild(b);
    });
  }
  var toastT = 0;
  function toast(t) { var x = $('toast'); x.textContent = t; x.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { x.classList.remove('on'); }, 2400); }
  function banner(t) { var b = $('banner'); if (t) { b.textContent = t; b.hidden = false; } else b.hidden = true; }

  /* docs[docId] = data */
  var docs = {};
  try { docs = JSON.parse(localStorage.getItem('qzm-trips') || '{}') || {}; } catch (e) { docs = {}; }
  function trips() {
    var out = [{ id: 'toronto', meta: Q.TORONTO, data: docs._trip || {} }];
    Object.keys(docs).forEach(function (k) {
      var id = Q.idOf(k), x = docs[k];
      if (id && id !== 'toronto' && x && x.meta && x.meta.title) out.push({ id: id, meta: x.meta, data: x });
    });
    return out;
  }

  function render() {
    var list = Q.sortTrips(trips()), ol = $('trips'); ol.textContent = '';
    var F = window.QZFly, fly = F ? F.collect(list.map(function (x) { return x.t; })) : { flights: [], stamps: [], total: { all: 0, a: 0, b: 0, n: 0 } };
    var st = $('stats'); st.textContent = '';
    [[list.length, '次旅行'], [fly.total.n, '段航班'], [F ? F.fmtKm(fly.total.all) : 0, '公里飞过'], [fly.stamps.length, '枚印章']].forEach(function (p) {
      var d = el('div', 'stat'); d.appendChild(el('b', null, String(p[0]))); d.appendChild(el('span', null, p[1])); st.appendChild(d);
    });
    list.forEach(function (x) {
      var t = x.t, m = t.meta, s = x.s, a = Q.ymd(m.start), ds = Q.days(m);
      var li = el('li'), card = el('a', 'tcard ' + s.state);
      card.href = 'trip.html' + (t.id === 'toronto' ? '' : '?t=' + encodeURIComponent(t.id));
      var stub = el('div', 'stub');
      stub.appendChild(el('span', 'y', a ? String(a.y) : ''));
      stub.appendChild(el('b', null, a ? a.m + '.' + a.d : '—'));
      stub.appendChild(el('span', 'n', ds.length + ' 天'));
      var body = el('div', 'tb');
      body.appendChild(el('p', 'kicker', (m.place || '') + (m.place ? ' · ' : '') + Q.range(m)));
      body.appendChild(el('h2', null, m.title));
      if (m.sub) body.appendChild(el('p', 'tsub', m.sub));
      var chips = el('div', 'chips');
      var stTxt = s.state === 'before' ? (s.days < 1 ? '就快出发了' : '还有 ' + s.days + ' 天') : s.state === 'during' ? '进行中 · 第 ' + (s.day + 1) + ' 天' : '去过了';
      chips.appendChild(el('span', 'chip st', stTxt));
      var n = Q.stopCount(t), c = Q.checkedStops(t);
      chips.appendChild(el('span', 'chip', n ? n + ' 个地点' + (c ? ' · 打卡 ' + c : '') : '还没排地点'));
      if (m.by && NAMES[m.by]) chips.appendChild(el('span', 'chip faint', NAMES[m.by] + ' 开的头'));
      body.appendChild(chips);
      card.append(stub, body);
      li.appendChild(card);
      ol.appendChild(li);
    });
    renderBook(fly);
  }

  /* ---------- the stamp book ---------- */
  function renderBook(fly) {
    var F = window.QZFly, box = $('book'); if (!box || !F) return;
    box.textContent = '';
    var h = el('div', 'bookhead');
    h.appendChild(el('h2', null, '印章本'));
    var t = fly.total;
    if (t.n) {
      var laps = t.all / 40075;
      h.appendChild(el('p', 'sub', '一共飞了 ' + F.fmtKm(t.all) + ' 公里（' + F.fmtKm(F.miles(t.all)) + ' 英里）· ' + (laps >= 0.1 ? '差不多绕地球 ' + laps.toFixed(laps >= 10 ? 0 : 1) + ' 圈' : '绕地球的 ' + Math.max(1, Math.round(laps * 100)) + '%')));
      var who = el('p', 'sub whos');
      ['a', 'b'].forEach(function (w) { var sp = el('span'); sp.appendChild(el('i', 'dot ' + w)); sp.appendChild(document.createTextNode(' ' + NAMES[w] + ' ' + F.fmtKm(t[w]) + ' 公里')); who.appendChild(sp); });
      h.appendChild(who);
    } else h.appendChild(el('p', 'sub', '在每次旅行的「航班 · 印章」里记下航班，落地的城市就会盖在这里。'));
    box.appendChild(h);
    if (!fly.stamps.length) { box.appendChild(el('p', 'pempty', '第一枚印章，等你们来盖')); return; }
    var g = el('div', 'stamps');
    fly.stamps.forEach(function (s) {
      var a = el('a', 'stamp'); a.href = 'trip.html' + (s.trip.id === 'toronto' ? '' : '?t=' + encodeURIComponent(s.trip.id));
      a.setAttribute('aria-label', s.city + ' 印章 · ' + s.trip.meta.title);
      var pic = el('div', 'stamp-pic'); pic.innerHTML = F.stampSVG(s);
      var fc = el('span', 'cap');
      fc.appendChild(el('b', null, s.city));
      fc.appendChild(el('span', null, (s.date || '').replace(/-/g, '.') + ' · ' + s.trip.meta.title));
      var dots = el('span', 'dots'); ['a', 'b'].forEach(function (w) { if (s.who[w]) { var i = el('i', 'dot ' + w); i.title = NAMES[w]; dots.appendChild(i); } });
      fc.appendChild(dots);
      a.append(pic, fc); g.appendChild(a);
    });
    box.appendChild(g);
  }

  /* ---------- a new trip ---------- */
  $('new-open').onclick = function () {
    $('new').hidden = false; $('new-open').hidden = true;
    if (!$('n-start').value) { $('n-start').value = Q.today(); }
    $('n-title').focus();
  };
  $('new-cancel').onclick = function () { $('new').hidden = true; $('new-open').hidden = false; };
  $('n-start').onchange = function () { if (!$('n-end').value || $('n-end').value < $('n-start').value) $('n-end').value = $('n-start').value; };
  var busy = false;
  $('new').onsubmit = function (ev) {
    ev.preventDefault();
    if (busy) return;
    if (!me) { toast('先在右上角选一下你是谁'); return; }
    var m = { title: $('n-title').value.trim(), place: $('n-place').value.trim(), start: $('n-start').value, end: $('n-end').value, sub: $('n-sub').value.trim(), by: me, at: Date.now() };
    var bad = Q.validate(m); if (bad) { toast(bad); return; }
    if (!db) { toast('连不上数据库，建不了'); return; }
    busy = true;
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
    db.collection('places').doc(Q.docId(id)).set({ meta: m }).then(function () {
      location.href = 'trip.html?t=' + id;
    }, function () { busy = false; toast('没建上，再试一次'); });
  };

  /* ---------- start ---------- */
  var db = null;
  try {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); }
  } catch (e) { db = null; }
  renderWho(); render();
  setInterval(render, 60000);
  if (!db) banner('连不上同步数据库，现在只能看。');
  else {
    db.collection('places').doc('_people').onSnapshot(function (d) {
      var p = d.exists ? d.data() : null;
      if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; renderWho(); render(); }
    }, function () {});
    var FP = firebase.firestore.FieldPath.documentId();
    var take = function (snap) {
      var next = {};
      snap.forEach(function (d) { if (Q.idOf(d.id)) next[d.id] = d.data() || {}; });
      docs = next; banner(null);
      try { localStorage.setItem('qzm-trips', JSON.stringify(docs)); } catch (e) { /* fine */ }
      render();
    };
    db.collection('places').where(FP, '>=', '_trip').where(FP, '<', '_trip').onSnapshot(take, function () {
      db.collection('places').onSnapshot(take, function () { banner('同步断开了，刷新一下试试。'); });
    });
  }
})();
