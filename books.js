/* 一起读书：同一本书，看得到对方读到哪儿；划的线、写的话两边都看得到。 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var NAMES = { a: 'Logan', b: '茄子萌' };
  var me = null;
  try { me = localStorage.getItem('qzm-me'); } catch (e) { /* storage off */ }
  if (me !== 'a' && me !== 'b') me = null;
  var other = function (w) { return w === 'a' ? 'b' : 'a'; };
  var LIVE_MS = 70000;

  /* came here from one of the rooms? then "back" goes back to it */
  var from = new URLSearchParams(location.search).get('from');
  if (from === 'a' || from === 'b') { $('back').href = 'room.html#' + from; $('back-text').textContent = '小屋'; }

  /* ---------- small helpers ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function day(ms) { try { return new Date(ms).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }); } catch (e) { return ''; } }
  var toastT = 0;
  function toast(t) { var x = $('toast'); x.textContent = t; x.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { x.hidden = true; }, 1800); }

  /* ---------- reading preferences on this device ---------- */
  var prefs = { fs: 19, theme: 'paper', lang: 'zh' };
  try { var sp = JSON.parse(localStorage.getItem('qzm-read') || '{}'); if (sp.fs) prefs.fs = sp.fs; if (sp.theme) prefs.theme = sp.theme; if (sp.lang) prefs.lang = sp.lang; } catch (e) { /* defaults */ }
  /* the book's own language: most are English (old public-domain translations); some are Japanese; some are Chinese already */
  var OL = { en: ['English', '英文', 'en', '英'], ja: ['日本語', '日文', 'ja', '日'], de: ['Deutsch', '德文', 'de', '德'], zh: ['中文', '中文', 'zh-CN', '中'] };
  function olOf() { return (cur && cur.meta && cur.meta.ol) || 'en'; }
  function langLabel(l) { var o = OL[olOf()]; return l === 'zh' ? '中文' : l === 'en' ? o[0] : '中' + o[3] + '对照'; }
  function savePrefs() { try { localStorage.setItem('qzm-read', JSON.stringify(prefs)); } catch (e) { /* fine */ } }
  function applyPrefs() {
    $('reader').style.setProperty('--fs', prefs.fs + 'px');
    $('reader').setAttribute('data-theme', prefs.theme);
    document.querySelectorAll('[data-theme]').forEach(function (b) { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.getAttribute('data-theme') === prefs.theme)); });
    document.querySelectorAll('button[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === prefs.lang)); });
    $('lang-btn').textContent = langLabel(prefs.lang);
    var o = OL[olOf()], cz = olOf() === 'zh';
    $('lang-btn').hidden = cz;
    document.querySelectorAll('button[data-lang="en"]').forEach(function (b) { b.textContent = o[0]; });
    document.querySelectorAll('button[data-lang]').forEach(function (b) { if (b.parentNode) b.parentNode.hidden = cz; });
  }
  function setLang(l) {
    var f = cur ? fracNow() : 0;
    prefs.lang = l; applyPrefs(); savePrefs();
    if (cur) { hideSelUi(); renderChapter(f); }
  }
  $('lang-btn').onclick = function () { setLang(prefs.lang === 'zh' ? 'en' : prefs.lang === 'en' ? 'both' : 'zh'); toast(langLabel(prefs.lang)); };
  document.querySelectorAll('button[data-lang]').forEach(function (b) { b.onclick = function () { setLang(b.getAttribute('data-lang')); }; });

  /* ---------- shared state: where each of us is, and our notes ---------- */
  var db = null;
  try {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); }
  } catch (e) { db = null; }
  var REF = db ? db.collection('places').doc('_reading') : null;
  var shared = { pos: {}, notes: {} };
  function posOf(w, id) { return shared.pos[w] && shared.pos[w][id]; }
  function liveOn(w) { var p = shared.pos[w]; return p && p.at && Date.now() - p.at < LIVE_MS ? p.last : null; }

  /* ---------- the shelf ---------- */
  var shelf = [], books = {};
  function chapterLabel(id, ch) { var b = books[id]; return b && b.ch[ch] ? b.ch[ch].t : '第 ' + (ch + 1) + ' 章'; }
  function renderWho() {
    var box = $('who'); box.textContent = '';
    box.appendChild(el('span', 'lab', '我是'));
    ['a', 'b'].forEach(function (w) {
      var b = el('button', null, NAMES[w]); b.type = 'button';
      b.setAttribute('aria-pressed', String(me === w));
      b.onclick = function () { setMe(w); };
      box.appendChild(b);
    });
  }
  function setMe(w) {
    me = w;
    try { localStorage.setItem('qzm-me', w); } catch (e) { /* fine */ }
    renderWho(); renderShelf(); beat();
  }
  function renderShelf() {
    var ul = $('shelf'); ul.textContent = '';
    shelf.forEach(function (b) {
      var li = el('li'), btn = el('button', 'book'); btn.type = 'button';
      btn.onclick = function () { openBook(b.id); };
      var cover = el('div', 'cover');
      cover.style.background = 'linear-gradient(160deg, ' + b.color + ' 0%, ' + shadeHex(b.color, -.35) + ' 100%)';
      cover.appendChild(el('b', null, b.zh)); cover.appendChild(el('i', null, b.en));
      var info = el('div', 'info');
      info.appendChild(el('h2', null, b.zh));
      info.appendChild(el('p', 'en', b.en));
      info.appendChild(el('p', 'by', b.author + ' · ' + b.tr));
      var prog = el('div', 'prog');
      ['a', 'b'].forEach(function (w) {
        var p = posOf(w, b.id), row = el('div', 'pg ' + w);
        row.appendChild(el('span', 'n', NAMES[w]));
        var pct = p ? Math.min(100, Math.round((p.ch + (p.f || 0)) / b.chapters * 100)) : 0;
        row.appendChild(el('span', 't', p ? chapterLabel(b.id, p.ch) + ' · ' + pct + '%' : '还没开始'));
        var bar = el('span', 'bar'), fill = el('i'); fill.style.width = pct + '%'; bar.appendChild(fill); row.appendChild(bar);
        prog.appendChild(row);
      });
      var n = Object.keys(shared.notes).filter(function (k) { return shared.notes[k] && shared.notes[k].book === b.id; }).length;
      if (n) prog.appendChild(el('span', 'notes-n', '✎ ' + n + ' 条笔记'));
      if (b.zh_ch && b.zh_ch.length) prog.appendChild(el('span', 'zh-n', '中文已译 ' + b.zh_ch.length + ' / ' + b.chapters + ' 章'));
      info.appendChild(prog);
      btn.append(cover, info); li.appendChild(btn); ul.appendChild(li);
    });
    var o = other(me || 'a'), on = me ? liveOn(o) : null, live = $('live');
    var ob = on && shelf.filter(function (x) { return x.id === on; })[0];
    if (ob) { live.hidden = false; live.textContent = NAMES[o] + ' 正在读《' + ob.zh + '》 👀'; } else live.hidden = true;
  }
  function shadeHex(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(v * (1 + k)))); };
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }

  /* ---------- the reader ---------- */
  var cur = null;
  function loadBook(id) {
    if (books[id]) return Promise.resolve(books[id]);
    return Promise.all([
      fetch('books/' + id + '.json?v=10').then(function (r) { return r.json(); }),
      fetch('books/' + id + '.zh.json?v=71').then(function (r) { return r.ok ? r.json() : { ch: {} }; }).catch(function () { return { ch: {} }; })
    ]).then(function (x) { var b = x[0]; b.zh = x[1].ch || {}; b.zs = x[1].s || {}; books[id] = b; return b; });
  }
  function openBook(id, ch, f, push) {
    var meta = shelf.filter(function (x) { return x.id === id; })[0];
    if (!meta) return;
    $('lib').hidden = true; $('reader').hidden = false;
    $('r-book').textContent = meta.zh; $('r-ch').textContent = '正在打开…';
    $('page').textContent = '';
    if (push !== false && location.hash !== '#' + id) history.pushState({ book: id }, '', '#' + id);
    loadBook(id).then(function (b) {
      var mine = me && posOf(me, id);
      cur = { b: b, meta: meta, ch: ch != null ? ch : mine ? Math.min(mine.ch, b.ch.length - 1) : 0 };
      applyPrefs();
      renderChapter(f != null ? f : ch == null && mine ? mine.f || 0 : 0);
      renderToc(); renderNotes();
      beat();
    }, function () { $('r-ch').textContent = '没打开，检查一下网络再试试'; });
  }
  function closeReader(push) {
    savePos(true);
    cur = null; hideSelUi(); applyPrefs();
    $('reader').hidden = true; $('lib').hidden = false; openDrawer(false);
    if (push !== false && location.hash) history.pushState(null, '', location.pathname + location.search);
    renderShelf();
  }
  function notesIn(bookId, ch) {
    return Object.keys(shared.notes).map(function (k) { return shared.notes[k]; })
      .filter(function (n) { return n && n.book === bookId && n.ch === ch; });
  }
  function subOf(i) { var c = cur.b.ch[i], z = cur.b.zs && cur.b.zs[i]; return prefs.lang !== 'en' && z ? z : c.s; }
  function textOf(i, l) { return l === 'zh' ? ((cur.b.zh[cur.ch] || [])[i] || '') : cur.b.ch[cur.ch].p[i]; }
  function marksFor(i, l) { return notesIn(cur.b.id, cur.ch).filter(function (n) { return n.p === i && (n.l || 'en') === l; }); }
  /* one paragraph, with our marks laid over it */
  function paint(pEl, text, list) {
    pEl.textContent = '';
    var spans = [];
    list.forEach(function (n) {
      var at = typeof n.o === 'number' && text.substr(n.o, n.q.length) === n.q ? n.o : text.indexOf(n.q);
      if (at >= 0 && n.q) spans.push({ s: at, e: at + n.q.length, n: n });
    });
    spans.sort(function (x, y) { return x.s - y.s; });
    var pos = 0;
    spans.forEach(function (sp) {
      if (sp.s < pos) return;
      if (sp.s > pos) pEl.appendChild(document.createTextNode(text.slice(pos, sp.s)));
      var m = el('mark', 'n ' + (sp.n.by || 'a') + (sp.n.t ? ' has' : ''), text.slice(sp.s, sp.e));
      m.setAttribute('data-id', sp.n.id); m.tabIndex = 0;
      pEl.appendChild(m); pos = sp.e;
    });
    if (pos < text.length) pEl.appendChild(document.createTextNode(text.slice(pos)));
  }
  function renderChapter(f) {
    var b = cur.b, c = b.ch[cur.ch], page = $('page');
    page.textContent = '';
    page.classList.toggle('poem', !!b.poem);
    page.appendChild(el('h2', null, c.t));
    page.appendChild(el('p', 'sub', subOf(cur.ch)));
    if (prefs.lang === 'both' && b.zs && b.zs[cur.ch]) page.appendChild(el('p', 'sub en', c.s));
    var cz = olOf() === 'zh', zhp = cz ? null : b.zh[cur.ch], mode = cz ? 'en' : prefs.lang;
    if (mode !== 'en' && !zhp) page.appendChild(el('p', 'notice', '这一章的中文还在翻译，先看' + OL[olOf()][1] + '。'));
    var add = function (i, l, text, pair) {
      var p = el('p', 't' + (l === 'zh' ? ' zh' : '') + (pair ? ' pair' : '') + (!b.poem && text && text.indexOf('\n') >= 0 ? ' v' : ''));
      p.setAttribute('data-i', i); p.setAttribute('data-l', l);
      p.setAttribute('lang', l === 'zh' ? 'zh-CN' : OL[olOf()][2]);
      paint(p, text, marksFor(i, l));
      crossNotes(p, i, l);
      page.appendChild(p);
    };
    c.p.forEach(function (text, i) {
      if (mode === 'en' || mode === 'both' || !zhp) add(i, 'en', text, false);
      if (zhp && (mode === 'zh' || mode === 'both')) add(i, 'zh', zhp[i], mode === 'both');
    });
    page.appendChild(el('p', 'end', cur.ch < b.ch.length - 1 ? '— 本章完 —' : '— 全书完 —'));
    $('r-ch').textContent = c.t + (subOf(cur.ch) ? ' · ' + subOf(cur.ch) : '');
    $('prev').disabled = cur.ch === 0;
    $('next').disabled = cur.ch === b.ch.length - 1;
    requestAnimationFrame(function () {
      page.scrollTop = (f || 0) * Math.max(0, page.scrollHeight - page.clientHeight);
      updatePct();
    });
    renderTogether();
    markToc();
  }
  function fracNow() { var p = $('page'), max = p.scrollHeight - p.clientHeight; return max > 0 ? Math.min(1, p.scrollTop / max) : 1; }
  function updatePct() {
    if (!cur) return;
    var all = Math.round((cur.ch + fracNow()) / cur.b.ch.length * 100);
    $('pct').textContent = (cur.ch + 1) + ' / ' + cur.b.ch.length + ' 章 · 全书 ' + all + '%';
  }
  function goChapter(i, f) { if (!cur || i < 0 || i >= cur.b.ch.length) return; savePos(true); cur.ch = i; hideSelUi(); renderChapter(f || 0); savePos(true); }
  $('prev').onclick = function () { goChapter(cur.ch - 1, 0); };
  $('next').onclick = function () { goChapter(cur.ch + 1, 0); $('page').focus({ preventScroll: true }); };
  $('to-shelf').onclick = function () { closeReader(); };

  /* the line under the title bar: where TA is */
  function renderTogether() {
    var box = $('together');
    if (!cur || !me) { box.hidden = true; return; }
    var o = other(me), p = posOf(o, cur.b.id);
    if (!p) { box.hidden = true; return; }
    box.hidden = false; box.textContent = '';
    var s = el('span'); var d = el('i', 'dot'); d.style.background = o === 'a' ? 'var(--a)' : 'var(--b)'; s.appendChild(d);
    var live = liveOn(o) === cur.b.id;
    s.appendChild(document.createTextNode(NAMES[o] + (live ? ' 正在读 ' : ' 读到了 ') + chapterLabel(cur.b.id, p.ch) + (live ? ' 👀' : '')));
    box.appendChild(s);
    if (p.ch !== cur.ch || Math.abs((p.f || 0) - fracNow()) > .08) {
      var go = el('button', null, '跳到 TA 那儿'); go.type = 'button';
      go.onclick = function () { if (p.ch === cur.ch) { var pg = $('page'); pg.scrollTop = (p.f || 0) * (pg.scrollHeight - pg.clientHeight); } else goChapter(p.ch, p.f || 0); };
      box.appendChild(go);
    }
  }

  /* ---------- saving where I am ---------- */
  var saveT = 0, lastSent = '';
  function savePos(now) {
    if (!cur) return;
    var f = Math.round(fracNow() * 1000) / 1000, id = cur.b.id;
    try { var loc = JSON.parse(localStorage.getItem('qzm-read-pos') || '{}'); loc[id] = { ch: cur.ch, f: f }; localStorage.setItem('qzm-read-pos', JSON.stringify(loc)); } catch (e) { /* fine */ }
    if (!REF || !me) return;
    clearTimeout(saveT);
    var send = function () {
      var key = id + ':' + cur.ch + ':' + f;
      if (key === lastSent) return;
      lastSent = key;
      var t = Date.now(), body = { pos: {} };
      body.pos[me] = { last: id, at: t }; body.pos[me][id] = { ch: cur ? cur.ch : 0, f: f, at: t };
      if (!shared.pos[me]) shared.pos[me] = {};
      shared.pos[me][id] = body.pos[me][id]; shared.pos[me].last = id; shared.pos[me].at = t;
      REF.set(body, { merge: true }).catch(function () { /* try again next time */ });
    };
    if (now) send(); else saveT = setTimeout(send, 2500);
  }
  var scrollT = 0;
  $('page').addEventListener('scroll', function () {
    hideBubble();
    if (scrollT) return;
    scrollT = setTimeout(function () { scrollT = 0; updatePct(); savePos(false); renderTogether(); }, 250);
  }, { passive: true });
  function beat() {
    if (!REF || !me || document.hidden) return;
    var body = { pos: {} }; body.pos[me] = { at: Date.now(), last: cur ? cur.b.id : '' };
    REF.set(body, { merge: true }).catch(function () {});
  }
  setInterval(function () { if (cur) beat(); }, 25000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) savePos(true); else if (cur) beat(); });
  addEventListener('pagehide', function () { savePos(true); });

  /* ---------- contents and notes drawer ---------- */
  function openDrawer(on, tab) {
    document.body.classList.toggle('drawer-open', on);
    $('drawer').setAttribute('aria-hidden', String(!on));
    if (tab) showTab(tab);
    if (on) { var c = $('toc').querySelector('[aria-current="true"]'); if (c && tab !== 'notes') c.scrollIntoView({ block: 'center' }); }
  }
  function showTab(t) {
    $('tab-toc').setAttribute('aria-selected', String(t === 'toc')); $('tab-notes').setAttribute('aria-selected', String(t === 'notes'));
    $('toc').hidden = t !== 'toc'; $('notes').hidden = t !== 'notes';
  }
  $('open-toc').onclick = function () { openDrawer(true, 'toc'); };
  $('close-drawer').onclick = function () { openDrawer(false); };
  $('scrim').onclick = function () { openDrawer(false); };
  $('tab-toc').onclick = function () { showTab('toc'); };
  $('tab-notes').onclick = function () { showTab('notes'); };
  function renderToc() {
    var ol = $('toc'); ol.textContent = '';
    if (!cur) return;
    cur.b.ch.forEach(function (c, i) {
      var li = el('li'), b = el('button'); b.type = 'button'; b.setAttribute('data-i', i);
      var t = el('span', 't'); t.appendChild(el('b', null, c.t)); t.appendChild(el('small', null, subOf(i)));
      b.appendChild(t);
      if (cur.b.zh[i]) b.appendChild(el('span', 'zh-b', '中'));
      ['a', 'b'].forEach(function (w) { var p = posOf(w, cur.b.id); if (p && p.ch === i) { var d = el('span', 'dot ' + w); d.title = NAMES[w] + ' 在这一章'; b.appendChild(d); } });
      b.onclick = function () { openDrawer(false); goChapter(i, 0); };
      li.appendChild(b); ol.appendChild(li);
    });
    markToc();
  }
  function markToc() { if (!cur) return; $('toc').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-current', String(+b.getAttribute('data-i') === cur.ch)); }); }
  function renderNotes() {
    var ol = $('notes'); ol.textContent = '';
    if (!cur) return;
    var list = Object.keys(shared.notes).map(function (k) { return shared.notes[k]; })
      .filter(function (n) { return n && n.book === cur.b.id; })
      .sort(function (x, y) { return x.ch - y.ch || x.p - y.p || (x.o || 0) - (y.o || 0); });
    $('tab-notes').textContent = '我们的笔记' + (list.length ? ' ' + list.length : '');
    if (!list.length) { ol.appendChild(el('li', 'none', '还没有笔记。读的时候选中一句话，就能划线、写一句给 TA。')); return; }
    list.forEach(function (n) {
      var li = el('li'), b = el('button'); b.type = 'button';
      b.appendChild(el('span', 'q ' + n.by, '“' + n.q + '”'));
      if (n.t) b.appendChild(el('span', 'tx', n.t));
      b.appendChild(el('small', null, (NAMES[n.by] || '') + ' · ' + chapterLabel(cur.b.id, n.ch) + ' · ' + day(n.at)));
      b.onclick = function () { openDrawer(false); jumpToNote(n); };
      li.appendChild(b); ol.appendChild(li);
    });
  }
  function jumpToNote(n) {
    var show = function () {
      var m = $('page').querySelector('mark[data-id="' + n.id + '"]');
      if (m) { m.scrollIntoView({ block: 'center' }); m.animate && m.animate([{ outline: '3px solid #e9b77c' }, { outline: '3px solid transparent' }], { duration: 1400 }); }
    };
    var l = n.l || 'en', need = olOf() === 'zh' ? null : l === 'zh' ? (prefs.lang === 'en' ? 'both' : null) : (prefs.lang === 'zh' ? 'both' : null);
    if (need) { prefs.lang = need; applyPrefs(); savePrefs(); }
    if (cur.ch !== n.ch) { goChapter(n.ch, 0); setTimeout(show, 80); }
    else if (need) { renderChapter(fracNow()); setTimeout(show, 80); } else show();
  }

  /* ---------- Aa ---------- */
  $('open-aa').onclick = function () { $('aa-pop').hidden = !$('aa-pop').hidden; };
  document.querySelectorAll('[data-fs]').forEach(function (b) {
    b.onclick = function () { var f = fracNow(); prefs.fs = Math.max(15, Math.min(28, prefs.fs + +b.getAttribute('data-fs'))); applyPrefs(); savePrefs(); var pg = $('page'); pg.scrollTop = f * (pg.scrollHeight - pg.clientHeight); };
  });
  document.querySelectorAll('button[data-theme]').forEach(function (b) {
    b.onclick = function () { prefs.theme = b.getAttribute('data-theme'); applyPrefs(); savePrefs(); };
  });

  /* ---------- underline a line, write something ---------- */
  var sel = null;
  function hideSelUi() { $('mark-btn').hidden = true; sel = null; }
  function readSelection() {
    var s = window.getSelection();
    if (!cur || !s || s.isCollapsed || !s.rangeCount) { hideSelUi(); return; }
    var r = s.getRangeAt(0), start = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode;
    var p = start && start.closest && start.closest('p.t');
    if (!p || !$('page').contains(p)) { hideSelUi(); return; }
    var pre = document.createRange(); pre.selectNodeContents(p); pre.setEnd(r.startContainer, r.startOffset);
    var l = p.getAttribute('data-l') || 'en', o = pre.toString().length, text = textOf(+p.getAttribute('data-i'), l);
    var endInP = p.contains(r.endContainer);
    var q = endInP ? r.toString() : text.slice(o);
    var lead = q.length - q.replace(/^\s+/, '').length;
    q = q.trim(); o += lead;
    if (!q || q.length > 800) { hideSelUi(); return; }
    sel = { p: +p.getAttribute('data-i'), o: o, q: q, l: l };
    var rect = r.getBoundingClientRect(), btn = $('mark-btn');
    btn.style.left = Math.max(70, Math.min(innerWidth - 70, rect.left + rect.width / 2)) + 'px';
    btn.style.top = Math.min(innerHeight - 60, rect.bottom + 52) + 'px';
    btn.hidden = false;
  }
  var selT = 0;
  document.addEventListener('selectionchange', function () { clearTimeout(selT); selT = setTimeout(readSelection, 180); });
  $('mark-btn').addEventListener('mousedown', function (ev) { ev.preventDefault(); });
  $('mark-btn').onclick = function () {
    if (!sel) return;
    if (!me) { toast('先在书架页选一下「我是谁」'); return; }
    $('compose-q').textContent = '“' + sel.q + '”';
    $('compose-t').value = '';
    $('compose').hidden = false; $('mark-btn').hidden = true;
    $('compose-t').focus();
  };
  $('compose-cancel').onclick = function () { $('compose').hidden = true; hideSelUi(); };
  $('compose-save').onclick = function () {
    if (!sel || !cur) return;
    var n = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), book: cur.b.id, ch: cur.ch, p: sel.p, o: sel.o, q: sel.q, l: sel.l, t: $('compose-t').value.trim(), by: me, at: Date.now() };
    shared.notes[n.id] = n;
    $('compose').hidden = true; hideSelUi();
    try { window.getSelection().removeAllRanges(); } catch (e) { /* fine */ }
    repaintPara(n.p); renderNotes();
    toast(n.t ? '写好了，TA 也看得到' : '划好了');
    if (REF) { var body = { notes: {} }; body.notes[n.id] = n; REF.set(body, { merge: true }).catch(function () { toast('没存上，再试一次'); }); }
  };
  function repaintPara(i) {
    if (!cur) return;
    $('page').querySelectorAll('p.t[data-i="' + i + '"]').forEach(function (p) {
      var l = p.getAttribute('data-l') || 'en';
      paint(p, textOf(i, l), marksFor(i, l));
      crossNotes(p, i, l);
    });
  }
  /* notes written on the other language's text: a small pen at the end of the paragraph */
  function crossNotes(p, i, l) {
    if (prefs.lang === 'both' || olOf() === 'zh') return;
    var o = l === 'zh' ? 'en' : 'zh', list = marksFor(i, o);
    if (!list.length) return;
    var b = el('button', 'xnote' + (list.some(function (n) { return n.by === 'b'; }) ? ' b' : ' a'), '✎ ' + list.length);
    b.type = 'button'; b.setAttribute('data-ids', list.map(function (n) { return n.id; }).join(','));
    b.setAttribute('aria-label', '这一段有 ' + list.length + ' 条' + (o === 'en' ? OL[olOf()][1] : '中文') + '笔记');
    p.appendChild(b);
  }
  /* tapping a mark shows what was written */
  function hideBubble() { $('bubble').hidden = true; }
  $('page').addEventListener('click', function (ev) {
    var x = ev.target.closest && ev.target.closest('.xnote');
    if (x) {
      var bx = $('bubble'); bx.textContent = '';
      x.getAttribute('data-ids').split(',').forEach(function (id) {
        var nn = shared.notes[id]; if (!nn) return;
        bx.appendChild(el('p', 'who-l', (NAMES[nn.by] || '') + ' · ' + day(nn.at)));
        bx.appendChild(el('p', 'xq', '“' + nn.q + '”'));
        if (nn.t) bx.appendChild(el('p', null, nn.t));
      });
      var rx = x.getBoundingClientRect();
      bx.style.left = Math.max(170, Math.min(innerWidth - 170, rx.left + rx.width / 2)) + 'px';
      bx.style.top = Math.min(innerHeight - 160, rx.bottom) + 'px';
      bx.hidden = false; return;
    }
    var m = ev.target.closest && ev.target.closest('mark.n');
    if (!m) { hideBubble(); $('aa-pop').hidden = true; return; }
    var n = shared.notes[m.getAttribute('data-id')];
    if (!n) return;
    var bub = $('bubble'); bub.textContent = '';
    bub.appendChild(el('p', 'who-l', (NAMES[n.by] || '') + ' · ' + day(n.at)));
    bub.appendChild(el('p', null, n.t || '划了这一句'));
    if (n.by === me) {
      var acts = el('div', 'acts'), del = el('button', null, '删掉'); del.type = 'button';
      del.onclick = function () {
        delete shared.notes[n.id]; hideBubble(); repaintPara(n.p); renderNotes();
        if (REF) { var u = {}; u['notes.' + n.id] = window.firebase.firestore.FieldValue.delete(); REF.update(u).catch(function () {}); }
      };
      acts.appendChild(del); bub.appendChild(acts);
    }
    var r = m.getBoundingClientRect();
    bub.style.left = Math.max(170, Math.min(innerWidth - 170, r.left + r.width / 2)) + 'px';
    bub.style.top = Math.min(innerHeight - 140, r.bottom) + 'px';
    bub.hidden = false;
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (!$('compose').hidden) { $('compose').hidden = true; return; }
    if (document.body.classList.contains('drawer-open')) { openDrawer(false); return; }
    hideBubble(); $('aa-pop').hidden = true;
  });

  /* ---------- the back button ---------- */
  addEventListener('popstate', function () {
    var id = location.hash.slice(1);
    if (id && shelf.some(function (b) { return b.id === id; })) { if (!cur || cur.b.id !== id) openBook(id, null, null, false); }
    else if (cur) closeReader(false);
  });

  /* ---------- start ---------- */
  applyPrefs();
  renderWho();
  fetch('books/shelf.json?v=72').then(function (r) { return r.json(); }).then(function (s) {
    shelf = s; renderShelf();
    var id = location.hash.slice(1);
    if (id && shelf.some(function (b) { return b.id === id; })) openBook(id, null, null, false);
  });
  if (db) {
    db.collection('places').doc('_people').onSnapshot(function (d) {
      var p = d.exists ? d.data() : null;
      if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; renderWho(); if (!cur) renderShelf(); }
    }, function () {});
    REF.onSnapshot(function (d) {
      if (d.metadata && d.metadata.hasPendingWrites) return;
      var x = (d.exists && d.data()) || {};
      shared = { pos: x.pos || {}, notes: x.notes || {} };
      if (!cur) { renderShelf(); return; }
      renderTogether(); renderToc(); renderNotes();
      /* repaint the marks in the open chapter without moving the page */
      var pg = $('page'), top = pg.scrollTop;
      cur.b.ch[cur.ch].p.forEach(function (_, i) { repaintPara(i); });
      pg.scrollTop = top;
    }, function () {});
  }
})();
