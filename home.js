(function () {
  'use strict';

  /* ======================================================================
     Words
     ====================================================================== */
  var LANGS = [['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'], ['fr', 'Français']];
  var T = {
    'zh-CN': {
      books: '一起读书', booksEmpty: '一起读同一本书，划线写给对方', openBooks: '打开书房', readingLine: '{name} 在读{book}',
      title: '我们的小世界', cards: '这里有的东西', look: '打开看看', openCd: '打开倒计时', earth: '我们的地球', earthEmpty: '一起去过的地方，都记在这里', openEarth: '打开地球',
      line: { since: '{name} 已经 {n} 天', left: '{name} 还有 {n} 天', today: '{name} 就是今天' }, lit: '点亮了 {n} 个地方', photos: '一起存了 {n} 张照片',
      settings: '设置', done: '完成', lang: '语言', langNote: '只改这台设备', bg: '背景', bgNote: '改了两边都会看到',
      scene: '场景', sc_space: '星空', sc_aubergine: '茄子夜', sc_dusk: '晚霞', sc_ocean: '深海', sc_snow: '雪天', sc_sakura: '樱花', sc_milktea: '奶茶', sc_ink: '纯黑',
      upload: '上传背景图', change: '换一张', remove: '移除图片', imgAlpha: '背景图透明度', blur: '背景模糊', dim: '背景变暗', fit: '图片显示', fill: '铺满', whole: '完整',
      stars: '星星和流星', cardAlpha: '卡片透明度', saved: '已保存，两边都会看到', saving: '正在保存…', local: '连不上数据库，背景只在这台设备上生效', fail: '没保存上，再试一次',
      reset: '恢复默认', imgFail: '这张图片打不开，换一张试试'
    },
    'zh-TW': {
      books: '一起讀書', booksEmpty: '一起讀同一本書，劃線寫給對方', openBooks: '打開書房', readingLine: '{name} 在讀{book}',
      title: '我們的小世界', cards: '這裡有的東西', look: '打開看看', openCd: '打開倒數', earth: '我們的地球', earthEmpty: '一起去過的地方，都記在這裡', openEarth: '打開地球',
      line: { since: '{name} 已經 {n} 天', left: '{name} 還有 {n} 天', today: '{name} 就是今天' }, lit: '點亮了 {n} 個地方', photos: '一起存了 {n} 張照片',
      settings: '設定', done: '完成', lang: '語言', langNote: '只改這台裝置', bg: '背景', bgNote: '改了兩邊都會看到',
      scene: '場景', sc_space: '星空', sc_aubergine: '茄子夜', sc_dusk: '晚霞', sc_ocean: '深海', sc_snow: '雪天', sc_sakura: '櫻花', sc_milktea: '奶茶', sc_ink: '純黑',
      upload: '上傳背景圖', change: '換一張', remove: '移除圖片', imgAlpha: '背景圖透明度', blur: '背景模糊', dim: '背景變暗', fit: '圖片顯示', fill: '鋪滿', whole: '完整',
      stars: '星星和流星', cardAlpha: '卡片透明度', saved: '已儲存，兩邊都會看到', saving: '正在儲存…', local: '連不上資料庫，背景只在這台裝置上生效', fail: '沒儲存上，再試一次',
      reset: '恢復預設', imgFail: '這張圖片打不開，換一張試試'
    },
    en: {
      books: 'Reading Together', booksEmpty: 'Read the same book and leave notes for each other', openBooks: 'Open the reading room', readingLine: '{name} is reading {book}',
      title: 'Our Little World', cards: 'What’s here', look: 'Take a look', openCd: 'Open the countdown', earth: 'Our Earth', earthEmpty: 'Every place we’ve been together', openEarth: 'Open the earth',
      line: { since: '{name}: {n} days so far', left: '{name}: {n} days to go', today: '{name}: today!' }, lit: '{n} places lit up', photos: '{n} photos saved together',
      settings: 'Settings', done: 'Done', lang: 'Language', langNote: 'this device only', bg: 'Background', bgNote: 'both of you will see it',
      scene: 'Scene', sc_space: 'Starry sky', sc_aubergine: 'Eggplant night', sc_dusk: 'Dusk', sc_ocean: 'Deep sea', sc_snow: 'Snow day', sc_sakura: 'Sakura', sc_milktea: 'Milk tea', sc_ink: 'Black',
      upload: 'Upload a background', change: 'Change image', remove: 'Remove image', imgAlpha: 'Image transparency', blur: 'Blur', dim: 'Darken', fit: 'Image fit', fill: 'Fill', whole: 'Fit',
      stars: 'Stars and shooting stars', cardAlpha: 'Card transparency', saved: 'Saved. You both see this.', saving: 'Saving…', local: 'No connection to the database, so this only applies on this device.', fail: 'Could not save. Try again.',
      reset: 'Reset', imgFail: 'This image could not be opened. Try another one.'
    },
    ja: {
      books: '一緒に読書', booksEmpty: '同じ本を読んで、線を引いてメモを残そう', openBooks: '書斎を開く', readingLine: '{name} は{book}を読んでいます',
      title: '私たちの小さな世界', cards: 'ここにあるもの', look: '開いてみる', openCd: 'カウントダウンを開く', earth: '私たちの地球', earthEmpty: '一緒に行った場所をここに', openEarth: '地球を開く',
      line: { since: '{name} から {n} 日', left: '{name} まで あと {n} 日', today: '{name} は今日' }, lit: '{n} か所が光っています', photos: '一緒に保存した写真 {n} 枚',
      settings: '設定', done: '完了', lang: '言語', langNote: 'この端末だけ', bg: '背景', bgNote: '二人とも同じ背景になります',
      scene: 'シーン', sc_space: '星空', sc_aubergine: 'なすの夜', sc_dusk: '夕焼け', sc_ocean: '深海', sc_snow: '雪の日', sc_sakura: '桜', sc_milktea: 'ミルクティー', sc_ink: '黒',
      upload: '背景画像をアップロード', change: '画像を変更', remove: '画像を削除', imgAlpha: '画像の透明度', blur: 'ぼかし', dim: '暗くする', fit: '画像の表示', fill: '全体に広げる', whole: '全体を表示',
      stars: '星と流れ星', cardAlpha: 'カードの透明度', saved: '保存しました。二人とも同じに見えます。', saving: '保存中…', local: 'データベースにつながらないため、この端末だけに反映されます。', fail: '保存できませんでした。もう一度お試しください。',
      reset: '初期設定に戻す', imgFail: 'この画像は開けません。別の画像をお試しください。'
    },
    ko: {
      books: '함께 읽기', booksEmpty: '같은 책을 읽고 서로에게 메모를 남겨요', openBooks: '서재 열기', readingLine: '{name}님이 {book} 읽는 중',
      title: '우리의 작은 세상', cards: '여기 있는 것들', look: '열어 보기', openCd: '카운트다운 열기', earth: '우리의 지구', earthEmpty: '함께 간 곳을 모두 여기에', openEarth: '지구 열기',
      line: { since: '{name} {n}일째', left: '{name}까지 {n}일', today: '{name} 바로 오늘' }, lit: '{n}곳이 빛나고 있어요', photos: '함께 저장한 사진 {n}장',
      settings: '설정', done: '완료', lang: '언어', langNote: '이 기기에만 적용', bg: '배경', bgNote: '둘 다 같은 배경이 보여요',
      scene: '장면', sc_space: '별하늘', sc_aubergine: '가지 밤', sc_dusk: '노을', sc_ocean: '깊은 바다', sc_snow: '눈 오는 날', sc_sakura: '벚꽃', sc_milktea: '밀크티', sc_ink: '검정',
      upload: '배경 이미지 올리기', change: '이미지 바꾸기', remove: '이미지 삭제', imgAlpha: '이미지 투명도', blur: '흐림', dim: '어둡게', fit: '이미지 표시', fill: '채우기', whole: '전체 보기',
      stars: '별과 별똥별', cardAlpha: '카드 투명도', saved: '저장했어요. 둘 다 이렇게 보여요.', saving: '저장 중…', local: '데이터베이스에 연결되지 않아 이 기기에만 적용돼요.', fail: '저장하지 못했어요. 다시 시도해 주세요.',
      reset: '기본값으로', imgFail: '이 이미지를 열 수 없어요. 다른 이미지를 사용해 주세요.'
    },
    fr: {
      books: 'Lire ensemble', booksEmpty: 'Lire le même livre et se laisser des notes', openBooks: 'Ouvrir la bibliothèque', readingLine: '{name} lit {book}',
      title: 'Notre petit monde', cards: 'Ce qu’il y a ici', look: 'Jeter un œil', openCd: 'Ouvrir le compte à rebours', earth: 'Notre Terre', earthEmpty: 'Tous les endroits où nous sommes allés ensemble', openEarth: 'Ouvrir la Terre',
      line: { since: '{name} : déjà {n} jours', left: '{name} : encore {n} jours', today: '{name} : c’est aujourd’hui' }, lit: '{n} endroits allumés', photos: '{n} photos gardées ensemble',
      settings: 'Réglages', done: 'Terminé', lang: 'Langue', langNote: 'sur cet appareil seulement', bg: 'Arrière-plan', bgNote: 'vous le verrez tous les deux',
      scene: 'Décor', sc_space: 'Ciel étoilé', sc_aubergine: 'Nuit aubergine', sc_dusk: 'Crépuscule', sc_ocean: 'Océan profond', sc_snow: 'Jour de neige', sc_sakura: 'Sakura', sc_milktea: 'Thé au lait', sc_ink: 'Noir',
      upload: 'Téléverser une image', change: 'Changer l’image', remove: 'Retirer l’image', imgAlpha: 'Transparence de l’image', blur: 'Flou', dim: 'Assombrir', fit: 'Affichage', fill: 'Remplir', whole: 'Entière',
      stars: 'Étoiles et étoiles filantes', cardAlpha: 'Transparence des cartes', saved: 'Enregistré. Vous le voyez tous les deux.', saving: 'Enregistrement…', local: 'Pas de connexion à la base : seulement sur cet appareil.', fail: 'Échec de l’enregistrement. Réessaie.',
      reset: 'Réinitialiser', imgFail: 'Impossible d’ouvrir cette image. Essaie avec une autre.'
    }
  };
  var LANG_KEY = 'qzm-home-lang';
  var lang = 'zh-CN';
  try { var sl = localStorage.getItem(LANG_KEY); if (T[sl]) lang = sl; } catch (e) { /* storage off */ }
  function t(k) { var v = T[lang][k]; return v == null ? T['zh-CN'][k] : v; }

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
  /* a line like "相识 已经 110 天" with the number set large */
  function richLine(tpl, vars) {
    var li = document.createElement('li');
    tpl.split(/(\{name\}|\{n\})/).forEach(function (part) {
      if (part === '{n}') { if (vars.n == null) return; var b = document.createElement('b'); b.textContent = vars.n; li.appendChild(b); }
      else if (part === '{name}') li.appendChild(document.createTextNode(vars.name || ''));
      else if (part) li.appendChild(document.createTextNode(part));
    });
    return li;
  }

  /* ======================================================================
     Background
     ====================================================================== */
  var SCENES = {
    space: { tone: 'dark', css: 'radial-gradient(80% 80% at 50% 45%, #0b0d1f 0%, #03040a 100%)', base: true },
    aubergine: { tone: 'dark', css: 'radial-gradient(120% 80% at 82% 0%, #5c2b74 0%, rgba(92,43,116,0) 60%), radial-gradient(90% 70% at 0% 100%, #40205c 0%, rgba(64,32,92,0) 55%), linear-gradient(180deg, #1a0d22 0%, #2a1338 55%, #150a1c 100%)' },
    dusk: { tone: 'dark', css: 'linear-gradient(180deg, #1b1235 0%, #4b2a63 34%, #b8566a 72%, #eda273 100%)' },
    ocean: { tone: 'dark', css: 'radial-gradient(100% 70% at 30% 0%, #1d4f7a 0%, rgba(29,79,122,0) 60%), linear-gradient(180deg, #0b2a44 0%, #061827 60%, #030c14 100%)' },
    snow: { tone: 'light', css: 'radial-gradient(90% 60% at 20% 0%, #cfdbe8 0%, rgba(207,219,232,0) 60%), linear-gradient(180deg, #dde6ef 0%, #eef2f6 55%, #f8f9fb 100%)' },
    sakura: { tone: 'light', css: 'radial-gradient(100% 70% at 15% 0%, #ffcfdc 0%, rgba(255,207,220,0) 60%), linear-gradient(180deg, #fbe2e9 0%, #fdf1ee 100%)' },
    milktea: { tone: 'light', css: 'radial-gradient(90% 60% at 85% 8%, #dfc3a3 0%, rgba(223,195,163,0) 60%), linear-gradient(180deg, #e6d2ba 0%, #f3e7d8 100%)' },
    ink: { tone: 'dark', css: '#0b0b0d' }
  };
  var DEFAULT_LOOK = { scene: 'space', imgAlpha: 100, blur: 0, dim: 30, fit: 'cover', stars: true, cardAlpha: 66 };
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  var look = copy(DEFAULT_LOOK), bgImage = null, bgLum = null;
  function cleanLook(x) {
    var o = copy(DEFAULT_LOOK);
    if (x && typeof x === 'object') for (var k in o) if (x[k] !== undefined && typeof x[k] === typeof o[k]) o[k] = x[k];
    if (!SCENES[o.scene]) o.scene = 'space';
    if (o.fit !== 'contain') o.fit = 'cover';
    return o;
  }
  var bgEls = { scene: document.querySelector('.bg-scene'), img: document.querySelector('.bg-img'), dim: document.querySelector('.bg-dim'), sky: document.querySelector('.sky') };
  var sky = window.QZSky ? window.QZSky.mount(bgEls.sky) : null;
  var shownImg = null;
  function applyLook() {
    var sc = SCENES[look.scene], has = !!bgImage;
    bgEls.scene.style.background = sc.css;
    if (bgImage !== shownImg) { bgEls.img.style.backgroundImage = has ? 'url("' + bgImage + '")' : 'none'; shownImg = bgImage; }
    bgEls.img.style.opacity = has ? look.imgAlpha / 100 : 0;
    bgEls.img.style.backgroundSize = look.fit === 'contain' ? 'contain' : 'cover';
    bgEls.img.style.filter = look.blur > 0 ? 'blur(' + look.blur + 'px)' : 'none';
    bgEls.img.style.transform = look.blur > 0 && look.fit !== 'contain' ? 'scale(1.06)' : 'none';
    bgEls.dim.style.opacity = has ? (look.dim / 100) * (look.imgAlpha / 100) : 0;
    if (sky) { sky.setBase(!!sc.base && !(has && look.imgAlpha >= 60)); sky.setOn(look.stars); }
    var tone = sc.tone;
    if (has && look.imgAlpha >= 50) tone = (bgLum == null ? .3 : bgLum) * (1 - look.dim / 100) > .6 ? 'light' : 'dark';
    document.documentElement.setAttribute('data-tone', tone);
    document.querySelectorAll('.card').forEach(function (c) { c.style.setProperty('--card-a', String(look.cardAlpha / 100)); });
  }

  /* ======================================================================
     Static text and the two cards
     ====================================================================== */
  var cdState = null, earthStats = null, names = null, reading = null;
  var BOOKS = { prince: ['君主论', 'The Prince'], dante: ['神曲', 'The Divine Comedy'], crime: ['罪与罚', 'Crime and Punishment'] };
  function showBooks() {
    var ul = document.getElementById('book-lines'); if (!ul) return;
    var pos = (reading && reading.pos) || {}, rows = [];
    ['a', 'b'].forEach(function (w) {
      var p = pos[w], id = p && p.last && BOOKS[p.last] ? p.last : null;
      if (!id && p) Object.keys(BOOKS).forEach(function (k) { if (p[k] && (!id || (p[k].at || 0) > (p[id].at || 0))) id = k; });
      if (!id) return;
      var nm = (names && names[w]) || (w === 'a' ? 'Logan' : '茄子萌');
      var title = /^zh/.test(lang) ? '《' + BOOKS[id][0] + '》' : BOOKS[id][1];
      rows.push(fillT(t('readingLine'), { name: nm, book: title }));
    });
    ul.textContent = '';
    if (!rows.length) { var li = document.createElement('li'); li.textContent = t('booksEmpty'); ul.appendChild(li); return; }
    rows.forEach(function (r) { var li = document.createElement('li'); li.textContent = r; ul.appendChild(li); });
  }
  function fillT(s, o) { for (var k in o) s = s.split('{' + k + '}').join(o[k]); return s; }
  function applyText() {
    document.documentElement.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-t-aria'))); });
    showCountdown(cdState);
    showEarth(earthStats);
    showBooks();
  }

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
    var tm = /^(\d{1,2}):(\d{2})/.exec(ev.time || '') || [0, 0, 0];
    var y = +a[1], m = +a[2], d = +a[3], tz = ev.tz || 'local';
    var name = String(ev.name || DEFAULT_NAMES[ev.id] || '').trim();
    var target = wallToUtc(y, m, d, +tm[1], +tm[2], tz);
    if (ev.repeat && now >= target) {
      var cy = partsIn(tz, now).y;
      target = wallToUtc(cy, m, d, +tm[1], +tm[2], tz);
      if (now >= target + 86400000) target = wallToUtc(cy + 1, m, d, +tm[1], +tm[2], tz);
      if (now >= target) return { name: name, kind: 'today', n: null };
    }
    var days = Math.floor(Math.abs(target - now) / 86400000);
    return { name: name, kind: now < target ? 'left' : 'since', n: days };
  }
  function showCountdown(s) {
    if (!s || !Array.isArray(s.events)) return;
    if (s.title) document.getElementById('cd-title').textContent = s.title;
    var now = Date.now(), ul = document.getElementById('cd-lines'), main = null;
    ul.textContent = '';
    s.events.forEach(function (ev) {
      var x = describe(ev, now); if (!x) return;
      if (ev.id === s.main) main = x;
      ul.appendChild(richLine(T[lang].line[x.kind], { name: x.name, n: x.n }));
    });
    var n = String(main && main.n != null ? main.n : '').padStart(3, '0').slice(-3);
    ['d1', 'd2', 'd3'].forEach(function (id, i) { document.getElementById(id).textContent = n[i] || '0'; });
  }
  function showEarth(st) {
    if (!st) return;
    var ul = document.getElementById('earth-lines');
    ul.textContent = '';
    ul.appendChild(richLine(t('lit'), { n: st.lit }));
    ul.appendChild(richLine(t('photos'), { n: st.photos }));
  }
  function showNames() {
    if (!names) return;
    var p = document.getElementById('names'); p.textContent = '';
    var ba = document.createElement('b'), bb = document.createElement('b');
    ba.textContent = names.a || 'Logan'; bb.textContent = names.b || '茄子萌';
    p.appendChild(ba); p.appendChild(document.createTextNode(' & ')); p.appendChild(bb);
  }
  function fromPage() {
    return fetch('countdown.html').then(function (r) { return r.text(); }).then(function (x) {
      var m = /<script type="application\/json" id="qz-data">([\s\S]*?)<\/script>/.exec(x);
      return m ? JSON.parse(m[1]) : null;
    });
  }

  /* ======================================================================
     The little eggplant from the game
     ====================================================================== */
  var EGG = ['....gG.....', '...gGGg....', '..GGGGGG...', '..GgPPgG...', '..KPPPPK...', '.KPLPPPPK..', '.KPLPPPPK..', 'KPLPPPPPPK.', 'KPPePPePPK.', 'KPrPPPPrPK.', 'KPPPPPPPpK.', 'KPPPPPPppK.', '.KPPPPppK..', '..KKKKKK...'];
  var COL = { G: '#7fcf5e', g: '#3f8f3a', P: '#8a45b8', p: '#6a2f96', L: '#b98be0', K: '#3a1650', e: '#2a0f3a', r: '#e58fb0' };
  try {
    var e = document.createElement('canvas'); e.width = 11; e.height = 14;
    var eg = e.getContext('2d');
    EGG.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (COL[row[x]]) { eg.fillStyle = COL[row[x]]; eg.fillRect(x, y, 1, 1); } });
    document.documentElement.style.setProperty('--egg', 'url(' + e.toDataURL() + ')');
  } catch (err) { /* no canvas: no egg */ }

  /* ======================================================================
     Live data
     ====================================================================== */
  var cfg = window.QZ_FIREBASE, fb = window.firebase, db = null;
  try { if (cfg && cfg.projectId && fb) { if (!fb.apps.length) fb.initializeApp(cfg); db = fb.firestore(); } } catch (err) { db = null; }
  var lastSaved = null, saveTimer = 0, imageDirty = false, msg = null;

  fromPage().then(function (s) { if (!cdState) { cdState = s; showCountdown(s); } }, function () {});
  if (db) {
    db.collection('pages').doc(cfg.pageId || 'xiaoqiezi').onSnapshot(function (snap) {
      if (!snap.exists) return;
      try { cdState = JSON.parse(snap.data().state); showCountdown(cdState); } catch (err) { /* keep the page copy */ }
    }, function () {});
    var seenPlaces = false;
    db.collection('places').onSnapshot(function (snap) {
      if (seenPlaces && typeof snap.docChanges === 'function' && snap.docChanges().every(function (ch) { return ch.doc.id === '_rooms' || ch.doc.id === '_music'; })) return;
      seenPlaces = true;
      var lit = 0, photos = 0;
      snap.forEach(function (d) {
        var x = d.data() || {};
        if (d.id === '_people') { names = x; return; }
        if (d.id === '_reading') { reading = x; return; }
        if (d.id.charAt(0) === '_') return;
        var a = !!(x.visited && x.visited.a), b = !!(x.visited && x.visited.b);
        for (var k in (x.spots || {})) { if (x.spots[k] && x.spots[k].a) a = true; if (x.spots[k] && x.spots[k].b) b = true; }
        if (a || b) lit++;
        photos += Math.max(0, x.photos || 0);
      });
      earthStats = { lit: lit, photos: photos };
      showEarth(earthStats); showNames(); showBooks();
    }, function () {});
    db.collection('pages').doc('home').onSnapshot(function (snap) {
      if (!snap.exists || (snap.metadata && snap.metadata.hasPendingWrites)) return;
      var d = snap.data() || {};
      if (d.rev && d.rev === lastSaved) return;
      try { look = cleanLook(JSON.parse(d.state)); } catch (err) { return; }
      applyLook(); syncPanel();
    }, function () {});
    db.collection('pages').doc('home_bg').onSnapshot(function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      if (imageDirty) return;
      var d = snap.exists ? (snap.data() || {}) : {};
      var img = typeof d.image === 'string' && d.image ? d.image : null;
      if (img === bgImage) return;
      bgImage = img; bgLum = typeof d.lum === 'number' ? d.lum : null;
      applyLook(); syncPanel();
    }, function () {});
  }

  /* changes save themselves a moment after you stop */
  function changed() {
    applyLook();
    if (!db) { msg = { kind: 'warn', key: 'local' }; updateMsg(); return; }
    clearTimeout(saveTimer);
    msg = { kind: '', key: 'saving' }; updateMsg();
    saveTimer = setTimeout(save, 700);
  }
  function save() {
    var rev = Date.now(); lastSaved = rev;
    var jobs = [db.collection('pages').doc('home').set({ state: JSON.stringify(look), rev: rev })];
    if (imageDirty) {
      jobs.push(db.collection('pages').doc('home_bg').set({ image: bgImage || '', lum: bgLum == null ? 0 : bgLum }).then(function () { imageDirty = false; }));
    }
    Promise.all(jobs).then(function () { msg = { kind: 'ok', key: 'saved' }; updateMsg(); }, function () { msg = { kind: 'warn', key: 'fail' }; updateMsg(); });
  }

  /* ======================================================================
     Settings panel
     ====================================================================== */
  var panel = document.getElementById('panel'), scrim = document.getElementById('scrim'), gear = document.getElementById('open-settings');
  var syncers = [], msgEl = null;
  function openPanel(on) {
    document.body.classList.toggle('open', on);
    panel.setAttribute('aria-hidden', String(!on));
    if (on) { var b = panel.querySelector('button'); if (b) b.focus(); } else gear.focus();
  }
  gear.addEventListener('click', function () { openPanel(true); });
  scrim.addEventListener('click', function () { openPanel(false); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && document.body.classList.contains('open')) openPanel(false); });

  function syncPanel() { syncers.forEach(function (f) { f(); }); }
  function updateMsg() {
    if (!msgEl) return;
    msgEl.setAttribute('data-kind', msg ? msg.kind : (db ? '' : 'warn'));
    msgEl.textContent = msg ? t(msg.key) : (db ? '' : t('local'));
  }
  function range(id, label, min, max, get, set, unit) {
    var out = h('output', { for: id });
    var input = h('input', { type: 'range', id: id, min: min, max: max, step: 1, oninput: function () { set(+input.value); out.textContent = input.value + unit; changed(); } });
    syncers.push(function () { input.value = get(); out.textContent = get() + unit; });
    return h('div', { class: 'field' }, [h('label', { for: id }, [label, out]), input]);
  }
  function takeImage(file, err) {
    if (!file) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var out = null;
        [1920, 1440, 1080].some(function (max) {
          var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
          var g = c.getContext('2d'); g.fillStyle = '#03040a'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          return [.86, .74, .62].some(function (q) { out = c.toDataURL('image/jpeg', q); return out.length < 900000; });
        });
        var s = document.createElement('canvas'); s.width = s.height = 16;
        var sg = s.getContext('2d'); sg.drawImage(img, 0, 0, 16, 16);
        var px = sg.getImageData(0, 0, 16, 16).data, sum = 0;
        for (var i = 0; i < px.length; i += 4) sum += .2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2];
        URL.revokeObjectURL(url);
        bgImage = out; bgLum = sum / (px.length / 4) / 255; imageDirty = true;
        if (look.imgAlpha < 20) look.imgAlpha = 100;
        changed(); syncPanel();
      } catch (e2) { URL.revokeObjectURL(url); err(); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); err(); };
    img.src = url;
  }
  function buildPanel() {
    var oldBody = panel.querySelector('.p-body'), scroll = oldBody ? oldBody.scrollTop : 0;
    syncers = [];
    panel.textContent = '';
    panel.setAttribute('aria-label', t('settings'));

    var langSel = h('select', { id: 'home-lang', onchange: function () {
      lang = langSel.value;
      try { localStorage.setItem(LANG_KEY, lang); } catch (e3) { /* storage off */ }
      applyText(); buildPanel();
      var again = document.getElementById('home-lang'); if (again) again.focus();
    } }, LANGS.map(function (l) { return h('option', { value: l[0] }, l[1]); }));
    langSel.value = lang;

    var sceneBtns = Object.keys(SCENES).map(function (k) {
      var sw = k === 'space' ? 'radial-gradient(circle at 30% 30%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #cad7ff 0 1px, transparent 2px), radial-gradient(circle at 50% 20%, #ffd2a1 0 1px, transparent 2px), #05060f' : SCENES[k].css;
      return h('button', { class: 'opt', type: 'button', 'data-v': k, onclick: function () { look.scene = k; changed(); syncPanel(); } }, [h('i', { style: 'background:' + sw }), t('sc_' + k)]);
    });
    syncers.push(function () { sceneBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === look.scene)); }); });

    var imgErr = h('p', { class: 'p-msg', 'data-kind': 'warn', role: 'status' });
    var file = h('input', { type: 'file', accept: 'image/*', class: 'sr', tabindex: '-1', id: 'home-file', onchange: function () {
      var f = file.files && file.files[0];
      imgErr.textContent = '';
      takeImage(f, function () { imgErr.textContent = t('imgFail'); });
      file.value = '';
    } });
    var thumb = h('span', { class: 'thumb', 'aria-hidden': 'true' });
    var upBtn = h('button', { class: 'btn', type: 'button', onclick: function () { file.click(); } });
    var rmBtn = h('button', { class: 'btn btn-ghost btn-danger', type: 'button', onclick: function () { bgImage = null; bgLum = null; imageDirty = true; changed(); syncPanel(); } }, t('remove'));
    var fitBtns = [['cover', t('fill')], ['contain', t('whole')]].map(function (o) {
      return h('button', { class: 'opt plain', type: 'button', 'data-v': o[0], onclick: function () { look.fit = o[0]; changed(); syncPanel(); } }, o[1]);
    });
    syncers.push(function () { fitBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === look.fit)); }); });
    var imgOnly = h('div', { class: 'p-sec' }, [
      range('home-img-a', t('imgAlpha'), 0, 100, function () { return 100 - look.imgAlpha; }, function (v) { look.imgAlpha = 100 - v; }, '%'),
      range('home-blur', t('blur'), 0, 24, function () { return look.blur; }, function (v) { look.blur = v; }, 'px'),
      range('home-dim', t('dim'), 0, 85, function () { return look.dim; }, function (v) { look.dim = v; }, '%'),
      h('div', { class: 'field' }, [h('span', { class: 'lab' }, t('fit')), h('div', { class: 'opts two' }, fitBtns)])
    ]);
    syncers.push(function () {
      var has = !!bgImage;
      thumb.style.backgroundImage = has ? 'url("' + bgImage + '")' : 'none';
      thumb.hidden = !has; rmBtn.hidden = !has; imgOnly.hidden = !has;
      upBtn.textContent = has ? t('change') : t('upload');
    });
    var stars = h('input', { type: 'checkbox', id: 'home-stars', onchange: function () { look.stars = stars.checked; changed(); } });
    syncers.push(function () { stars.checked = !!look.stars; });

    msgEl = h('p', { class: 'p-msg', role: 'status' });
    panel.appendChild(h('div', { class: 'p-head' }, [h('h2', null, t('settings')), h('button', { class: 'btn', type: 'button', onclick: function () { openPanel(false); } }, t('done'))]));
    panel.appendChild(h('div', { class: 'p-body' }, [
      h('section', { class: 'p-sec' }, [
        h('h3', null, [t('lang'), h('small', null, t('langNote'))]),
        h('div', { class: 'field' }, [h('label', { class: 'sr', for: 'home-lang' }, t('lang')), langSel])
      ]),
      h('section', { class: 'p-sec' }, [
        h('h3', null, [t('bg'), h('small', null, t('bgNote'))]),
        h('div', { class: 'field' }, [h('span', { class: 'lab' }, t('scene')), h('div', { class: 'opts', role: 'group', 'aria-label': t('scene') }, sceneBtns)]),
        h('div', { class: 'img-row' }, [thumb, upBtn, rmBtn, file]), imgErr, imgOnly,
        h('label', { class: 'check', for: 'home-stars' }, [stars, t('stars')]),
        range('home-card-a', t('cardAlpha'), 0, 100, function () { return 100 - look.cardAlpha; }, function (v) { look.cardAlpha = 100 - v; }, '%')
      ])
    ]));
    panel.appendChild(h('div', { class: 'p-foot' }, [msgEl, h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () {
      look = copy(DEFAULT_LOOK);
      if (bgImage) { bgImage = null; bgLum = null; imageDirty = true; }
      changed(); syncPanel();
    } }, t('reset'))]));
    syncPanel();
    updateMsg();
    panel.querySelector('.p-body').scrollTop = scroll;
  }

  /* the little globe on the earth card: lit where it is day right now, city lights where it is night */
  var globeDeco = document.querySelector('.deco.globe'), decoUrl = null, dayNight = null;
  function bakeDeco() {
    if (!dayNight || document.hidden) return;
    try {
      window.QZSun.bake(dayNight[0], dayNight[1], 1024, 512).toBlob(function (b) {
        if (!b) return;
        var u = URL.createObjectURL(b);
        globeDeco.style.backgroundImage = 'url("' + u + '")';
        if (decoUrl) URL.revokeObjectURL(decoUrl);
        decoUrl = u;
      }, 'image/jpeg', .88);
    } catch (err) { /* keep the plain daylight picture */ }
  }
  if (window.QZSun && globeDeco) {
    Promise.all([window.QZSun.load('img/earth.jpg?v=1'), window.QZSun.load('img/earth-night.jpg?v=1')]).then(function (imgs) {
      dayNight = imgs; bakeDeco();
      setInterval(bakeDeco, 120000);
      document.addEventListener('visibilitychange', bakeDeco);
    }, function () {});
  }

  applyLook();
  applyText();
  buildPanel();
})();
