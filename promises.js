(function () {
  'use strict';
  /* The promise book: both of us write promises, hook pinkies on them, and stamp them when kept.
     Everything lives in one shared document, places/_promises, as items.<id>. */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var NAMES = { a: 'Logan', b: '茄子萌' };
  var me = null;
  try { me = localStorage.getItem('qzm-me'); } catch (e) { /* storage off */ }
  if (me !== 'a' && me !== 'b') me = null;
  function other(w) { return w === 'a' ? 'b' : 'a'; }
  function whoName(w) { return w === 'both' ? '我们俩' : NAMES[w] || ''; }

  var items = {};
  try { items = JSON.parse(localStorage.getItem('qzm-promises') || '{}') || {}; } catch (e) { items = {}; }
  var filter = 'all', editing = null, confirmDel = null, wWho = me || 'a';

  var toastT = 0;
  function toast(t) { var x = $('toast'); x.textContent = t; x.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { x.classList.remove('on'); }, 2200); }
  function day(ms) {
    var d = new Date(ms), y = d.getFullYear();
    return (y === new Date().getFullYear() ? '' : y + '.') + (d.getMonth() + 1) + '.' + d.getDate();
  }

  /* ---------- sync ---------- */
  var db = null, REF = null, FV = null;
  try {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); FV = fb.firestore.FieldValue; REF = db.collection('places').doc('_promises'); }
  } catch (e) { db = null; }
  function banner(t) { var b = $('banner'); if (t) { b.textContent = t; b.hidden = false; } else b.hidden = true; }
  if (!db) banner('连不上同步数据库，现在只能看，写不进去。');
  function put(id, patch) {
    if (!REF) { toast('连不上数据库，没存上'); return Promise.reject(); }
    var o = { items: {} }; o.items[id] = patch;
    return REF.set(o, { merge: true }).catch(function () { toast('没存上，再试一次'); throw new Error('save'); });
  }

  /* ---------- who am I ---------- */
  function renderWho() {
    var box = $('who'); box.textContent = '';
    box.appendChild(el('span', 'lab', '我是'));
    ['a', 'b'].forEach(function (w) {
      var b = el('button', null, NAMES[w]); b.type = 'button';
      b.setAttribute('aria-pressed', String(me === w));
      b.onclick = function () { me = w; wWho = w; try { localStorage.setItem('qzm-me', w); } catch (e) { /* fine */ } renderWho(); renderWrite(); render(); };
      box.appendChild(b);
    });
  }

  /* ---------- writing one ---------- */
  function renderWrite() {
    var seg = $('w-who'); seg.textContent = '';
    ['a', 'b', 'both'].forEach(function (w) {
      var b = el('button', null, whoName(w)); b.type = 'button';
      b.setAttribute('aria-pressed', String(wWho === w));
      b.onclick = function () { wWho = w; renderWrite(); };
      seg.appendChild(b);
    });
    $('w-text').placeholder = me ? '写下一个承诺……' : '先在右上角选一下你是谁，再来写';
    syncGo();
  }
  function syncGo() { $('w-go').disabled = !me || !$('w-text').value.trim(); }
  $('w-text').addEventListener('input', syncGo);
  $('write').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var text = $('w-text').value.trim(); if (!me || !text) return;
    var now = Date.now(), id = 'p' + now.toString(36) + Math.random().toString(36).slice(2, 6);
    var hook = {}; hook[me] = now;
    var item = { text: text, who: wWho, due: $('w-due').value.trim(), by: me, at: now, hook: hook };
    items[id] = item; render();
    put(id, item).then(function () {
      $('w-text').value = ''; $('w-due').value = ''; syncGo();
      toast('写进去了，' + NAMES[other(me)] + ' 那边也能看到');
    }, function () { delete items[id]; render(); });
  });

  /* ---------- the list ---------- */
  function sorted() {
    var ids = Object.keys(items).filter(function (k) { return items[k] && items[k].text; });
    ids.sort(function (x, y) { return (items[x].at || 0) - (items[y].at || 0); });
    return ids;
  }
  function render() {
    var ids = sorted(), num = {};
    ids.forEach(function (k, i) { num[k] = i + 1; });
    var done = ids.filter(function (k) { return items[k].done; }).length;
    $('n-all').textContent = ids.length; $('n-done').textContent = done; $('n-wait').textContent = ids.length - done;
    var show = ids.slice().reverse().filter(function (k) { return filter === 'all' || (filter === 'done' ? !!items[k].done : !items[k].done); });
    $('f-n').textContent = show.length ? show.length + ' 条' : '';
    var ol = $('slips'); ol.textContent = '';
    if (!show.length) {
      var e = el('li', 'empty');
      e.textContent = !ids.length ? '承诺本还是空的。\n写下第一句吧——可以是很小的事，也可以是很远的事。' : filter === 'done' ? '还没有盖章的承诺，加油 🤙' : '都兑现了，真棒！';
      e.style.whiteSpace = 'pre-line';
      ol.appendChild(e); return;
    }
    show.forEach(function (id) { ol.appendChild(slip(id, num[id])); });
  }
  function slip(id, n) {
    var it = items[id], li = el('li', 'slip' + (it.done ? ' done' : '') + (editing === id ? ' editing' : ''));
    li.appendChild(el('span', 'no', 'NO.' + String(n).padStart(2, '0')));
    li.appendChild(el('p', 'text', it.text));
    if (it.done) {
      var st = el('div', 'stamp'); st.setAttribute('aria-label', '已兑现');
      st.appendChild(document.createTextNode('已兑现'));
      st.appendChild(el('small', null, day(it.done.at)));
      li.appendChild(st);
    }
    if (editing === id) li.appendChild(editBox(id));
    var meta = el('div', 'meta');
    var whoT = it.who === 'both' ? '我们俩一起答应的' : NAMES[it.who] + ' 答应 ' + NAMES[other(it.who)];
    meta.appendChild(el('span', null, whoT));
    meta.appendChild(el('span', null, NAMES[it.by] + ' 写于 ' + day(it.at)));
    if (it.due) meta.appendChild(el('span', 'due', '⏳ ' + it.due));
    if (it.done) meta.appendChild(el('span', null, NAMES[it.done.by] + ' 盖的章'));
    li.appendChild(meta);
    var hook = it.hook || {}, ha = !!hook.a, hb = !!hook.b;
    li.appendChild(el('p', 'hooks', ha && hb ? '🤙 两个人都拉钩了，算数' : '🤙 ' + NAMES[ha ? 'a' : 'b'] + ' 拉钩了，等 ' + NAMES[ha ? 'b' : 'a'] + ' 拉钩'));
    if (!me) return li;
    var acts = el('div', 'acts');
    var hk = el('button', null, hook[me] ? '我拉钩了 🤙' : '拉钩 🤙'); hk.type = 'button';
    hk.setAttribute('aria-pressed', String(!!hook[me]));
    hk.onclick = function () {
      if (!FV) { toast('连不上数据库，没存上'); return; }
      var p = { hook: {} }; p.hook[me] = hook[me] ? FV.delete() : Date.now();
      put(id, p);
    };
    acts.appendChild(hk);
    var dn = el('button', null, it.done ? '取消盖章' : '做到了，盖章'); dn.type = 'button';
    dn.setAttribute('aria-pressed', String(!!it.done));
    dn.onclick = function () {
      if (!FV) { toast('连不上数据库，没存上'); return; }
      put(id, { done: it.done ? FV.delete() : { by: me, at: Date.now() } }).then(function () { if (!it.done) toast('盖章啦 🎉'); }, function () {});
    };
    acts.appendChild(dn);
    if (it.by === me) {
      var ed = el('button', null, editing === id ? '收起' : '改一改'); ed.type = 'button';
      ed.onclick = function () { editing = editing === id ? null : id; render(); };
      acts.appendChild(ed);
      var del = el('button', 'del', confirmDel === id ? '确定删掉？' : '删除'); del.type = 'button';
      del.onclick = function () {
        if (confirmDel !== id) { confirmDel = id; render(); setTimeout(function () { if (confirmDel === id) { confirmDel = null; render(); } }, 4000); return; }
        confirmDel = null;
        if (!REF) return;
        var o = {}; o['items.' + id] = FV.delete();
        REF.update(o).then(function () { toast('删掉了'); }, function () { toast('没删掉，再试一次'); });
      };
      acts.appendChild(del);
    }
    li.appendChild(acts);
    return li;
  }
  function editBox(id) {
    var it = items[id], box = el('div', 'edit');
    var ta = el('textarea'); ta.value = it.text; ta.rows = 3; ta.maxLength = 500; ta.setAttribute('aria-label', '承诺内容');
    var du = el('input'); du.value = it.due || ''; du.maxLength = 60; du.placeholder = '什么时候兑现（可不填）'; du.setAttribute('aria-label', '什么时候兑现');
    var row = el('div', 'acts'), sv = el('button', null, '保存'); sv.type = 'button';
    sv.onclick = function () {
      var t = ta.value.trim(); if (!t) { toast('承诺不能是空的'); return; }
      put(id, { text: t, due: du.value.trim(), edited: Date.now() }).then(function () { editing = null; render(); toast('改好了'); }, function () {});
    };
    row.appendChild(sv); box.append(ta, du, row);
    return box;
  }
  document.querySelectorAll('#filter button').forEach(function (b) {
    b.onclick = function () {
      filter = b.getAttribute('data-f');
      document.querySelectorAll('#filter button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      render();
    };
  });

  /* ---------- start ---------- */
  renderWho(); renderWrite(); render();
  if (db) {
    db.collection('places').doc('_people').onSnapshot(function (d) {
      var p = d.exists ? d.data() : null;
      if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; renderWho(); renderWrite(); render(); }
    }, function () {});
    REF.onSnapshot(function (d) {
      var x = (d.exists && d.data()) || {};
      items = x.items || {};
      try { localStorage.setItem('qzm-promises', JSON.stringify(items)); } catch (e) { /* fine */ }
      banner(null);
      if (editing && !items[editing]) editing = null;
      if (editing) return; /* don't wipe what's being typed */
      render();
    }, function () { banner('同步断开了，刷新一下试试。'); });
  }
})();
