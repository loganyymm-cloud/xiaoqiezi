/* Shared trip helpers for trips.html, trip.html and the home card.
   Every trip lives in Firestore as places/_trip_<id>; the first one, Toronto, keeps its old doc places/_trip
   and its day-by-day plan is built into trip.js. Dates are read on the Toronto calendar. */
(function () {
  'use strict';
  var TZ = 'America/Toronto';
  var WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function parts(ms) {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' })
        .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
      return { y: o.year, m: o.month, d: o.day, h: o.hour % 24 };
    } catch (e) { var d = new Date(ms); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours() }; }
  }
  function ymd(s) { var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s || ''); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; }
  function dayNo(o) { return Math.round(Date.UTC(o.y, o.m - 1, o.d) / 86400000); }
  function fromNo(n) { var d = new Date(n * 86400000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() }; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(o) { return o.y + '-' + pad(o.m) + '-' + pad(o.d); }
  /* the moment it is h:mi on that date in Toronto */
  function torontoAt(o, h, mi) {
    var g = Date.UTC(o.y, o.m - 1, o.d, h + 5, mi || 0), p = parts(g), diff = p.h - h;
    if (diff === 1 || diff === -23) g -= 3600000;
    return g;
  }

  var MAX_DAYS = 90;
  var TORONTO = {
    id: 'toronto', title: '多伦多 10 日游', place: '多伦多', start: '2026-12-19', end: '2026-12-29',
    arrive: Date.UTC(2026, 11, 19, 20, 56), leave: Date.UTC(2026, 11, 29, 17, 55), builtin: true, builtinStops: 27
  };

  function cleanId(s) { return String(s || '').replace(/[^a-z0-9]/gi, '').slice(0, 40); }
  function docId(id) { return !id || id === 'toronto' ? '_trip' : '_trip_' + id; }
  function idOf(doc) { return doc === '_trip' ? 'toronto' : doc.indexOf('_trip_') === 0 ? doc.slice(6) : null; }

  function days(meta) {
    var a = ymd(meta && meta.start), b = ymd(meta && meta.end); if (!a) return [];
    var n0 = dayNo(a), n1 = b ? dayNo(b) : n0;
    if (n1 < n0) n1 = n0; if (n1 - n0 >= MAX_DAYS) n1 = n0 + MAX_DAYS - 1;
    var out = [];
    for (var n = n0; n <= n1; n++) { var o = fromNo(n); out.push({ y: o.y, m: o.m, d: o.d, md: o.m + '.' + o.d, wd: WD[o.wd], iso: iso(o) }); }
    return out;
  }
  function bounds(meta) {
    var a = ymd(meta.start), b = ymd(meta.end) || a;
    return {
      arrive: meta.arrive || (a ? torontoAt(a, 0, 0) : 0),
      leave: meta.leave || (b ? torontoAt(fromNo(dayNo(b) + 1), 0, 0) : 0)
    };
  }
  /* before: counting down; during: which day; after: how long ago */
  function status(meta, now) {
    now = now || Date.now();
    var ds = days(meta), total = ds.length, b = bounds(meta), a = ymd(meta.start);
    var idx = a ? dayNo(parts(now)) - dayNo(a) : -1;
    if (now < b.arrive) return { state: 'before', ms: b.arrive - now, days: Math.floor((b.arrive - now) / 86400000), total: total };
    if (now < b.leave || (idx >= 0 && idx < total)) return { state: 'during', day: Math.max(0, Math.min(total - 1, idx)), total: total };
    return { state: 'after', days: Math.floor((now - b.leave) / 86400000), total: total };
  }
  function range(meta) {
    var a = ymd(meta.start), b = ymd(meta.end) || a; if (!a) return '';
    var s = a.y + '.' + pad(a.m) + '.' + pad(a.d);
    if (dayNo(b) === dayNo(a)) return s;
    return s + ' – ' + (b.y !== a.y ? b.y + '.' : '') + pad(b.m) + '.' + pad(b.d);
  }
  function winter(meta) {
    return days(meta).some(function (d) { return d.m === 12 || d.m <= 2; });
  }
  /* current trips first, then upcoming (soonest first), then past (latest first) */
  function sortTrips(list, now) {
    var rank = { during: 0, before: 1, after: 2 };
    return list.map(function (t) { return { t: t, s: status(t.meta, now) }; }).sort(function (x, y) {
      if (rank[x.s.state] !== rank[y.s.state]) return rank[x.s.state] - rank[y.s.state];
      var dx = dayNo(ymd(x.t.meta.start) || { y: 1970, m: 1, d: 1 }), dy = dayNo(ymd(y.t.meta.start) || { y: 1970, m: 1, d: 1 });
      return x.s.state === 'after' ? dy - dx : dx - dy;
    });
  }
  /* how many stops a trip has, and how many have been checked off */
  function stopCount(t) {
    var plan = (t.data && t.data.plan) || {}, n = t.meta.builtin ? (t.meta.builtinStops || 0) : 0;
    for (var k in plan) if (plan[k] && plan[k].name) n++;
    return n;
  }
  function checkedStops(t) {
    var st = (t.data && t.data.stop) || {}, n = 0;
    for (var k in st) if (st[k]) n++;
    return n;
  }
  function today() { return iso(parts(Date.now())); }
  function validate(m) {
    if (!m.title) return '给这次旅行起个名字';
    var a = ymd(m.start), b = ymd(m.end);
    if (!a) return '选一下出发那天';
    if (!b) return '选一下回来那天';
    if (dayNo(b) < dayNo(a)) return '回来那天要在出发之后';
    if (dayNo(b) - dayNo(a) >= MAX_DAYS) return '一次最多排 ' + MAX_DAYS + ' 天';
    return null;
  }

  window.QZTrip = {
    TZ: TZ, WD: WD, TORONTO: TORONTO, MAX_DAYS: MAX_DAYS,
    parts: parts, ymd: ymd, dayNo: dayNo, fromNo: fromNo, iso: iso, today: today,
    cleanId: cleanId, docId: docId, idOf: idOf, days: days, bounds: bounds, status: status, range: range,
    winter: winter, sortTrips: sortTrips, stopCount: stopCount, checkedStops: checkedStops, validate: validate
  };
})();
