(function () {
  'use strict';
  /* The Toronto trip, 2026-12-19 to 12-29: the day-by-day plan (from the 圆周旅迹 PDF), the packing list,
     and what Logan still has to get ready. Check marks and added items live in places/_trip. */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- the plan ---------- */
  var ARRIVE = Date.UTC(2026, 11, 19, 20, 56);   /* 12.19 15:56 Toronto time (EST, UTC-5) */
  var LEAVE = Date.UTC(2026, 11, 29, 17, 55);    /* 12.29 12:55 Toronto time */
  var DAYS = [
    { date: '12.19', wd: '周六', title: '抵达·湖滨晚餐', stops: [
      ['交通', '15:56', '多伦多皮尔逊国际机场', '航班抵达，不自驾，乘公共交通进市区', '公共交通 · 24.9 公里 · 1 小时 11 分钟（步行 → 公交 Onex Bus LMT0200 → 步行）'],
      ['交通', '17:30 – 18:30', 'Polson Street', '刚抵达走一下湖边，轻松不累', '公共交通 · 6.6 公里 · 48 分钟（步行 → 公交 114 → 步行 → 310 → 步行）'],
      ['吃喝', '19:30 – 21:00', '福牛顺潮汕牛肉火锅', '晚餐']] },
    { date: '12.20', wd: '周日', title: '市中心地标', from: ['福牛顺潮汕牛肉火锅', '公共交通 · 2.6 公里 · 23 分钟（步行 → 510A → 步行）'], stops: [
      ['游玩', '11:30 – 13:30', '加拿大国家电视塔', '', '步行 · 1.6 公里 · 27 分钟'],
      ['游玩', '14:00 – 15:00', '内森·菲利普斯广场', '', '公共交通 · 2.1 公里 · 18 分钟（步行 → 503 → 步行）'],
      ['购物', '15:30 – 16:15', '圣劳伦斯市场', '周日开放，市场南楼 10:00–17:00', '步行 · 1.6 公里 · 28 分钟'],
      ['游玩', '16:30 – 16:50', '艾伦花园', '温室 17:00 关门，需提早入场，位于 Carlton/Jarvis', '公共交通 · 1.3 公里 · 18 分钟'],
      ['购物', '18:00 – 20:00', '多伦多伊顿中心', '', '步行 · 0.8 公里 · 13 分钟'],
      ['吃喝', '', 'LOUIX LOUIS', '']] },
    { date: '12.21', wd: '周一', title: '大学区·城堡', from: ['LOUIX LOUIS', '公共交通 · 4.2 公里 · 23 分钟（步行 → 地铁 1 → 步行）'], stops: [
      ['其他', '11:30 – 13:00', '多伦多大学 白求恩雕塑', '', '公共交通 · 3.4 公里 · 26 分钟（步行 → 地铁 1 → 步行）'],
      ['游玩', '13:30 – 16:30', '卡萨罗马城堡', '冬季每日 9:30–17:00，16:30 停止入园', '驾车 · 4.4 公里 · 11 分钟'],
      ['吃喝', '18:30 – 20:00', 'Village Idiot Pub', '晚餐']] },
    { date: '12.22', wd: '周二', title: '美术馆·Yorkville 购物', from: ['Village Idiot Pub', '公共交通 · 0.1 公里 · 2 分钟（步行）'], stops: [
      ['游玩', '11:30 – 14:00', '安大略美术馆', '周二开放 10:30–17:00', '步行 · 1 公里 · 17 分钟'],
      ['其他', '14:15 – 15:00', '401 里士满大厦', '当代艺术空间，紧邻 AGO', '公共交通 · 2.8 公里 · 23 分钟（步行 → 510 → 步行）'],
      ['游玩', '15:15 – 16:30', '巴塔鞋博物馆', 'Bloor/St George，17:00 关门，赶在关门前', '公共交通 · 1.1 公里 · 8 分钟（步行 → 地铁 2 → 步行）'],
      ['购物', '16:45 – 17:45', 'Holt Renfrew', 'Yorkville，Bloor/Bay', '步行 · 0.4 公里 · 7 分钟'],
      ['购物', '18:00 – 19:00', 'Louis Vuitton Toronto Bloor Street', 'Yorkville 购物区', '步行 · 1.3 公里 · 23 分钟'],
      ['吃喝', '19:15 – 19:45', '喜茶（505 Yonge St）', 'Yonge/Wellesley']] },
    { date: '12.23', wd: '周三', title: '去程·Hamilton·尼亚加拉奥莱', from: ['喜茶（央街 505 号）'], stops: [
      ['购物', '11:30 – 14:00', 'Hamilton Antique Mall', '从多伦多市区出发，沿 DT → Hamilton → 尼亚加拉方向，先到古董市场', '公共交通 · 66.2 公里 · 1 小时 40 分钟（步行 → 公交 10 → 步行 → 公交 44 → 步行）'],
      ['购物', '15:00 – 18:00', '尼亚加拉奥特莱斯', '12/23 正常营业 10:00–21:00，露天奥莱注意保暖']] },
    { date: '12.24', wd: '周四', title: '尼亚加拉瀑布', from: ['尼亚加拉奥特莱斯', '公共交通 · 13.8 公里 · 38 分钟（步行 → 公交 12 → 步行）'], stops: [
      ['其他', '11:30 – 17:00', '尼亚加拉瀑布', '冬季灯光节 11/14–1/10，晚间 5 点起亮灯；圣诞前夜户外开放']] },
    { date: '12.25', wd: '周五', title: '伊利堡', from: ['尼亚加拉瀑布', '公共交通 · 43.5 公里 · 1 小时 28 分钟（步行 → 公交 101 → 公交 22 → 步行）'], stops: [
      ['其他', '11:30 – 17:00', '伊利堡', '圣诞当日，户外小镇，可顺路看尼亚加拉灯光节']] },
    { date: '12.26', wd: '周六', title: '北线·北约克', from: ['伊利堡', '公共交通'], stops: [
      ['娱乐', '11:30 – 14:30', 'Target Sports Canada', 'Gormley 北郊，节礼日营业', '公共交通'],
      ['吃喝', '16:00 – 18:00', 'Kajiken', '午餐/晚餐']] },
    { date: '12.27', wd: '周日', title: '士嘉堡·湖心岛', from: ['Kajiken', '公共交通 · 13.7 公里 · 2 小时 37 分钟（步行 → 公交 320A → 公交 098|099 → 步行）'], stops: [
      ['吃喝', '11:30 – 13:30', '念一筷子', '士嘉堡，午餐', '公共交通'],
      ['游玩', '14:30 – 16:30', '湖心岛公园', '冬季渡轮仅通航 Ward’s Island', '公共交通'],
      ['吃喝', '18:00 – 20:00', 'Fallen Feather', '晚餐']] },
    { date: '12.28', wd: '周一', title: '市区机动·空松', stops: [
      ['自定义', '', '多伦多市区自由活动（机动/休息/补逛）', '返程前空松的一天，可自由安排']] },
    { date: '12.29', wd: '周二', title: '离开多伦多', stops: [
      ['交通', '10:55', '多伦多皮尔逊国际机场', '12:55 起飞，预留 2 小时，不自驾，提前到机场']] }
  ];

  /* ---------- the packing list Logan wrote, word for word ---------- */
  var PACK = [
    { id: 'outer', t: '衣服类（外套）', items: [['o1', '羽绒'], ['o2', '帽子'], ['o3', '手套'], ['o4', '围巾'], ['-', '以下可节省'], ['o5', '羽绒内胆'], ['o6', '雪裤或者加绒裤（一般用不到）'], ['o7', 'balaclava or neck gaiter']] },
    { id: 'inner', t: '衣服类（内层）', items: [['i1', '上衣（指里面的）（暖气超足，感觉醉氧）'], ['i2', '毛衣卫衣（mid）'], ['i3', '裤子（反正类似牛仔裤什么的）'], ['i4', '打底裤（这个好像说你并不需要）'], ['i5', '睡衣内衣裤']] },
    { id: 'shoes', t: '鞋袜类', items: [['s1', '这个你谁便，但是我怕你运动鞋袜子薄冰脚'], ['s2', '厚袜子有吧'], ['s3', '冰爪这个我有也没用过，小心一点摔不到😂']] },
    { id: 'warm', t: '防寒类', items: [['w1', '暖宝宝（用不完好吧）'], ['w2', '充电宝'], ['w3', '墨镜（紫外线很强）']] },
    { id: 'care', t: '护肤个人类', items: [['c1', '身体乳、面霜。干干干很干'], ['c2', '唇膏（这个有就顺手没有我给你）'], ['c3', '护手霜（这个也不用）'], ['c4', '隐形眼镜要带眼药水（怕针眼）'], ['c5', '化妆品生理用品'], ['c6', '其实没事我带不带都行（去趟shopping店就有了之前给Allen姐姐买过）'], ['c7', '吹风机、洗发水、沐浴露、转换插头这些我都有好吧']] },
    { id: 'tech', t: '电子产品类', items: [['e1', '充电线，手机，平板，电脑这一类自己看着来'], ['e2', 'Check电话卡有没有带ca的漫游'], ['e3', '相机什么的我怕你手冻😂']] }
  ];
  var PACK_TIP = '别带太多东西我怕你买东西😂看着来就行';

  /* ---------- who ---------- */
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
  function toast(t) { var x = $('toast'); x.textContent = t; x.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { x.classList.remove('on'); }, 2200); }
  function md(ms) { var d = new Date(ms); return (d.getMonth() + 1) + '.' + d.getDate(); }

  /* ---------- shared state ---------- */
  var shared = { check: {}, stop: {}, extra: {} };
  try { var c = JSON.parse(localStorage.getItem('qzm-trip') || 'null'); if (c) shared = c; } catch (e) { /* fresh */ }
  var db = null, REF = null, FV = null;
  try {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); FV = fb.firestore.FieldValue; REF = db.collection('places').doc('_trip'); }
  } catch (e) { db = null; }
  function banner(t) { var b = $('banner'); if (t) { b.textContent = t; b.hidden = false; } else b.hidden = true; }
  if (!db) banner('连不上同步数据库，现在只能看，打勾存不了。');
  function needMe() { if (me) return true; toast('先在右上角选一下你是谁'); return false; }
  function put(o) {
    if (!REF) { toast('连不上数据库，没存上'); return Promise.reject(); }
    return REF.set(o, { merge: true }).catch(function () { toast('没存上，再试一次'); throw new Error('save'); });
  }
  function toggle(kind, id) {
    if (!needMe() || !FV) { if (!FV) toast('连不上数据库，没存上'); return; }
    var on = shared[kind] && shared[kind][id], o = {}; o[kind] = {};
    o[kind][id] = on ? FV.delete() : { by: me, at: Date.now() };
    put(o);
  }

  /* ---------- where are we in time ---------- */
  function torontoDate(ms) {
    try {
      var p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = +x.value; });
      return { y: p.year, m: p.month, d: p.day };
    } catch (e) { var d = new Date(ms); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }; }
  }
  function todayIndex() {
    var t = torontoDate(Date.now());
    if (t.y !== 2026 || t.m !== 12) return -1;
    var i = t.d - 19;
    return i >= 0 && i < DAYS.length ? i : -1;
  }
  function tickCount() {
    var now = Date.now(), big = $('c-big'), what = $('c-what');
    big.textContent = '';
    function part(n, u) { big.appendChild(document.createTextNode(String(n))); big.appendChild(el('small', null, u)); }
    var ti = todayIndex();
    if (now < ARRIVE) {
      var s = Math.floor((ARRIVE - now) / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      what.textContent = NAMES.b + ' 落地多伦多还有';
      part(d, '天'); part(h, '小时'); part(m, '分');
    } else if (now < LEAVE || ti >= 0) {
      var i = ti >= 0 ? ti : 0;
      what.textContent = '我们在多伦多 · 今天：' + DAYS[i].title;
      part('第 ' + (i + 1), '天'); big.appendChild(document.createTextNode(' / ' + DAYS.length));
    } else {
      var since = Math.floor((now - LEAVE) / 86400000);
      what.textContent = '这趟旅行已经过去了';
      part(since, '天');
    }
  }

  /* ---------- the days ---------- */
  var open = {};
  (function () { var i = todayIndex(); open[i >= 0 ? i : 0] = true; })();
  function renderDays() {
    var ol = $('days'), ti = todayIndex(); ol.textContent = '';
    DAYS.forEach(function (d, i) {
      var li = el('li', 'day' + (i === ti ? ' today' : ''));
      li.setAttribute('aria-expanded', String(!!open[i]));
      var head = el('button'); head.type = 'button';
      var dd = el('div', 'd'); dd.appendChild(el('b', null, String(i + 1))); dd.appendChild(el('span', null, 'DAY'));
      var tt = el('div', 't'), tb = el('b', null, d.title);
      if (i === ti) tb.appendChild(el('span', 'now', '今天'));
      var doneN = d.stops.filter(function (_, k) { return shared.stop && shared.stop['d' + (i + 1) + 's' + (k + 1)]; }).length;
      tt.appendChild(tb);
      tt.appendChild(el('span', null, d.date + ' ' + d.wd + ' · ' + d.stops.length + ' 个地点' + (doneN ? ' · 打卡 ' + doneN + '/' + d.stops.length : '')));
      var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chev.setAttribute('viewBox', '0 0 24 24'); chev.setAttribute('class', 'chev'); chev.setAttribute('aria-hidden', 'true');
      chev.innerHTML = '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      head.append(dd, tt, chev);
      head.onclick = function () { open[i] = !open[i]; renderDays(); };
      li.appendChild(head);
      if (open[i]) {
        var ul = el('ul', 'stops');
        if (d.from) {
          ul.appendChild(el('li', 'leg', '从 ' + d.from[0] + ' 出发' + (d.from[1] ? '：' + d.from[1] : '')));
        }
        d.stops.forEach(function (s, k) {
          var id = 'd' + (i + 1) + 's' + (k + 1), got = shared.stop && shared.stop[id];
          var row = el('li', 'stop');
          var tick = el('button', 'tick' + (got ? ' ' + got.by : ''), got ? '✓' : ''); tick.type = 'button';
          tick.setAttribute('aria-pressed', String(!!got)); tick.setAttribute('aria-label', (got ? '取消打卡：' : '打卡：') + s[2]);
          tick.onclick = function () { toggle('stop', id); };
          var body = el('div');
          var when = el('div', 'when'); when.appendChild(el('span', 'tag', s[0])); if (s[1]) when.appendChild(el('span', null, s[1]));
          body.appendChild(when);
          body.appendChild(el('p', 'name', s[2]));
          if (s[3]) body.appendChild(el('p', 'note', s[3]));
          if (got) body.appendChild(el('p', 'by', NAMES[got.by] + ' 打卡 · ' + md(got.at)));
          row.append(tick, body);
          ul.appendChild(row);
          if (s[4]) ul.appendChild(el('li', 'leg', s[4]));
        });
        li.appendChild(ul);
      }
      ol.appendChild(li);
    });
  }

  /* ---------- the lists ---------- */
  function extrasFor(list, cat) {
    var ex = shared.extra || {};
    return Object.keys(ex).filter(function (k) { return ex[k] && ex[k].list === list && (ex[k].cat || '') === (cat || ''); })
      .sort(function (x, y) { return (ex[x].at || 0) - (ex[y].at || 0); })
      .map(function (k) { return [k, ex[k].text, true]; });
  }
  function itemRow(id, text, mine) {
    var got = shared.check && shared.check[id];
    var li = el('li', 'item' + (got ? ' on' : ''));
    var tick = el('button', 'tick' + (got ? ' ' + got.by : ''), got ? '✓' : ''); tick.type = 'button';
    tick.setAttribute('aria-pressed', String(!!got)); tick.setAttribute('aria-label', (got ? '取消：' : '打勾：') + text);
    tick.title = got ? NAMES[got.by] + ' 打的勾 · ' + md(got.at) : '';
    tick.onclick = function () { toggle('check', id); };
    li.append(tick, el('span', 'txt', text));
    if (mine) {
      var x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', '删掉：' + text);
      x.onclick = function () {
        if (!REF || !FV) { toast('连不上数据库'); return; }
        var o = {}; o['extra.' + id] = FV.delete(); o['check.' + id] = FV.delete();
        REF.update(o).catch(function () { toast('没删掉，再试一次'); });
      };
      li.appendChild(x);
    } else li.appendChild(el('span'));
    return li;
  }
  var addOpen = {};
  function addBox(list, cat, ph, always) {
    var k = list + '/' + (cat || '');
    if (!always && !addOpen[k]) {
      var a = el('button', 'addlink', '+ 加一样'); a.type = 'button';
      a.onclick = function () { addOpen[k] = true; keepFocus = k; renderLists(); };
      return a;
    }
    var f = el('form', 'add'); f.autocomplete = 'off';
    var inp = el('input'); inp.placeholder = ph; inp.maxLength = 120; inp.setAttribute('aria-label', ph);
    var b = el('button', null, '+ 加'); b.type = 'submit';
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var t = inp.value.trim(); if (!t || !needMe()) return;
      var id = 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), o = { extra: {} };
      o.extra[id] = { list: list, cat: cat || '', text: t, by: me, at: Date.now() };
      keepFocus = k;
      put(o).then(function () { inp.value = ''; }, function () {});
    };
    f.setAttribute('data-k', k);
    f.append(inp, b);
    return f;
  }
  var keepFocus = null;
  function renderLists() {
    var box = $('lists'); box.textContent = '';
    /* her packing list */
    var pk = el('section', 'list');
    pk.appendChild(el('h2', null, NAMES.b + ' 的行李清单'));
    var all = 0, got = 0;
    var cats = PACK.map(function (c) {
      var ids = c.items.filter(function (x) { return x[0] !== '-'; }).map(function (x) { return x[0]; }).concat(extrasFor('pack', c.id).map(function (x) { return x[0]; }));
      var g = ids.filter(function (k) { return shared.check && shared.check[k]; }).length;
      all += ids.length; got += g;
      var sec = el('div', 'cat'), h = el('h3', null, c.t); h.appendChild(el('span', null, g + '/' + ids.length));
      sec.appendChild(h);
      var ul = el('ul', 'items');
      c.items.forEach(function (x) { if (x[0] === '-') ul.appendChild(el('li', 'divider', x[1])); else ul.appendChild(itemRow(x[0], x[1], false)); });
      extrasFor('pack', c.id).forEach(function (x) { ul.appendChild(itemRow(x[0], x[1], true)); });
      sec.appendChild(ul);
      sec.appendChild(addBox('pack', c.id, '往「' + c.t + '」里加一样'));
      return sec;
    });
    pk.appendChild(el('p', 'sub', NAMES.a + ' 写的 · 已经装好 ' + got + '/' + all));
    cats.forEach(function (s) { pk.appendChild(s); });
    pk.appendChild(el('p', 'tip', '💬 ' + PACK_TIP));
    box.appendChild(pk);
    /* what Logan has to get ready */
    var pr = el('section', 'list');
    pr.appendChild(el('h2', null, NAMES.a + ' 要准备的'));
    var px = extrasFor('prep', '');
    var pg = px.filter(function (x) { return shared.check && shared.check[x[0]]; }).length;
    pr.appendChild(el('p', 'sub', px.length ? '做好了 ' + pg + '/' + px.length : '接机、住的、吃的、要订的……想到就加上'));
    var ul = el('ul', 'items');
    px.forEach(function (x) { ul.appendChild(itemRow(x[0], x[1], true)); });
    pr.appendChild(ul);
    pr.appendChild(addBox('prep', '', '加一件要准备的事', true));
    box.appendChild(pr);
    if (keepFocus) { var f = box.querySelector('form[data-k="' + keepFocus + '"] input'); if (f) f.focus(); keepFocus = null; }
  }

  /* ---------- tabs ---------- */
  var tab = 'plan';
  try { if (localStorage.getItem('qzm-trip-tab') === 'lists') tab = 'lists'; } catch (e) { /* fine */ }
  function showTab() {
    document.querySelectorAll('#tabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tab') === tab)); });
    $('tab-plan').hidden = tab !== 'plan'; $('tab-lists').hidden = tab !== 'lists';
  }
  document.querySelectorAll('#tabs button').forEach(function (b) {
    b.onclick = function () { tab = b.getAttribute('data-tab'); try { localStorage.setItem('qzm-trip-tab', tab); } catch (e) { /* fine */ } showTab(); };
  });

  /* ---------- snow ---------- */
  (function () {
    var cv = $('snow'); if (!cv || !cv.getContext) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cx = cv.getContext('2d'), W = 0, H = 0, flakes = [];
    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 70; i++) flakes.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, s: .15 + Math.random() * .45, w: Math.random() * 6.28 });
    function step() {
      cx.clearRect(0, 0, W, H); cx.fillStyle = 'rgba(235, 244, 255, .7)';
      flakes.forEach(function (f) {
        f.y += f.s / H * 1.6; f.w += .01; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); }
        cx.beginPath(); cx.arc((f.x + Math.sin(f.w) * .01) * W, f.y * H, f.r, 0, 6.29); cx.fill();
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  /* ---------- start ---------- */
  function renderAll() { renderDays(); renderLists(); tickCount(); }
  renderWho(); showTab(); renderAll();
  setInterval(tickCount, 30000);
  if (db) {
    db.collection('places').doc('_people').onSnapshot(function (d) {
      var p = d.exists ? d.data() : null;
      if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; renderWho(); renderAll(); }
    }, function () {});
    REF.onSnapshot(function (d) {
      var x = (d.exists && d.data()) || {};
      shared = { check: x.check || {}, stop: x.stop || {}, extra: x.extra || {} };
      try { localStorage.setItem('qzm-trip', JSON.stringify(shared)); } catch (e) { /* fine */ }
      banner(null);
      var typing = document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.value;
      renderDays();
      if (!typing) renderLists();
    }, function () { banner('同步断开了，刷新一下试试。'); });
  }
})();
