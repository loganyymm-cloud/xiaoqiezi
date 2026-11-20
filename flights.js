/* Flights and passport stamps, shared by trip.html and trips.html.
   A flight is stored in its trip's doc as flight.<fid> = {no, date, from, to, who, km, auto, toCity, toCityEn, toCountry, by, at};
   landing somewhere unlocks that city's stamp. Airport list: data/airports.json, from OurAirports (public domain),
   as [iata, city, country, lat, lon, name, big]. */
(function () {
  'use strict';

  /* ---------- names in Chinese for the places we're most likely to fly ---------- */
  var CITY_ZH = {
    YYZ: '多伦多', YTZ: '多伦多', YUL: '蒙特利尔', YVR: '温哥华', YOW: '渥太华', YYC: '卡尔加里', YEG: '埃德蒙顿', YWG: '温尼伯',
    YHZ: '哈利法克斯', YQB: '魁北克城', YYJ: '维多利亚', YLW: '基洛纳', YXU: '伦敦（安省）', YHM: '哈密尔顿', YKF: '滑铁卢', YQT: '桑德贝', YXE: '萨斯卡通', YQR: '里贾纳', YYT: '圣约翰斯',
    EWR: '纽瓦克', JFK: '纽约', LGA: '纽约', BOS: '波士顿', PHL: '费城', IAD: '华盛顿', DCA: '华盛顿', BWI: '巴尔的摩', ORD: '芝加哥', MDW: '芝加哥',
    DTW: '底特律', BUF: '布法罗', CLE: '克利夫兰', PIT: '匹兹堡', ATL: '亚特兰大', MIA: '迈阿密', FLL: '劳德代尔堡', MCO: '奥兰多', TPA: '坦帕',
    DFW: '达拉斯', IAH: '休斯敦', AUS: '奥斯汀', DEN: '丹佛', PHX: '凤凰城', LAS: '拉斯维加斯', LAX: '洛杉矶', SFO: '旧金山', SJC: '圣何塞', SAN: '圣迭戈',
    SEA: '西雅图', PDX: '波特兰', SLC: '盐湖城', MSP: '明尼阿波利斯', HNL: '檀香山', OGG: '茂宜岛', ANC: '安克雷奇', BNA: '纳什维尔', MSY: '新奥尔良', CLT: '夏洛特',
    PEK: '北京', PKX: '北京', PVG: '上海', SHA: '上海', CAN: '广州', SZX: '深圳', CTU: '成都', TFU: '成都', CKG: '重庆', HGH: '杭州', NKG: '南京',
    XIY: '西安', WUH: '武汉', CSX: '长沙', KMG: '昆明', XMN: '厦门', TAO: '青岛', DLC: '大连', SHE: '沈阳', HRB: '哈尔滨', TSN: '天津', CGO: '郑州',
    FOC: '福州', NNG: '南宁', HAK: '海口', SYX: '三亚', URC: '乌鲁木齐', LHW: '兰州', TYN: '太原', HFE: '合肥', KWE: '贵阳', CGQ: '长春', SJW: '石家庄',
    TNA: '济南', NGB: '宁波', WNZ: '温州', KHN: '南昌', LXA: '拉萨', XNN: '西宁', INC: '银川', HET: '呼和浩特', DYG: '张家界', KWL: '桂林', LJG: '丽江', JHG: '西双版纳', ZUH: '珠海', SWA: '揭阳·汕头', YNT: '烟台', WUX: '无锡', CZX: '常州',
    HKG: '香港', MFM: '澳门', TPE: '台北', TSA: '台北', KHH: '高雄', RMQ: '台中',
    NRT: '东京', HND: '东京', KIX: '大阪', ITM: '大阪', UKB: '神户', NGO: '名古屋', CTS: '札幌', FUK: '福冈', OKA: '冲绳', HIJ: '广岛', SDJ: '仙台', KOJ: '鹿儿岛',
    ICN: '首尔', GMP: '首尔', PUS: '釜山', CJU: '济州',
    BKK: '曼谷', DMK: '曼谷', HKT: '普吉', CNX: '清迈', USM: '苏梅岛', SIN: '新加坡', KUL: '吉隆坡', BKI: '亚庇', PEN: '槟城', CGK: '雅加达', DPS: '巴厘岛',
    MNL: '马尼拉', CEB: '宿务', SGN: '胡志明市', HAN: '河内', DAD: '岘港', PNH: '金边', REP: '暹粒', RGN: '仰光', DEL: '新德里', BOM: '孟买', CMB: '科伦坡', MLE: '马累',
    DXB: '迪拜', AUH: '阿布扎比', DOH: '多哈', IST: '伊斯坦布尔', SAW: '伊斯坦布尔', TLV: '特拉维夫', CAI: '开罗', CMN: '卡萨布兰卡', RAK: '马拉喀什',
    CDG: '巴黎', ORY: '巴黎', NCE: '尼斯', LYS: '里昂', MRS: '马赛', TLS: '图卢兹', BOD: '波尔多',
    LHR: '伦敦', LGW: '伦敦', STN: '伦敦', LTN: '伦敦', LCY: '伦敦', MAN: '曼彻斯特', EDI: '爱丁堡', GLA: '格拉斯哥', DUB: '都柏林',
    AMS: '阿姆斯特丹', BRU: '布鲁塞尔', FRA: '法兰克福', MUC: '慕尼黑', BER: '柏林', HAM: '汉堡', DUS: '杜塞尔多夫', CGN: '科隆', ZRH: '苏黎世', GVA: '日内瓦',
    VIE: '维也纳', PRG: '布拉格', BUD: '布达佩斯', WAW: '华沙', KRK: '克拉科夫', CPH: '哥本哈根', ARN: '斯德哥尔摩', OSL: '奥斯陆', HEL: '赫尔辛基', KEF: '雷克雅未克',
    FCO: '罗马', CIA: '罗马', MXP: '米兰', LIN: '米兰', BGY: '米兰', VCE: '威尼斯', FLR: '佛罗伦萨', PSA: '比萨', NAP: '那不勒斯', BLQ: '博洛尼亚', CTA: '卡塔尼亚', PMO: '巴勒莫',
    MAD: '马德里', BCN: '巴塞罗那', AGP: '马拉加', SVQ: '塞维利亚', VLC: '瓦伦西亚', PMI: '马略卡', IBZ: '伊维萨', GRX: '格拉纳达', BIO: '毕尔巴鄂', TFS: '特内里费', LPA: '大加那利',
    LIS: '里斯本', OPO: '波尔图', FAO: '法鲁', ATH: '雅典', JTR: '圣托里尼', JMK: '米科诺斯', HER: '伊拉克利翁', CHQ: '干尼亚', RHO: '罗德岛', CFU: '科孚', SKG: '塞萨洛尼基',
    SPU: '斯普利特', DBV: '杜布罗夫尼克', ZAG: '萨格勒布', SYD: '悉尼', MEL: '墨尔本', BNE: '布里斯班', PER: '珀斯', AKL: '奥克兰', ZQN: '皇后镇',
    CUN: '坎昆', MEX: '墨西哥城', SJD: '洛斯卡沃斯', PVR: '巴亚尔塔港', HAV: '哈瓦那', PUJ: '蓬塔卡纳', MBJ: '蒙特哥贝', NAS: '拿骚', GRU: '圣保罗', GIG: '里约热内卢', EZE: '布宜诺斯艾利斯', LIM: '利马', BOG: '波哥大', SCL: '圣地亚哥'
  };
  var COUNTRY_ZH = {
    CA: '加拿大', US: '美国', CN: '中国', HK: '中国香港', MO: '中国澳门', TW: '中国台湾', JP: '日本', KR: '韩国', TH: '泰国', SG: '新加坡', MY: '马来西亚', ID: '印度尼西亚',
    PH: '菲律宾', VN: '越南', KH: '柬埔寨', MM: '缅甸', IN: '印度', LK: '斯里兰卡', MV: '马尔代夫', AE: '阿联酋', QA: '卡塔尔', TR: '土耳其', IL: '以色列', EG: '埃及', MA: '摩洛哥',
    FR: '法国', GB: '英国', IE: '爱尔兰', NL: '荷兰', BE: '比利时', DE: '德国', CH: '瑞士', AT: '奥地利', CZ: '捷克', HU: '匈牙利', PL: '波兰', DK: '丹麦', SE: '瑞典',
    NO: '挪威', FI: '芬兰', IS: '冰岛', IT: '意大利', ES: '西班牙', PT: '葡萄牙', GR: '希腊', HR: '克罗地亚', AU: '澳大利亚', NZ: '新西兰', MX: '墨西哥', CU: '古巴',
    DO: '多米尼加', JM: '牙买加', BS: '巴哈马', BR: '巴西', AR: '阿根廷', PE: '秘鲁', CO: '哥伦比亚', CL: '智利'
  };
  var AIRLINES = {
    AC: '加拿大航空', WS: '西捷航空', PD: '波特航空', F8: 'Flair 航空', TS: '越洋航空', WG: '阳翼航空',
    UA: '美联航', AA: '美国航空', DL: '达美航空', B6: '捷蓝航空', WN: '西南航空', AS: '阿拉斯加航空', NK: '精神航空', F9: '边疆航空', HA: '夏威夷航空',
    CA: '中国国际航空', MU: '东方航空', CZ: '南方航空', HU: '海南航空', MF: '厦门航空', '3U': '四川航空', ZH: '深圳航空', FM: '上海航空', HO: '吉祥航空', '9C': '春秋航空', SC: '山东航空', KN: '中国联合航空',
    CX: '国泰航空', HX: '香港航空', UO: '香港快运', NX: '澳门航空', BR: '长荣航空', CI: '中华航空', JX: '星宇航空',
    JL: '日本航空', NH: '全日空', MM: '乐桃航空', KE: '大韩航空', OZ: '韩亚航空', '7C': '济州航空', SQ: '新加坡航空', TR: '酷航', TG: '泰国航空', MH: '马来西亚航空', AK: '亚洲航空', VN: '越南航空', PR: '菲律宾航空', GA: '印尼鹰航',
    EK: '阿联酋航空', QR: '卡塔尔航空', EY: '阿提哈德航空', TK: '土耳其航空', AF: '法国航空', KL: '荷兰皇家航空', LH: '汉莎航空', BA: '英国航空', VS: '维珍航空', EI: '爱尔兰航空',
    IB: '伊比利亚航空', VY: '伏林航空', UX: '欧罗巴航空', FR: '瑞安航空', U2: '易捷航空', W6: '维兹航空', A3: '爱琴海航空', AZ: 'ITA 航空', LX: '瑞士航空', OS: '奥地利航空', SN: '布鲁塞尔航空',
    SK: '北欧航空', AY: '芬兰航空', TP: '葡萄牙航空', FI: '冰岛航空', LO: '波兰航空', QF: '澳洲航空', NZ: '新西兰航空', AM: '墨西哥航空', LA: '南美航空', CM: '巴拿马航空'
  };

  /* ---------- the little picture on each stamp ---------- */
  var MOTIF_BY_CODE = {
    YYZ: 'tower', YTZ: 'tower', CDG: 'eiffel', ORY: 'eiffel', NRT: 'fuji', HND: 'fuji', KIX: 'torii', ITM: 'torii', UKB: 'torii',
    JFK: 'skyline', LGA: 'skyline', EWR: 'skyline', PEK: 'roof', PKX: 'roof', PVG: 'skyline', SHA: 'skyline', HKG: 'skyline',
    JTR: 'wave', JMK: 'wave', CFU: 'wave', RHO: 'wave', HER: 'wave', CHQ: 'wave', PMI: 'wave', IBZ: 'wave', NCE: 'wave', HNL: 'wave', SYX: 'wave', DPS: 'wave', HKT: 'wave', CUN: 'wave', YVR: 'wave',
    ATH: 'columns', FCO: 'columns', CIA: 'columns', BCN: 'sun', MAD: 'sun', SVQ: 'sun', AGP: 'sun', LIS: 'sun'
  };
  var MOTIF_BY_COUNTRY = { CA: 'maple', US: 'star', CN: 'roof', JP: 'torii', GR: 'columns', IT: 'columns', ES: 'sun', PT: 'sun', MX: 'sun' };
  var MOTIF = {
    plane: '<path d="M4 21 L16 19 L24 6 L28 6 L23 19 L34 18 L37 14 L39 14 L37 21 L39 28 L37 28 L34 24 L23 23 L28 36 L24 36 L16 23 Z"/>',
    tower: '<path d="M20 2 L20 38 M16 38 L20 20 L24 38 M13 38 L27 38"/><ellipse cx="20" cy="15" rx="5.5" ry="2.6"/><ellipse cx="20" cy="9" rx="2" ry="1.2"/>',
    eiffel: '<path d="M20 2 L20 6 M18.5 6 L21.5 6 M18.6 6 Q15 26 9 38 M21.4 6 Q25 26 31 38 M14 22 L26 22 M12 30 L28 30 M15 38 Q20 31 25 38"/>',
    fuji: '<path d="M2 34 L14 12 Q20 9 26 12 L38 34 Z M14 12 L17 17 L20 14 L23 17 L26 12"/>',
    torii: '<path d="M4 9 Q20 5 36 9 M8 14 L32 14 M12 9 L12 37 M28 9 L28 37 M20 9 L20 14"/>',
    columns: '<path d="M6 12 L20 4 L34 12 Z M6 15 L34 15 M10 17 L10 32 M16 17 L16 32 M24 17 L24 32 M30 17 L30 32 M7 33 L33 33 M5 36 L35 36"/>',
    skyline: '<path d="M3 37 L3 23 L8 23 L8 17 L12 17 L12 25 L16 25 L16 9 L19 9 L19 4 L21 4 L21 9 L24 9 L24 21 L29 21 L29 15 L34 15 L34 37 Z"/>',
    roof: '<path d="M10 11 Q20 3 30 11 M4 18 Q20 7 36 18 M9 17 L9 34 M31 17 L31 34 M17 34 L17 26 L23 26 L23 34 M5 34 L35 34"/>',
    maple: '<path d="M20 3 L23 11 L28 8 L27 16 L35 14 L31 21 L34 23 L24 27 L25 31 L21 30 L21 37 L19 37 L19 30 L15 31 L16 27 L6 23 L9 21 L5 14 L13 16 L12 8 L17 11 Z"/>',
    star: '<path d="M20 4 L24.2 15.6 L36.5 16 L26.8 23.6 L30.2 35.5 L20 28.6 L9.8 35.5 L13.2 23.6 L3.5 16 L15.8 15.6 Z"/>',
    wave: '<circle cx="29" cy="10" r="4.5"/><path d="M2 26 Q8 19 14 24 T26 24 T38 22 M2 33 Q8 27 14 31 T26 31 T38 29"/>',
    sun: '<circle cx="20" cy="20" r="7"/><path d="M20 4 L20 9 M20 31 L20 36 M4 20 L9 20 M31 20 L36 20 M8.7 8.7 L12.2 12.2 M27.8 27.8 L31.3 31.3 M8.7 31.3 L12.2 27.8 M27.8 12.2 L31.3 8.7"/>'
  };
  var INKS = ['#c8463c', '#2f5fa8', '#6a3fa0', '#2e7d5b', '#b05a1c', '#20304f', '#a8326e'];

  /* ---------- the airport list ---------- */
  var AP = null, byCode = {}, loading = null;
  function load() {
    if (AP) return Promise.resolve(AP);
    if (loading) return loading;
    loading = fetch('data/airports.json?v=1').then(function (r) { return r.json(); }).then(function (rows) {
      AP = rows.map(function (r) { return { code: r[0], en: r[1], cc: r[2], lat: r[3], lon: r[4], name: r[5], big: !!r[6], zh: CITY_ZH[r[0]] || '' }; });
      AP.forEach(function (a) { byCode[a.code] = a; });
      return AP;
    });
    return loading;
  }
  function find(code) { return byCode[String(code || '').trim().toUpperCase()] || null; }
  function search(q, n) {
    if (!AP) return [];
    q = String(q || '').trim(); if (!q) return [];
    var up = q.toUpperCase(), low = q.toLowerCase(), out = [];
    AP.forEach(function (a) {
      var s = 0;
      if (a.code === up) s = 100;
      else if (a.zh && a.zh.indexOf(q) === 0) s = 80;
      else if (a.code.indexOf(up) === 0) s = 60;
      else if (a.en.toLowerCase().indexOf(low) === 0) s = 50;
      else if (a.zh && a.zh.indexOf(q) > 0) s = 40;
      else if (low.length >= 3 && (a.en.toLowerCase().indexOf(low) > 0 || a.name.toLowerCase().indexOf(low) >= 0)) s = 20;
      if (s) out.push({ a: a, s: s + (a.big ? 10 : 0) + (a.zh ? 5 : 0) });
    });
    return out.sort(function (x, y) { return y.s - x.s; }).slice(0, n || 6).map(function (x) { return x.a; });
  }
  function cityOf(a) { return a ? (a.zh || a.en) : ''; }
  function label(a) { return a ? a.code + ' · ' + cityOf(a) + (a.zh ? '' : ', ' + (COUNTRY_ZH[a.cc] || a.cc)) : ''; }
  function km(a, b) {
    if (!a || !b) return null;
    var R = 6371.0088, r = Math.PI / 180;
    var dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
  }
  function miles(k) { return Math.round(k * 0.621371); }
  function cleanNo(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }
  function airline(no) { var n = cleanNo(no); return AIRLINES[n.slice(0, 2)] || ''; }
  function prettyNo(no) { var n = cleanNo(no), m = /^([A-Z0-9]{2})(\d+[A-Z]?)$/.exec(n); return m ? m[1] + ' ' + m[2] : n; }
  function countryZh(cc) { return COUNTRY_ZH[cc] || cc || ''; }
  function fmtKm(k) { return k == null ? '—' : String(k).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* every flight of every trip → stamps (one per city, the first landing) and totals */
  function collect(trips) {
    var flights = [], stamps = {}, tot = { all: 0, a: 0, b: 0, n: 0 };
    trips.forEach(function (t) {
      var fl = (t.data && t.data.flight) || {};
      Object.keys(fl).forEach(function (k) {
        var f = fl[k]; if (!f || !f.to) return;
        flights.push({ id: k, f: f, trip: t });
        var d = +f.km || 0; tot.n++; tot.all += d;
        if (f.who === 'a' || f.who === 'both') tot.a += d;
        if (f.who === 'b' || f.who === 'both') tot.b += d;
        var key = (f.toCountry || '') + ':' + (f.toCity || f.to);
        var s = stamps[key];
        if (!s || (f.date || '') < (s.date || '')) stamps[key] = { key: key, city: f.toCity || f.to, cityEn: f.toCityEn || '', cc: f.toCountry || '', code: f.to, date: f.date || '', who: {}, trip: t };
      });
    });
    flights.forEach(function (x) {
      var key = (x.f.toCountry || '') + ':' + (x.f.toCity || x.f.to), s = stamps[key];
      if (x.f.who === 'a' || x.f.who === 'both') s.who.a = true;
      if (x.f.who === 'b' || x.f.who === 'both') s.who.b = true;
    });
    var list = Object.keys(stamps).map(function (k) { return stamps[k]; }).sort(function (x, y) { return (x.date || '').localeCompare(y.date || ''); });
    return { flights: flights, stamps: list, total: tot };
  }

  /* ---------- drawing a stamp ---------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function motifFor(code, cc) { return MOTIF_BY_CODE[code] || MOTIF_BY_COUNTRY[cc] || 'plane'; }
  var uidN = 0;
  function stampSVG(s) {
    var h = hash(s.key || s.code || 'x'), ink = INKS[h % INKS.length], shape = (h >> 3) % 4, rot = ((h >> 6) % 25) - 12;
    var id = 'st' + (++uidN), city = esc(s.city), en = esc((s.cityEn || s.city).toUpperCase());
    var date = esc((s.date || '').replace(/-/g, '·')), code = esc(s.code || ''), m = MOTIF[motifFor(s.code, s.cc)] || MOTIF.plane;
    var big = city.length > 4 ? 19 : city.length > 3 ? 22 : 26;
    var o = '<svg class="stamp-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + city + ' 印章">';
    o += '<defs><filter id="' + id + 'f"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="' + (h % 97) + '"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.3"/><feComposite in="SourceGraphic" operator="in"/></filter>';
    o += '<path id="' + id + 'a" d="M28 80 A52 52 0 0 1 132 80"/><path id="' + id + 'b" d="M24 80 A56 56 0 0 0 136 80"/></defs>';
    o += '<g transform="rotate(' + rot + ' 80 80)" fill="none" stroke="' + ink + '" color="' + ink + '" filter="url(#' + id + 'f)">';
    if (shape === 0) {
      o += '<circle cx="80" cy="80" r="74" stroke-width="3.5"/><circle cx="80" cy="80" r="66" stroke-width="1.4"/><circle cx="80" cy="80" r="44" stroke-width="1.2" stroke-dasharray="2 3"/>';
      o += '<text font-size="11" font-weight="700" letter-spacing="2" fill="' + ink + '" stroke="none" font-family="Arial, sans-serif"><textPath href="#' + id + 'a" startOffset="50%" text-anchor="middle">' + en + '</textPath></text>';
      o += '<text font-size="10" font-weight="700" letter-spacing="2" fill="' + ink + '" stroke="none" font-family="Arial, sans-serif"><textPath href="#' + id + 'b" startOffset="50%" text-anchor="middle">' + date + ' · ' + code + '</textPath></text>';
      o += '<g transform="translate(66 48) scale(.7)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' + m + '</g>';
      o += '<text x="80" y="' + (97 - (26 - big) / 3) + '" text-anchor="middle" font-size="' + big + '" font-weight="700" fill="' + ink + '" stroke="none" font-family="Noto Serif SC, Songti SC, serif">' + city + '</text>';
      o += '<text x="80" y="119" text-anchor="middle" font-size="8" letter-spacing="3" fill="' + ink + '" stroke="none" font-family="Arial, sans-serif">ARRIVED</text>';
    } else {
      if (shape === 1) o += '<rect x="10" y="22" width="140" height="116" rx="14" stroke-width="3.5"/><rect x="17" y="29" width="126" height="102" rx="9" stroke-width="1.2"/>';
      else if (shape === 2) o += '<ellipse cx="80" cy="80" rx="76" ry="66" stroke-width="3.5"/><ellipse cx="80" cy="80" rx="68" ry="58" stroke-width="1.2"/>';
      else o += '<path d="M52 12 L108 12 L148 52 L148 108 L108 148 L52 148 L12 108 L12 52 Z" stroke-width="3.5"/><path d="M55 20 L105 20 L140 55 L140 105 L105 140 L55 140 L20 105 L20 55 Z" stroke-width="1.2"/>';
      var fit = en.length > 10 ? ' textLength="' + (shape === 2 ? 86 : 104) + '" lengthAdjust="spacingAndGlyphs"' : '';
      o += '<text x="80" y="42" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="2" fill="' + ink + '" stroke="none" font-family="Arial, sans-serif"' + fit + '>' + en + '</text>';
      o += '<g transform="translate(69 46) scale(.55)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">' + m + '</g>';
      o += '<text x="80" y="' + (92 - (26 - big) / 3) + '" text-anchor="middle" font-size="' + big + '" font-weight="700" fill="' + ink + '" stroke="none" font-family="Noto Serif SC, Songti SC, serif">' + city + '</text>';
      o += '<path d="M36 99 L124 99" stroke-width="1.2"/>';
      o += '<text x="80" y="112" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1.5" fill="' + ink + '" stroke="none" font-family="Arial, sans-serif">' + date + '</text>';
      o += '<text x="80" y="124" text-anchor="middle" font-size="8.5" letter-spacing="2" fill="' + ink + '" stroke="none" font-family="Arial, PingFang SC, sans-serif">' + code + ' · 入境</text>';
    }
    o += '</g></svg>';
    return o;
  }

  /* ---------- the "you unlocked a stamp" moment ---------- */
  function celebrate(s) {
    var w = document.createElement('div'); w.className = 'unlock'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', '解锁了新印章');
    var card = document.createElement('div'); card.className = 'unlock-card';
    var st = document.createElement('div'); st.className = 'stamp big slam'; st.innerHTML = stampSVG(s);
    var p = document.createElement('p'); p.textContent = '解锁了「' + s.city + '」的印章！';
    var sm = document.createElement('small'); sm.textContent = '点一下收进印章本';
    card.append(st, p, sm); w.appendChild(card);
    function close() { w.classList.add('out'); setTimeout(function () { w.remove(); }, 250); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    w.onclick = close; document.addEventListener('keydown', key);
    document.body.appendChild(w);
  }

  /* ---------- an airport input with suggestions ---------- */
  function airportBox(input, onPick) {
    var wrap = document.createElement('div'); wrap.className = 'apbox';
    input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
    var ul = document.createElement('ul'); ul.className = 'apsug'; ul.hidden = true; ul.setAttribute('role', 'listbox');
    var hint = document.createElement('small'); hint.className = 'aphint';
    wrap.append(ul, hint);
    input.setAttribute('autocomplete', 'off'); input.setAttribute('aria-autocomplete', 'list');
    var picked = null, items = [], cur = -1;
    function show() {
      ul.textContent = ''; cur = -1;
      items = search(input.value, 6);
      if (!items.length || (picked && input.value === label(picked))) { ul.hidden = true; return; }
      items.forEach(function (a, i) {
        var li = document.createElement('li'); li.setAttribute('role', 'option');
        var b = document.createElement('b'); b.textContent = a.code;
        var sp = document.createElement('span'); sp.textContent = cityOf(a) + ' · ' + countryZh(a.cc);
        var nm = document.createElement('small'); nm.textContent = a.name;
        li.append(b, sp, nm);
        li.onmousedown = function (e) { e.preventDefault(); pick(a); };
        ul.appendChild(li);
      });
      ul.hidden = false;
    }
    function pick(a) { picked = a; input.value = label(a); ul.hidden = true; hint.textContent = a.name; if (onPick) onPick(a); }
    input.addEventListener('input', function () { picked = null; hint.textContent = ''; load().then(show); if (onPick) onPick(null); });
    input.addEventListener('focus', function () { load(); });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        ul.hidden = true;
        if (!picked && input.value.trim()) { var exact = find(input.value.trim().slice(0, 3)); if (exact && /^[a-z]{3}$/i.test(input.value.trim())) pick(exact); }
      }, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (ul.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; Array.prototype.forEach.call(ul.children, function (li, i) { li.classList.toggle('on', i === cur); }); }
      else if (e.key === 'Enter' && cur >= 0) { e.preventDefault(); pick(items[cur]); }
      else if (e.key === 'Escape') ul.hidden = true;
    });
    return {
      get: function () {
        if (picked) return picked;
        var v = input.value.trim(), m = /^([A-Za-z]{3})\b/.exec(v);
        return m ? find(m[1]) : null;
      },
      set: function (a) { if (a) pick(a); else { picked = null; input.value = ''; hint.textContent = ''; } }
    };
  }

  window.QZFly = {
    load: load, find: find, search: search, cityOf: cityOf, label: label, km: km, miles: miles, cleanNo: cleanNo, prettyNo: prettyNo,
    airline: airline, countryZh: countryZh, fmtKm: fmtKm, collect: collect, stampSVG: stampSVG, celebrate: celebrate, airportBox: airportBox, motifFor: motifFor
  };
})();
