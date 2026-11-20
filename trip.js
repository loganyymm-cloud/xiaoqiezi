(function () {
  'use strict';
  /* One trip, chosen by ?t=<id>. Toronto (no id, or t=toronto) has its day-by-day plan built in, from the
     圆周旅迹 PDF; every other trip is planned here and lives in places/_trip_<id>:
       meta  {title, place, start, end, sub, by, at}
       plan  {<sid>: {day, time, name, note, tag, by, at}}   stops added on the page (Toronto can have them too)
       dayt  {<dayIndex>: text}                            names for the days
       check / stop / extra                                ticks, check-ins, list items (same as before) */
  var Q = window.QZTrip;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  var TID = Q.cleanId(new URLSearchParams(location.search).get('t')) || 'toronto';
  var TOR = TID === 'toronto';

  /* ---------- Toronto's built-in plan ---------- */
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

  /* ---------- the packing list Logan wrote for Toronto, word for word ---------- */
  var PACK = [
    { id: 'outer', t: '衣服类（外套）', items: [['o1', '羽绒'], ['o2', '帽子'], ['o3', '手套'], ['o4', '围巾'], ['-', '以下可节省'], ['o5', '羽绒内胆'], ['o6', '雪裤或者加绒裤（一般用不到）'], ['o7', 'balaclava or neck gaiter']] },
    { id: 'inner', t: '衣服类（内层）', items: [['i1', '上衣（指里面的）（暖气超足，感觉醉氧）'], ['i2', '毛衣卫衣（mid）'], ['i3', '裤子（反正类似牛仔裤什么的）'], ['i4', '打底裤（这个好像说你并不需要）'], ['i5', '睡衣内衣裤']] },
    { id: 'shoes', t: '鞋袜类', items: [['s1', '这个你谁便，但是我怕你运动鞋袜子薄冰脚'], ['s2', '厚袜子有吧'], ['s3', '冰爪这个我有也没用过，小心一点摔不到😂']] },
    { id: 'warm', t: '防寒类', items: [['w1', '暖宝宝（用不完好吧）'], ['w2', '充电宝'], ['w3', '墨镜（紫外线很强）']] },
    { id: 'care', t: '护肤个人类', items: [['c1', '身体乳、面霜。干干干很干'], ['c2', '唇膏（这个有就顺手没有我给你）'], ['c3', '护手霜（这个也不用）'], ['c4', '隐形眼镜要带眼药水（怕针眼）'], ['c5', '化妆品生理用品'], ['c6', '其实没事我带不带都行（去趟shopping店就有了之前给Allen姐姐买过）'], ['c7', '吹风机、洗发水、沐浴露、转换插头这些我都有好吧']] },
    { id: 'tech', t: '电子产品类', items: [['e1', '充电线，手机，平板，电脑这一类自己看着来'], ['e2', 'Check电话卡有没有带ca的漫游'], ['e3', '相机什么的我怕你手冻😂']] }
  ];
  var PACK_TIP = '别带太多东西我怕你买东西😂看着来就行';
  var TAGS = ['游玩', '吃喝', '购物', '交通', '住宿', '其他'];

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
  var meta = TOR ? Q.TORONTO : null;
  var shared = { check: {}, stop: {}, extra: {}, plan: {}, dayt: {} };
  var CK = TOR ? 'qzm-trip' : 'qzm-trip-' + TID;
  function adopt(x) {
    shared = { check: x.check || {}, stop: x.stop || {}, extra: x.extra || {}, plan: x.plan || {}, dayt: x.dayt || {} };
    if (!TOR && x.meta) meta = x.meta;
  }
  try { var c = JSON.parse(localStorage.getItem(CK) || 'null'); if (c) adopt(c); } catch (e) { /* fresh */ }
  var db = null, REF = null, FV = null;
  try {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); FV = fb.firestore.FieldValue; REF = db.collection('places').doc(Q.docId(TID)); }
  } catch (e) { db = null; }
  function banner(t) { var b = $('banner'); if (t) { b.textContent = t; b.hidden = false; } else b.hidden = true; }
  if (!db) banner('连不上同步数据库，现在只能看，改动存不了。');
  function needMe() { if (me) return true; toast('先在右上角选一下你是谁'); return false; }
  function put(o) {
    if (!REF) { toast('连不上数据库，没存上'); return Promise.reject(); }
    return REF.set(o, { merge: true }).catch(function () { toast('没存上，再试一次'); throw new Error('save'); });
  }
  function drop(paths) {
    if (!REF || !FV) { toast('连不上数据库'); return Promise.reject(); }
    var o = {}; paths.forEach(function (p) { o[p] = FV.delete(); });
    return REF.update(o).catch(function () { toast('没改上，再试一次'); throw new Error('save'); });
  }
  function toggle(kind, id) {
    if (!needMe()) return;
    if (!FV) { toast('连不上数据库，没存上'); return; }
    var on = shared[kind] && shared[kind][id], o = {}; o[kind] = {};
    o[kind][id] = on ? FV.delete() : { by: me, at: Date.now() };
    put(o).catch(function () {});
  }

  /* ---------- the days, built-in and added ---------- */
  function dayList() {
    if (TOR) return DAYS.map(function (d) { return { date: d.date, wd: d.wd, title: d.title, from: d.from, fixed: d.stops }; });
    return Q.days(meta).map(function (d, i) { return { date: d.md, wd: d.wd, title: shared.dayt[i] || '', fixed: [] }; });
  }
  function timeKey(t) { var m = /(\d{1,2})[:：](\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 9999; }
  function addedFor(i, n) {
    var p = shared.plan || {};
    return Object.keys(p).filter(function (k) {
      var s = p[k]; if (!s || !s.name) return false;
      var d = +s.day; return i === -1 ? !(d >= 0 && d < n) : d === i;
    }).sort(function (x, y) { return (timeKey(p[x].time) - timeKey(p[y].time)) || ((p[x].at || 0) - (p[y].at || 0)); });
  }

  /* ---------- hero, countdown ---------- */
  function renderHero() {
    if (!meta) return;
    var ds = dayList(), n = ds.length, stops = TOR ? Q.TORONTO.builtinStops : 0;
    stops += Object.keys(shared.plan || {}).filter(function (k) { return shared.plan[k] && shared.plan[k].name; }).length;
    document.title = meta.title;
    $('h-title').textContent = meta.title;
    var fl = $('c-flights'); fl.textContent = '';
    function fline(lab, v, rest) { var s = el('span', null, lab + ' '); s.appendChild(el('b', null, v)); if (rest) s.appendChild(document.createTextNode(' ' + rest)); fl.appendChild(s); }
    if (TOR) {
      $('h-kicker').textContent = 'TORONTO · 2026.12.19 – 12.29';
      $('h-sub').textContent = '11 天 10 晚 · ' + stops + ' 个地点 · 我们两个人的冬天';
      var r = $('h-route'); r.textContent = ''; r.hidden = false;
      ['皮尔地区', '多伦多', '哈密尔顿', '尼亚加拉', '约克地区', '安大略湖'].forEach(function (x) { r.appendChild(el('li', null, x)); });
      fline('落地', '12.19 周六 15:56', '皮尔逊机场');
      fline('起飞', '12.29 周二 12:55', '皮尔逊机场');
      $('foot-plan').textContent = '行程来自圆周旅迹（行程口令 IRYM）。到了一个地方就点左边的圈打个卡，两边都能看到；想加的地方点「+ 加一个地点」。';
    } else {
      $('h-kicker').textContent = (meta.place ? meta.place + ' · ' : '') + Q.range(meta);
      $('h-sub').textContent = n + ' 天' + (n > 1 ? ' ' + (n - 1) + ' 晚' : '') + ' · ' + stops + ' 个地点' + (meta.sub ? ' · ' + meta.sub : '');
      $('h-route').hidden = true;
      if (n) { fline('出发', ds[0].date + ' ' + ds[0].wd); if (n > 1) fline('回来', ds[n - 1].date + ' ' + ds[n - 1].wd); }
      if (meta.by && NAMES[meta.by]) fl.appendChild(el('span', null, NAMES[meta.by] + ' 开的头'));
      $('foot-plan').textContent = '点开一天，加地点、起名字；到了就点左边的圈打卡。两边改的都会马上同步。';
    }
    $('h-edit').hidden = TOR;
  }
  function tickCount() {
    if (!meta) return;
    var big = $('c-big'), what = $('c-what'), s = Q.status(meta), ds = dayList();
    big.textContent = '';
    function part(n, u) { big.appendChild(document.createTextNode(String(n))); big.appendChild(el('small', null, u)); }
    if (s.state === 'before') {
      var sec = Math.floor(s.ms / 1000);
      what.textContent = TOR ? NAMES.b + ' 落地多伦多还有' : '离出发还有';
      part(Math.floor(sec / 86400), '天'); part(Math.floor(sec % 86400 / 3600), '小时'); part(Math.floor(sec % 3600 / 60), '分');
    } else if (s.state === 'during') {
      var d = ds[s.day] || {};
      what.textContent = '我们在' + (TOR ? '多伦多' : (meta.place || '路上')) + (d.title ? ' · 今天：' + d.title : '');
      part('第 ' + (s.day + 1), '天'); big.appendChild(document.createTextNode(' / ' + ds.length));
    } else {
      what.textContent = '这趟旅行已经过去了';
      part(s.days, '天');
    }
  }
  function todayIndex() { if (!meta) return -1; var s = Q.status(meta); return s.state === 'during' ? s.day : -1; }

  /* ---------- editing the trip itself ---------- */
  var metaOpen = false, delArm = 0;
  $('h-edit').onclick = function () { metaOpen = !metaOpen; renderMeta(); };
  function field(lab, input) { var w = el('label', 'fld'); w.appendChild(el('span', null, lab)); w.appendChild(input); return w; }
  function inp(type, val, ph, max) { var i = el('input'); i.type = type; i.defaultValue = val || ''; if (ph) i.placeholder = ph; if (max) i.maxLength = max; return i; }
  function renderMeta() {
    var f = $('meta-form'); f.textContent = ''; f.hidden = !metaOpen || TOR || !meta;
    $('h-edit').textContent = metaOpen ? '收起' : '改一改这次旅行';
    if (f.hidden) return;
    var t = inp('text', meta.title, '名字', 40), p = inp('text', meta.place, '目的地', 40), a = inp('date', meta.start), b = inp('date', meta.end), s = inp('text', meta.sub, '一句话（可不填）', 60);
    f.append(field('名字', t), field('去哪', p));
    var row = el('div', 'two'); row.append(field('出发', a), field('回来', b)); f.appendChild(row);
    f.appendChild(field('一句话', s));
    var acts = el('div', 'acts');
    var del = el('button', 'btn del', '删掉这次旅行'); del.type = 'button';
    del.onclick = function () {
      if (Date.now() - delArm > 4000) { delArm = Date.now(); del.textContent = '再点一次就删掉，删了找不回来'; return; }
      if (!REF) { toast('连不上数据库'); return; }
      REF.delete().then(function () { try { localStorage.removeItem(CK); } catch (e) { /* fine */ } location.href = 'trips.html'; }, function () { toast('没删掉，再试一次'); });
    };
    var ok = el('button', 'btn main', '存好'); ok.type = 'submit';
    acts.append(del, ok); f.appendChild(acts);
    f.onsubmit = function (ev) {
      ev.preventDefault(); if (!needMe()) return;
      var m = { title: t.value.trim(), place: p.value.trim(), start: a.value, end: b.value, sub: s.value.trim() };
      var bad = Q.validate(m); if (bad) { toast(bad); return; }
      var n = Q.days(m).length, out = Object.keys(shared.plan || {}).filter(function (k) { var x = shared.plan[k]; return x && x.name && !(+x.day < n); }).length;
      m.edited = { by: me, at: Date.now() };
      put({ meta: m }).then(function () {
        metaOpen = false; renderMeta();
        toast(out ? '存好了 · 有 ' + out + ' 个地点不在新日期里，放在最下面了' : '存好了');
      }, function () {});
    };
  }

  /* ---------- the days ---------- */
  var open = {}, editing = null, adding = null, armed = {};
  (function () { var i = todayIndex(); open[i >= 0 ? i : 0] = true; })();
  function chevron() {
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    c.setAttribute('viewBox', '0 0 24 24'); c.setAttribute('class', 'chev'); c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    return c;
  }
  function tickFor(id, label) {
    var got = shared.stop && shared.stop[id];
    var b = el('button', 'tick' + (got ? ' ' + got.by : ''), got ? '✓' : ''); b.type = 'button';
    b.setAttribute('aria-pressed', String(!!got)); b.setAttribute('aria-label', (got ? '取消打卡：' : '打卡：') + label);
    b.onclick = function () { toggle('stop', id); };
    return b;
  }
  function stopBody(tag, time, name, note, got) {
    var body = el('div');
    var when = el('div', 'when'); when.appendChild(el('span', 'tag', tag || '其他')); if (time) when.appendChild(el('span', null, time));
    body.appendChild(when);
    body.appendChild(el('p', 'name', name));
    if (note) body.appendChild(el('p', 'note', note));
    if (got) body.appendChild(el('p', 'by', NAMES[got.by] + ' 打卡 · ' + md(got.at)));
    return body;
  }
  function stopForm(day, sid) {
    var s = sid ? shared.plan[sid] : {};
    var f = el('form', 'stopform'); f.autocomplete = 'off';
    var tag = el('select'); tag.setAttribute('aria-label', '类型');
    TAGS.forEach(function (t) { var o = el('option', null, t); o.value = t; if ((s.tag || '游玩') === t) o.selected = true; tag.appendChild(o); });
    var time = inp('text', s.time, '时间，比如 14:00', 24); time.setAttribute('aria-label', '时间');
    var name = inp('text', s.name, '去哪儿 / 做什么', 80); name.setAttribute('aria-label', '地点');
    var note = inp('text', s.note, '备注（可不填）', 160); note.setAttribute('aria-label', '备注');
    var r1 = el('div', 'r'); r1.append(tag, time);
    var acts = el('div', 'r end');
    var no = el('button', 'btn', sid ? '取消' : '收起'); no.type = 'button';
    no.onclick = function () { editing = null; adding = null; renderDays(); };
    var ok = el('button', 'btn main', sid ? '存好' : '+ 加上'); ok.type = 'submit';
    acts.append(no, ok);
    f.append(r1, name, note, acts);
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var nm = name.value.trim(); if (!nm) { toast('写一下去哪儿'); name.focus(); return; }
      if (!needMe()) return;
      var id = sid || uid('p'), o = { plan: {} };
      var rec = { day: sid ? s.day : day, tag: tag.value, time: time.value.trim(), name: nm, note: note.value.trim() };
      if (sid) rec.edited = { by: me, at: Date.now() }; else { rec.by = me; rec.at = Date.now(); }
      o.plan[id] = rec;
      put(o).then(function () { editing = null; if (!sid) { adding = day; keepFocusSel = '.stopform input[aria-label="地点"]'; } renderDays(); }, function () {});
    };
    return f;
  }
  var keepFocusSel = null;
  function addedRow(sid) {
    var s = shared.plan[sid], got = shared.stop && shared.stop[sid];
    if (editing === sid) { var li0 = el('li', 'stop editing'); li0.appendChild(el('span')); li0.appendChild(stopForm(s.day, sid)); return li0; }
    var li = el('li', 'stop added');
    var body = stopBody(s.tag, s.time, s.name, s.note, got);
    var acts = el('div', 'sacts');
    var ed = el('button', null, '改'); ed.type = 'button'; ed.onclick = function () { editing = sid; adding = null; renderDays(); };
    var x = el('button', 'del', armed[sid] ? '确定删？' : '删'); x.type = 'button';
    x.onclick = function () {
      if (!armed[sid]) { armed[sid] = true; renderDays(); setTimeout(function () { if (armed[sid]) { delete armed[sid]; renderDays(); } }, 3500); return; }
      delete armed[sid];
      drop(['plan.' + sid, 'stop.' + sid]).catch(function () {});
    };
    acts.append(ed, x);
    if (s.by && NAMES[s.by]) acts.appendChild(el('span', 'who-add', NAMES[s.by] + ' 加的'));
    body.appendChild(acts);
    li.append(tickFor(sid, s.name), body);
    return li;
  }
  function dayNameForm(i) {
    var f = el('form', 'dname'); f.autocomplete = 'off';
    var v = shared.dayt[i] || '';
    var x = inp('text', v, '给这天起个名字，比如「去看海」', 40); x.setAttribute('aria-label', '这一天的名字');
    var b = el('button', null, '存'); b.type = 'submit';
    f.append(x, b);
    f.onsubmit = function (ev) {
      ev.preventDefault(); if (!needMe()) return;
      var t = x.value.trim(); if (t === v) return;
      var o = { dayt: {} }; o.dayt[i] = t;
      (t ? put(o) : drop(['dayt.' + i])).then(function () { toast('存好了'); renderDays(); renderHero(); }, function () {});
    };
    return f;
  }
  function renderDays() {
    var ol = $('days'); ol.textContent = '';
    if (!meta) return;
    var ds = dayList(), n = ds.length, ti = todayIndex();
    var groups = ds.map(function (d, i) { return { d: d, i: i }; });
    if (addedFor(-1, n).length) groups.push({ d: { date: '', wd: '', title: '日期外的安排', fixed: [] }, i: -1 });
    groups.forEach(function (g) {
      var d = g.d, i = g.i, extra = addedFor(i, n);
      var isToday = i >= 0 && i === ti;
      var li = el('li', 'day' + (isToday ? ' today' : '') + (i === -1 ? ' orphan' : ''));
      li.setAttribute('aria-expanded', String(!!open[i]));
      var head = el('button'); head.type = 'button';
      var dd = el('div', 'd');
      if (i >= 0) { dd.appendChild(el('b', null, String(i + 1))); dd.appendChild(el('span', null, 'DAY')); } else dd.appendChild(el('b', null, '…'));
      var tt = el('div', 't'), tb = el('b', d.title ? null : 'unnamed', d.title || '还没起名字');
      if (isToday) tb.appendChild(el('span', 'now', '今天'));
      var cnt = d.fixed.length + extra.length;
      var doneN = d.fixed.filter(function (_, k) { return shared.stop && shared.stop['d' + (i + 1) + 's' + (k + 1)]; }).length
        + extra.filter(function (k) { return shared.stop && shared.stop[k]; }).length;
      tt.appendChild(tb);
      tt.appendChild(el('span', null, (d.date ? d.date + ' ' + d.wd + ' · ' : '') + (cnt ? cnt + ' 个地点' : '还没排') + (doneN ? ' · 打卡 ' + doneN + '/' + cnt : '')));
      head.append(dd, tt, chevron());
      head.onclick = function () { open[i] = !open[i]; renderDays(); };
      li.appendChild(head);
      if (open[i]) {
        var ul = el('ul', 'stops');
        if (!TOR && i >= 0) { var nm = el('li', 'dn'); nm.appendChild(dayNameForm(i)); ul.appendChild(nm); }
        if (i === -1) ul.appendChild(el('li', 'leg plain', '这些地点的日子不在现在的出发—回来之间了。点「改」可以挪到别的天。'));
        if (d.from) ul.appendChild(el('li', 'leg', '从 ' + d.from[0] + ' 出发' + (d.from[1] ? '：' + d.from[1] : '')));
        d.fixed.forEach(function (s, k) {
          var id = 'd' + (i + 1) + 's' + (k + 1), got = shared.stop && shared.stop[id];
          var row = el('li', 'stop');
          row.append(tickFor(id, s[2]), stopBody(s[0], s[1], s[2], s[3], got));
          ul.appendChild(row);
          if (s[4]) ul.appendChild(el('li', 'leg', s[4]));
        });
        extra.forEach(function (sid) { ul.appendChild(addedRow(sid)); });
        if (i >= 0) {
          var ad = el('li', 'addstop');
          if (adding === i) ad.appendChild(stopForm(i, null));
          else { var b = el('button', 'addlink', '+ 加一个地点'); b.type = 'button'; b.onclick = function () { adding = i; editing = null; keepFocusSel = '.stopform input[aria-label="地点"]'; renderDays(); }; ad.appendChild(b); }
          ul.appendChild(ad);
        }
        li.appendChild(ul);
      }
      ol.appendChild(li);
    });
    /* moving an added stop to another day */
    if (editing && shared.plan[editing]) {
      var f = ol.querySelector('.stop.editing form');
      if (f) {
        var sel = el('select'); sel.setAttribute('aria-label', '哪一天');
        ds.forEach(function (d, i) { var o = el('option', null, '第 ' + (i + 1) + ' 天 · ' + d.date + ' ' + d.wd); o.value = i; if (+shared.plan[editing].day === i) o.selected = true; sel.appendChild(o); });
        if (!(+shared.plan[editing].day >= 0 && +shared.plan[editing].day < n)) { var o2 = el('option', null, '先放着'); o2.value = shared.plan[editing].day; o2.selected = true; sel.insertBefore(o2, sel.firstChild); }
        f.querySelector('.r').appendChild(sel);
        var sub = f.onsubmit;
        f.onsubmit = function (ev) { shared.plan[editing].day = +sel.value; return sub(ev); };
      }
    }
    if (keepFocusSel) { var x = ol.querySelector(keepFocusSel); if (x) x.focus(); keepFocusSel = null; }
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
      x.onclick = function () { drop(['extra.' + id, 'check.' + id]).catch(function () {}); };
      li.appendChild(x);
    } else li.appendChild(el('span'));
    return li;
  }
  var addOpen = {}, keepFocus = null;
  function addBox(list, cat, ph, always) {
    var k = list + '/' + (cat || '');
    if (!always && !addOpen[k]) {
      var a = el('button', 'addlink', '+ 加一样'); a.type = 'button';
      a.onclick = function () { addOpen[k] = true; keepFocus = k; renderLists(); };
      return a;
    }
    var f = el('form', 'add'); f.autocomplete = 'off';
    var i = el('input'); i.placeholder = ph; i.maxLength = 120; i.setAttribute('aria-label', ph);
    var b = el('button', null, '+ 加'); b.type = 'submit';
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var t = i.value.trim(); if (!t || !needMe()) return;
      var id = uid('x'), o = { extra: {} };
      o.extra[id] = { list: list, cat: cat || '', text: t, by: me, at: Date.now() };
      keepFocus = k;
      put(o).then(function () { i.value = ''; renderLists(); }, function () {});
    };
    f.setAttribute('data-k', k);
    f.append(i, b);
    return f;
  }
  function simpleList(title, list, emptyTip, ph) {
    var sec = el('section', 'list');
    sec.appendChild(el('h2', null, title));
    var xs = extrasFor(list, ''), g = xs.filter(function (x) { return shared.check && shared.check[x[0]]; }).length;
    sec.appendChild(el('p', 'sub', xs.length ? '好了 ' + g + '/' + xs.length : emptyTip));
    var ul = el('ul', 'items');
    xs.forEach(function (x) { ul.appendChild(itemRow(x[0], x[1], true)); });
    sec.appendChild(ul);
    sec.appendChild(addBox(list, '', ph, true));
    return sec;
  }
  function renderLists() {
    var box = $('lists'); box.textContent = '';
    if (!meta) return;
    if (TOR) {
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
      box.appendChild(simpleList(NAMES.a + ' 要准备的', 'prep', '接机、住的、吃的、要订的……想到就加上', '加一件要准备的事'));
    } else {
      box.appendChild(simpleList('行李清单', 'pack', '要带的东西，想到一样加一样', '加一样要带的'));
      box.appendChild(simpleList('要准备的', 'prep', '订票、订住的、换钱、查天气……', '加一件要准备的事'));
    }
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

  /* ---------- snow, for winter trips ---------- */
  var snowOn = false;
  function snow() {
    if (snowOn || !meta || !Q.winter(meta)) return;
    var cv = $('snow'); if (!cv || !cv.getContext) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    snowOn = true;
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
  }

  /* ---------- start ---------- */
  function renderAll() { renderHero(); renderDays(); renderLists(); tickCount(); snow(); }
  /* redraw a section unless something is half-typed there; keep the cursor where it was */
  function rerender(id, fn) {
    var root = $(id), dirty = Array.prototype.some.call(root.querySelectorAll('form input'), function (i) { return i.value !== i.defaultValue; });
    if (dirty) return;
    var a = document.activeElement, lab = a && root.contains(a) && a.getAttribute('aria-label');
    fn();
    if (lab) { var x = root.querySelector('[aria-label="' + lab.replace(/"/g, '\\"') + '"]'); if (x) x.focus(); }
  }
  function gone() { $('body').hidden = true; $('gone').hidden = false; document.title = '找不到这次旅行'; }
  renderWho(); showTab(); renderAll();
  setInterval(tickCount, 30000);
  if (db) {
    db.collection('places').doc('_people').onSnapshot(function (d) {
      var p = d.exists ? d.data() : null;
      if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; renderWho(); renderAll(); }
    }, function () {});
    REF.onSnapshot(function (d) {
      if (!TOR && !d.exists) { if (!(d.metadata && d.metadata.fromCache)) { try { localStorage.removeItem(CK); } catch (e) { /* fine */ } gone(); } return; }
      var x = (d.exists && d.data()) || {};
      if (!TOR && !x.meta) { gone(); return; }
      adopt(x);
      $('body').hidden = false; $('gone').hidden = true;
      try { localStorage.setItem(CK, JSON.stringify(x)); } catch (e) { /* fine */ }
      banner(null);
      renderHero(); tickCount(); snow();
      rerender('days', renderDays); rerender('lists', renderLists);
      if (!metaOpen) renderMeta();
    }, function () { banner('同步断开了，刷新一下试试。'); });
  } else if (!TOR && !meta) gone();
})();
