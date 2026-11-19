/* 两个小屋：Logan 在多伦多，Zimo 在新泽西。窗户连着对方的小屋，CD 机放两个人的歌。 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (id) => document.getElementById(id);
const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const Sun = window.QZSun;

/* ---------------------------------------------------------------- who lives where */
const HOMES = {
  a: { city: '多伦多', en: 'Toronto', lat: 43.65, lng: -79.38, tz: 'America/Toronto', earth: 'earth.html#w-CAN' },
  b: { city: '新泽西', en: 'New Jersey', lat: 40.35, lng: -74.45, tz: 'America/New_York', earth: 'earth.html#w-USA' }
};
let NAMES = { a: 'Logan', b: '茄子萌' };
const other = (w) => (w === 'a' ? 'b' : 'a');
let me = null;
try { me = localStorage.getItem('qzm-me'); } catch (e) { /* storage off */ }
if (me !== 'a' && me !== 'b') me = null;
const fromHash = () => (location.hash === '#b' ? 'b' : location.hash === '#a' ? 'a' : null);
let roomOf = fromHash() || me || 'a';

/* ---------------------------------------------------------------- small helpers */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function mixHex(a, b, k) {
  const pa = [a >> 16 & 255, a >> 8 & 255, a & 255], pb = [b >> 16 & 255, b >> 8 & 255, b & 255];
  return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',') + ')';
}
function seeded(n) { let s = n >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function clockIn(w) {
  try { return new Intl.DateTimeFormat('zh-CN', { timeZone: HOMES[w].tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); }
  catch (e) { return ''; }
}

/* ---------------------------------------------------------------- weather (Open-Meteo, no key) */
const weather = { a: null, b: null };
function wkind(code) {
  if (code == null) return 'clear';
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'overcast';
  if (code === 1 || code === 2) return 'cloudy';
  return 'clear';
}
const WWORD = { clear: '晴', cloudy: '少云', overcast: '阴天', fog: '有雾', rain: '在下雨', snow: '在下雪', storm: '打雷下雨' };
function weatherWord(w) {
  const x = weather[w];
  if (!x) return '';
  const k = wkind(x.code), s = Sun ? Sun.height(HOMES[w].lat, HOMES[w].lng) : 1;
  const word = k === 'clear' && s < -.05 ? '晴朗的夜' : WWORD[k];
  return word + ' ' + x.t + '°';
}
function loadWeather(w) {
  const h = HOMES[w];
  return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + h.lat + '&longitude=' + h.lng + '&current=temperature_2m,weather_code&timezone=auto')
    .then((r) => r.json())
    .then((j) => { if (j && j.current) weather[w] = { t: Math.round(j.current.temperature_2m), code: j.current.weather_code }; })
    .catch(() => {});
}

/* ---------------------------------------------------------------- renderer, camera, light */
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const W = 4.2, D = 3.6, H = 2.55;
const CENTER = new THREE.Vector3(W / 2, .85, D / 2);
const OFFSET = new THREE.Vector3(-10, 8.4, 10);
const scene = new THREE.Scene();
/* soft reflections from a neutral room, so materials look like real things */
try {
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .32;
  pm.dispose();
} catch (e) { /* plain lighting is fine too */ }
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
camera.position.copy(CENTER).add(OFFSET);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(CENTER);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.screenSpacePanning = true;
controls.minZoom = .75; controls.maxZoom = 3.4;
controls.rotateSpeed = .45;
const AZ0 = Math.atan2(OFFSET.x, OFFSET.z), POL0 = Math.acos(OFFSET.y / OFFSET.length());
controls.minAzimuthAngle = AZ0 - .5; controls.maxAzimuthAngle = AZ0 + .5;
controls.minPolarAngle = POL0 - .22; controls.maxPolarAngle = POL0 + .14;
controls.update();

function resize() {
  const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight, a = w / h;
  const half = Math.max(3.15, 2.95 / a);
  camera.left = -half * a; camera.right = half * a; camera.top = half; camera.bottom = -half;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
addEventListener('resize', resize);
resize();

const hemi = new THREE.HemisphereLight(0xfff1e0, 0x5a4636, 1.1);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe2c4, 1.4);
key.position.set(-3, 9, 8);
key.target.position.copy(CENTER);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 25 });
key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 3;
scene.add(key, key.target);
const lamp = new THREE.PointLight(0xffb36b, 7, 0, 2);
lamp.position.set(2.0, 2.3, 1.7);
scene.add(lamp);
const winLight = new THREE.SpotLight(0xbcd7ff, 8, 7, .95, .7, 1.4);
scene.add(winLight, winLight.target);
let lightsOn = true;

/* ---------------------------------------------------------------- textures and materials */
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.userData = { canvas: c };
  return t;
}
const M = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .85, metalness: 0 }, o || {}));

function planks(base, seed) {
  const r = seeded(seed);
  return canvasTex(512, 1024, (g, w, h) => {
    const n = 8, pw = w / n;
    for (let i = 0; i < n; i++) {
      let y = -r() * 400;
      while (y < h) {
        const len = 260 + r() * 420, k = (r() - .5) * .16;
        g.fillStyle = shade(base, k);
        g.fillRect(i * pw, y, pw, len);
        g.fillStyle = 'rgba(60,35,15,.35)'; g.fillRect(i * pw, y, pw, 2);
        for (let j = 0; j < 7; j++) { g.fillStyle = 'rgba(90,55,25,' + (.04 + r() * .06) + ')'; g.fillRect(i * pw + r() * pw, y, 1 + r() * 2, len); }
        y += len;
      }
      g.fillStyle = 'rgba(60,35,15,.45)'; g.fillRect(i * pw, 0, 2, h);
    }
  }, [W / (8 * .19), D / (16 * .19) * 2]);
}
function shade(hex, k) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k * .5);
  return '#' + c.getHexString();
}
function plaid() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3f63b8'; g.fillRect(0, 0, w, h);
    const bands = [[0, 70, 'rgba(26,38,104,.75)'], [150, 46, 'rgba(140,214,236,.75)'], [256, 70, 'rgba(26,38,104,.75)'], [360, 46, 'rgba(140,214,236,.75)'], [440, 26, 'rgba(98,148,224,.8)']];
    bands.forEach(([p, s, c]) => { g.fillStyle = c; g.fillRect(p, 0, s, h); });
    bands.forEach(([p, s, c]) => { g.fillStyle = c; g.globalAlpha = .7; g.fillRect(0, p, w, s); g.globalAlpha = 1; });
    g.fillStyle = 'rgba(255,255,255,.7)';
    [120, 330].forEach((p) => { g.fillRect(p, 0, 3, h); g.fillRect(0, p, w, 3); });
  }, [2, 2]);
}
function stripes() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8d9196';
    for (let y = 18; y < h * .78; y += 34) g.fillRect(0, y, w, 15);
    g.fillStyle = '#4a4e54'; g.fillRect(0, h * .8, w, h * .2);
  });
}

/* ---------------------------------------------------------------- building blocks */
const hotList = [];
function blk(parent, pos, size, mat, opt) {
  opt = opt || {};
  const geo = opt.r ? new RoundedBoxGeometry(size[0], size[1], size[2], 3, opt.r) : new THREE.BoxGeometry(size[0], size[1], size[2]);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0] + size[0] / 2, pos[1] + size[1] / 2, pos[2] + size[2] / 2);
  m.castShadow = opt.cast !== false; m.receiveShadow = true;
  parent.add(m);
  return m;
}
function cyl(parent, pos, r, h, mat, opt) {
  opt = opt || {};
  const m = new THREE.Mesh(new THREE.CylinderGeometry(opt.r2 != null ? opt.r2 : r, r, h, opt.seg || 28), mat);
  m.position.set(pos[0], pos[1] + h / 2, pos[2]);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}
function ball(parent, pos, r, mat) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
  m.position.set(pos[0], pos[1], pos[2]); m.castShadow = true;
  parent.add(m);
  return m;
}
function hot(obj, key, label) {
  obj.traverse((o) => { if (o.isMesh) { o.userData.hot = { key, label }; hotList.push(o); } });
}

/* the shared shell: floor, two walls, a window to the other one's city */
function shell(g, o) {
  const floorMat = o.carpet ? M(0xffffff, { map: carpet('#' + new THREE.Color(o.carpet).getHexString(), o.seed), roughness: 1 }) : M(0xffffff, { map: planks(o.floor, o.seed), roughness: .7 });
  blk(g, [0, -.1, 0], [W, .1, D], floorMat, { cast: false });
  blk(g, [-.03, -.42, -.03], [W + .15, .32, D + .06], M(o.slab || 0x3a281d), { cast: false });
  const wall = M(o.wall, { roughness: .95 });
  const back = blk(g, [0, 0, -.12], [W + .12, H, .12], wall);
  const right = blk(g, [W, 0, 0], [.12, H, D], wall);
  back.castShadow = right.castShadow = false;
  const cap = M(o.cap || 0xe9e2d6);
  blk(g, [0, H, -.12], [W + .12, .03, .12], cap, { cast: false });
  blk(g, [W, H, 0], [.12, .03, D], cap, { cast: false });
  const white = M(0xf6f4ee, { roughness: .6 });
  blk(g, [0, 0, 0], [W, .09, .018], white, { cast: false });
  blk(g, [W - .018, 0, 0], [.018, .09, D], white, { cast: false });

  /* window to the other city */
  const wx = o.wx, ww = 1.12, wh = 1.06, wy = 1.02;
  if (o.rail) {
    blk(g, [0, 1.9, 0], [wx - ww / 2 - .14, .1, .028], white);
    blk(g, [wx + ww / 2 + .14, 1.9, 0], [W - (wx + ww / 2 + .14), .1, .028], white);
    blk(g, [W - .028, 1.9, 0], [.028, .1, D], white);
  }
  const sky = canvasTex(512, 486, () => {});
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false }));
  glass.position.set(wx, wy + wh / 2, .012);
  g.add(glass);
  const frame = new THREE.Group(); g.add(frame);
  const fm = M(o.frame || 0xf7f5ef, { roughness: .5 });
  const t = .055, dpt = .07;
  blk(frame, [wx - ww / 2 - t, wy - t, 0], [ww + 2 * t, t, dpt], fm);
  blk(frame, [wx - ww / 2 - t, wy + wh, 0], [ww + 2 * t, t, dpt], fm);
  blk(frame, [wx - ww / 2 - t, wy, 0], [t, wh, dpt], fm);
  blk(frame, [wx + ww / 2, wy, 0], [t, wh, dpt], fm);
  blk(frame, [wx - .015, wy, 0], [.03, wh, .04], fm);
  blk(frame, [wx - ww / 2, wy + wh * .55, 0], [ww, .03, .04], fm);
  blk(frame, [wx - ww / 2 - .12, wy - t - .035, 0], [ww + .24, .035, .16], fm);
  if (o.curtains) {
    const cm = M(o.curtains, { roughness: 1, side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const cx = wx + side * (ww / 2 + .16);
      for (let i = 0; i < 4; i++) cyl(g, [cx - side * .025 * i, wy - .25, .08 + (i % 2) * .03], .04, wh + .62, cm, { seg: 10 });
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, ww + .7, 8), M(0xd9c7a0, { metalness: .4, roughness: .4 }));
    rod.rotation.z = Math.PI / 2; rod.position.set(wx, wy + wh + .2, .1); g.add(rod);
  }
  hot(glass, 'window'); hot(frame, 'window');
  if (o.ao) aoStrips(g);
  return { sky, glass, center: new THREE.Vector3(wx, wy + wh / 2, .02), wx };
}

/* a little portable CD player that spins while music plays */
function cdPlayer(g, pos, body) {
  const grp = new THREE.Group(); grp.position.set(pos[0], pos[1], pos[2]); g.add(grp);
  cyl(grp, [0, 0, 0], .135, .04, M(body, { metalness: .55, roughness: .32 }), { seg: 40 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .004, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xeef2ff, metalness: .85, roughness: .12, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [200, 800] }));
  disc.position.set(0, .043, 0); grp.add(disc);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .005, 32), M(0xf4d36b));
  label.position.set(0, .045, 0); disc.add(label); label.position.y = .001;
  cyl(grp, [0, .043, 0], .012, .008, M(0x9aa0a8, { metalness: .7, roughness: .3 }));
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .008, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .9, roughness: .05, thickness: .01, transparent: true, opacity: .35 }));
  lid.position.set(0, .052, 0); grp.add(lid);
  blk(grp, [-.06, .005, .118], [.12, .018, .03], M(0x2a2c30), { cast: false });
  /* a little pair of headphones next to it */
  const hp = M(0x2b2d33, { roughness: .5 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(.085, .011, 8, 24, Math.PI), hp);
  arc.rotation.set(-Math.PI / 2, 0, 0); arc.position.set(.24, .012, .02); grp.add(arc);
  ball(grp, [.155, .02, .02], .028, hp); ball(grp, [.325, .02, .02], .028, hp);
  hot(grp, 'cd');
  return disc;
}

/* a screen that shows our countdown */
function screenTex() { return canvasTex(512, 320, () => {}); }

/* hearts that float up */
const heartTex = canvasTex(64, 64, (g) => {
  g.fillStyle = '#ff6f8f'; g.beginPath();
  g.moveTo(32, 54); g.bezierCurveTo(4, 36, 6, 10, 22, 10); g.bezierCurveTo(28, 10, 32, 16, 32, 20);
  g.bezierCurveTo(32, 16, 36, 10, 42, 10); g.bezierCurveTo(58, 10, 60, 36, 32, 54); g.fill();
});
const hearts = [];
function burst(at) {
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent: true, depthWrite: false }));
    s.position.copy(at); s.scale.setScalar(.12 + Math.random() * .08);
    s.userData = { v: new THREE.Vector3((Math.random() - .5) * .5, .7 + Math.random() * .6, (Math.random() - .5) * .5), t: 0 };
    scene.add(s); hearts.push(s);
  }
}


/* ---------------------------------------------------------------- touches that make it feel real */
const blobTex = canvasTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.55, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
const fadeTex = canvasTex(4, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
/* a soft dark patch on the floor under something, where light can't reach */
function contact(g, x, z, w, d, o) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: o == null ? .38 : o, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .003, z); m.renderOrder = 1;
  g.add(m); return m;
}
/* darker corners where the walls meet the floor */
function aoStrips(g) {
  const mat = (o) => new THREE.MeshBasicMaterial({ map: fadeTex, transparent: true, opacity: o, depthWrite: false });
  const f1 = new THREE.Mesh(new THREE.PlaneGeometry(W, .45), mat(.22)); f1.rotation.x = -Math.PI / 2; f1.position.set(W / 2, .002, .225); g.add(f1);
  const f2 = new THREE.Mesh(new THREE.PlaneGeometry(.45, D), mat(.22)); f2.rotation.x = -Math.PI / 2; f2.rotation.z = Math.PI / 2; f2.position.set(W - .225, .002, D / 2); g.add(f2);
  f2.material.map = fadeTex.clone(); f2.material.map.needsUpdate = true;
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(W, .5), mat(.14)); w1.position.set(W / 2, .25, .004); w1.rotation.z = Math.PI; g.add(w1);
  const w2 = new THREE.Mesh(new THREE.PlaneGeometry(D, .5), mat(.14)); w2.position.set(W - .004, .25, D / 2); w2.rotation.set(0, -Math.PI / 2, Math.PI); g.add(w2);
  const c1 = new THREE.Mesh(new THREE.PlaneGeometry(H, .35), mat(.12)); c1.position.set(W - .175, H / 2, .004); c1.rotation.z = Math.PI / 2; g.add(c1);
  const c2 = new THREE.Mesh(new THREE.PlaneGeometry(H, .35), mat(.12)); c2.position.set(W - .004, H / 2, .175); c2.rotation.set(0, -Math.PI / 2, -Math.PI / 2); g.add(c2);
  [f1, f2, w1, w2, c1, c2].forEach((m) => { m.renderOrder = 1; });
}
function woodTex(base, seed, horizontal) {
  const r = seeded(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = r() * h, a = .04 + r() * .09;
      g.strokeStyle = r() < .5 ? 'rgba(120,70,30,' + a + ')' : 'rgba(255,235,200,' + a * .8 + ')';
      g.lineWidth = .6 + r() * 1.6;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * .03 + i) * 2.2 + (r() - .5) * 1.2);
      g.stroke();
    }
    if (horizontal === false) { g.translate(w / 2, h / 2); g.rotate(Math.PI / 2); }
  }, [1, 1]);
}
function fabricTex(base, seed) {
  const r = seeded(seed);
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; g.fillRect(r() * w, r() * h, 1, 1); }
    for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(0,0,0,.025)'; g.fillRect(0, y, w, 1); }
  }, [3, 3]);
}
/* a keyboard with real little keys */
function keyboard(g, x, y, z, w, d, caseCol, keyCol, accent) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); g.add(grp);
  blk(grp, [0, 0, 0], [w, .018, d], M(caseCol, { roughness: .5 }), { r: .006 });
  const rows = 5, cols = 14, kw = (w - .02) / cols, kd = (d - .02) / rows;
  const geo = new RoundedBoxGeometry(kw * .82, .01, kd * .8, 2, .002);
  const inst = new THREE.InstancedMesh(geo, M(keyCol, { roughness: .45 }), rows * cols);
  const acc = new THREE.InstancedMesh(geo, M(accent, { roughness: .45 }), 6);
  const mtx = new THREE.Matrix4(); let n = 0, a = 0;
  for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) {
    mtx.makeTranslation(.01 + kw * (cc + .5), .022, .01 + kd * (rr + .5));
    if ((rr === 0 && cc === 0) || (rr === 4 && (cc === 6 || cc === 7)) || (rr === 2 && cc === 13) || (rr === 0 && cc === 13) || (rr === 4 && cc === 0)) acc.setMatrixAt(a++, mtx);
    else inst.setMatrixAt(n++, mtx);
  }
  inst.count = n; acc.count = a; inst.castShadow = true;
  grp.add(inst, acc);
  return grp;
}
/* a real-looking office chair */
function officeChair(g, x, z, rotY, fabric, strap) {
  const ch = new THREE.Group(); ch.position.set(x, 0, z); ch.rotation.y = rotY; g.add(ch);
  const black = M(0x1b1c1f, { roughness: .45, metalness: .2 });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.045, .03, .3), black);
    leg.position.set(Math.sin(a) * .15, .07, Math.cos(a) * .15); leg.rotation.y = a; leg.rotation.x = .08; leg.castShadow = true; ch.add(leg);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .03, 16), M(0x2a2b2e, { roughness: .4 }));
    wheel.rotation.z = Math.PI / 2; wheel.position.set(Math.sin(a) * .29, .03, Math.cos(a) * .29); wheel.castShadow = true; ch.add(wheel);
  }
  cyl(ch, [0, .07, 0], .045, .06, black, { r2: .055 });
  cyl(ch, [0, .12, 0], .022, .3, M(0x8a8f96, { metalness: .8, roughness: .25 }));
  blk(ch, [-.12, .4, -.12], [.24, .04, .24], black, { r: .01 });
  const seat = blk(ch, [-.26, .43, -.25], [.52, .09, .5], fabric, { r: .045 });
  seat.scale.y = 1;
  /* curved back that hugs whoever sits in it */
  const backMat = fabric.clone(); backMat.side = THREE.DoubleSide;
  const backShell = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .64, 24, 1, true, -.46, .92), backMat);
  backShell.position.set(0, .88, -.33); backShell.rotation.x = .1; backShell.castShadow = true; ch.add(backShell);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.558, .558, .035, 24, 1, true, -.47, .94), M(0x141517, { roughness: .5, side: THREE.DoubleSide }));
  rim.position.set(0, 1.2, -.3); rim.rotation.x = .1; ch.add(rim);
  const rim2 = rim.clone(); rim2.position.set(0, .57, -.36); ch.add(rim2);
  const spine = blk(ch, [-.03, .46, .17], [.06, .16, .07], black); spine.rotation.x = .2;
  if (strap) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.562, .562, .055, 24, 1, true, -.48, .96), M(strap, { roughness: .8, side: THREE.DoubleSide }));
    st.position.set(0, .98, -.32); st.rotation.x = .1; ch.add(st);
  }
  for (const s of [-1, 1]) {
    blk(ch, [s * .27 - .015, .46, -.02], [.03, .22, .03], black);
    blk(ch, [s * .27 - .04, .68, -.17], [.08, .03, .26], M(0x222326, { roughness: .6 }), { r: .012 });
  }
  return ch;
}
/* a coat on a hanger */
function coat(g, x, z, len, col, rot) {
  const grp = new THREE.Group(); grp.position.set(x, 1.62, z); grp.rotation.y = rot || 0; g.add(grp);
  const wire = M(0xd8dadc, { metalness: .7, roughness: .3 });
  const hook = new THREE.Mesh(new THREE.TorusGeometry(.025, .004, 6, 16, Math.PI * 1.3), wire); hook.position.set(0, .03, 0); hook.rotation.y = Math.PI / 2; grp.add(hook);
  const fab = M(col, { roughness: .95 });
  const body = blk(grp, [-.2, -len, -.05], [.4, len - .05, .1], fab, { r: .045 });
  body.scale.set(1, 1, 1);
  const sh = blk(grp, [-.23, -.16, -.055], [.46, .14, .11], fab, { r: .05 });
  sh.rotation.z = 0;
  for (const s of [-1, 1]) { const sl = blk(grp, [s * .2 - .045, -len * .78, -.045], [.09, len * .7, .09], fab, { r: .04 }); sl.rotation.z = s * .06; }
  blk(grp, [-.015, -len + .02, .045], [.03, len - .2, .008], M(0x0d0e10), { cast: false });
  return grp;
}

/* ================================================================ Logan's room in Toronto: his photo, with details from his 3D picture */
function carpet(base, seed) {
  const r = seeded(seed);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) {
      const v = r();
      g.fillStyle = v < .5 ? 'rgba(70,45,25,' + (.05 + r() * .08) + ')' : 'rgba(255,240,220,' + (.04 + r() * .07) + ')';
      g.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
    }
  }, [3, 3]);
}
function suitcase(g, x, y, z, color, h) {
  const s = new THREE.Group(); s.position.set(x, y, z); g.add(s);
  const m = M(color, { roughness: .45 });
  blk(s, [-.12, 0, -.2], [.24, h, .4], m, { r: .035 });
  for (const dz of [-.12, 0, .12]) blk(s, [.115, .04, dz - .012], [.012, h - .08, .024], M(color, { roughness: .35 }), { cast: false });
  const metal = M(0x9aa0a8, { metalness: .6, roughness: .3 });
  for (const dz of [-.07, .07]) cyl(s, [-.06, h, dz], .008, .2, metal);
  blk(s, [-.08, h + .19, -.08], [.04, .02, .16], M(0x1e1f22));
  for (const dz of [-.15, .15]) ball(s, [0, .015, dz], .025, M(0x1e1f22));
  return s;
}
function shoe(g, x, z, kind) {
  const grp = new THREE.Group(); grp.position.set(x, 0, z); g.add(grp);
  if (kind === 'boot') {
    blk(grp, [-.15, 0, -.055], [.3, .035, .11], M(0x5a3a1c), { r: .015 });
    blk(grp, [-.14, .03, -.05], [.27, .09, .1], M(0xc4893a, { roughness: .9 }), { r: .03 });
    blk(grp, [.02, .03, -.05], [.11, .2, .1], M(0xc4893a, { roughness: .9 }), { r: .03 });
    for (let i = 0; i < 4; i++) blk(grp, [.0 - i * .025, .12 - i * .02 + .06, -.035], [.012, .012, .07], M(0xf0c419), { cast: false });
  } else {
    blk(grp, [-.14, 0, -.05], [.28, .03, .1], M(0xf2f2ee), { r: .012 });
    blk(grp, [-.13, .025, -.045], [.26, .07, .09], M(0xffffff, { roughness: .6 }), { r: .03 });
    blk(grp, [-.02, .05, -.046], [.04, .05, .092], M(kind === 'red' ? 0xd23a3a : 0x2b2b2b), { cast: false });
    blk(grp, [-.11, .09, -.03], [.12, .012, .06], M(kind === 'red' ? 0xd23a3a : 0x2b2b2b), { cast: false });
  }
  return grp;
}
function buildLogan(g) {
  const win = shell(g, { wall: 0x9eac96, floor: 0xc9a67b, seed: 7, wx: 2.05, rail: true, ao: true });
  const white = M(0xf1f1ee, { roughness: .42 }), black = M(0x1e1f22, { roughness: .55 });
  const pine = M(0xffffff, { map: woodTex('#d8af78', 3), roughness: .62 });
  const pineLight = M(0xffffff, { map: woodTex('#e3c08f', 5), roughness: .65 });
  const navy = M(0xffffff, { map: fabricTex('#1f2738', 21), roughness: .95 }), ink = M(0x17181b, { roughness: .7 });

  /* outlets and a light switch on the walls */
  const plate = M(0xf4f3ef, { roughness: .4 });
  [[1.05, .3], [2.95, .3]].forEach(([x, y]) => { blk(g, [x - .04, y - .06, 0], [.08, .12, .008], plate, { cast: false }); for (const dy of [-.025, .025]) blk(g, [x - .012, y + dy - .008, .008], [.024, .016, .002], M(0x5c5f63), { cast: false }); });
  blk(g, [W - .008, 1.1, 3.38], [.008, .12, .08], plate, { cast: false });

  /* white desk on thin legs, with a little shelf on the right */
  blk(g, [1.4, .72, .03], [1.3, .035, .62], white, { r: .008 });
  for (const z of [.06, .6]) blk(g, [1.42, 0, z], [.03, .72, .03], white);
  for (const x of [2.2, 2.66]) blk(g, [x, 0, .05], [.022, .72, .6], white);
  for (const y of [.05, .33]) blk(g, [2.2, y, .05], [.482, .018, .6], white);
  contact(g, 2.05, .35, 1.6, .9, .3);
  /* books on the shelf under the desk: our reading corner */
  const under = new THREE.Group(); g.add(under);
  const covers = [0x7a2e2a, 0x23395b, 0x3b3a36, 0xc9a35d, 0x5b7a5a, 0xe8e0d0, 0x8d4b6a, 0x2f4f6f];
  let bx0 = 2.235;
  covers.forEach((col, i) => {
    const t = .035 + (i % 3) * .012, h = .2 + (i % 4) * .025;
    const bk = blk(under, [bx0, .068, .1], [t, h, .17 + (i % 2) * .03], M(col, { roughness: .7 }), { r: .004 });
    blk(under, [bx0 + .002, .068 + h * .7, .1 + .171 + (i % 2) * .03], [t - .004, .02, .002], M(0xe9d9b4), { cast: false });
    bx0 += t + .006;
    if (i === 7) { bk.rotation.z = -.28; bk.position.x += .03; }
  });
  for (let i = 0; i < 4; i++) blk(under, [2.25, .348 + i * .032, .12 + (i % 2) * .02], [.24 - i * .01, .03, .18], M([0x23395b, 0x7a2e2a, 0x3b3a36, 0xd8cfbf][i], { roughness: .7 }), { r: .004 });
  for (let i = 0; i < 3; i++) blk(under, [1.62 + (i % 2) * .02, i * .045, .14], [.26, .045, .2], M([0xc9a35d, 0x23395b, 0x5b7a5a][i], { roughness: .7 }), { r: .005 });
  hot(under, 'books');
  /* laptop up on a stand */
  const stand = M(0xb7bcc2, { metalness: .75, roughness: .3 });
  for (const x of [1.47, 1.79]) { const s = blk(g, [x, .755, .1], [.025, .1, .24], stand, { r: .006 }); s.rotation.x = .05; }
  const lt = new THREE.Group(); lt.position.set(1.645, .85, .23); lt.rotation.x = .22; g.add(lt);
  blk(lt, [-.18, 0, -.13], [.36, .014, .26], M(0x232428, { metalness: .5, roughness: .35 }), { r: .006 });
  const lid = new THREE.Group(); lid.position.set(0, .014, -.13); lid.rotation.x = -.35; lt.add(lid);
  blk(lid, [-.18, 0, 0], [.36, .24, .008], M(0x232428, { metalness: .5, roughness: .35 }), { r: .005 });
  const lscr = new THREE.Mesh(new THREE.PlaneGeometry(.33, .21), new THREE.MeshBasicMaterial({ color: 0x223049, toneMapped: false }));
  lscr.position.set(0, .12, .009); lid.add(lscr);
  /* the monitor that shows our countdown */
  const scr = screenTex();
  blk(g, [1.98, .755, .12], [.2, .01, .14], M(0x2a2b2f, { metalness: .4, roughness: .4 }), { r: .004 });
  blk(g, [2.065, .765, .15], [.03, .17, .025], M(0x2a2b2f, { metalness: .4, roughness: .4 }));
  const bezel = blk(g, [1.85, .86, .165], [.52, .34, .02], M(0x111214, { roughness: .4 }), { r: .006 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.5, .315), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }));
  face.position.set(2.11, 1.03, .186); g.add(face);
  hot(bezel, 'screen'); hot(face, 'screen');
  /* her photo in a little wooden frame */
  const photoTex = new THREE.TextureLoader().load('img/her.jpg?v=1');
  photoTex.colorSpace = THREE.SRGBColorSpace; photoTex.anisotropy = 4;
  const pf = new THREE.Group(); pf.position.set(1.52, .755, .42); pf.rotation.set(-.12, -.45, 0); g.add(pf);
  blk(pf, [-.075, 0, -.012], [.15, .2, .024], M(0xffffff, { map: woodTex('#b0814f', 9), roughness: .5 }), { r: .005 });
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(.128, .178), M(0xf6f1e8, { roughness: .9 }));
  mat.position.set(0, .1, .0125); pf.add(mat);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(.104, .139), new THREE.MeshStandardMaterial({ map: photoTex, roughness: .35 }));
  pic.position.set(0, .1, .0128); pf.add(pic);
  const leg = blk(pf, [-.012, 0, -.08], [.024, .16, .01], M(0x8a6038)); leg.rotation.x = .35;
  hot(pf, 'photo');
  contact(g, 1.52, .43, .2, .12, .3);
  /* keyboard, mouse on a pad, glasses, bottles, the little round clock */
  blk(g, [1.66, .755, .36], [.6, .004, .26], M(0x2a2c30, { roughness: .9 }), { cast: false });
  keyboard(g, 1.7, .759, .38, .42, .14, 0xece6d8, 0xf4efe4, 0xe9733b);
  blk(g, [2.17, .759, .42], [.06, .028, .1], M(0xf1ede4, { roughness: .4 }), { r: .014 });
  const gl = M(0x1b1b1d, { metalness: .3, roughness: .4 });
  for (const dx of [0, .075]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(.03, .004, 8, 24), gl); ring.rotation.x = -Math.PI / 2.4; ring.position.set(1.42 + dx + .02, .775, .58); g.add(ring); }
  blk(g, [1.448, .772, .576], [.03, .004, .006], gl, { cast: false });
  cyl(g, [2.6, .755, .12], .032, .21, M(0x2f3236, { metalness: .6, roughness: .3 }));
  cyl(g, [2.6, .965, .12], .026, .03, M(0x1b1c1f));
  cyl(g, [2.52, .755, .2], .03, .19, new THREE.MeshPhysicalMaterial({ color: 0x5b8fd6, roughness: .15, transmission: .35, transparent: true, opacity: .9 }));
  cyl(g, [2.52, .945, .2], .02, .03, M(0x1f3f7a));
  const clock = new THREE.Mesh(new THREE.SphereGeometry(.035, 24, 16), M(0xf5f2ea, { roughness: .3 })); clock.position.set(2.47, .79, .32); clock.scale.set(1, .9, .6); g.add(clock);
  /* power strip and cables */
  blk(g, [2.3, .755, .06], [.28, .03, .06], M(0xf3f3f0, { roughness: .4 }), { r: .01 });
  for (let i = 0; i < 3; i++) blk(g, [2.33 + i * .08, .785, .07], [.035, .03, .04], M(0x2a2b2e), { r: .006 });
  const cable = (pts, col) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .005, 6, false), M(col || 0x1a1a1c, { roughness: .6 }));
    m.castShadow = true; g.add(m);
  };
  cable([[2.07, .8, .14], [2.12, .77, .08], [2.33, .8, .08]]);
  cable([[1.8, .86, .13], [1.95, .77, .06], [2.4, .8, .085]]);
  cable([[2.55, .78, .1], [2.62, .76, .04], [2.64, .4, .03], [2.6, .02, .05], [2.9, .01, .05]], 0xf0f0ee);
  const disc = cdPlayer(g, [2.43, .755, .5], 0xc9ccd2);

  /* black drawers left of the desk, a few books on top, the see-through box in the corner */
  blk(g, [.94, 0, .03], [.44, .7, .46], ink, { r: .01 });
  for (const y of [.235, .465]) blk(g, [.95, y, .487], [.42, .006, .006], M(0x0b0b0c), { cast: false });
  for (const y of [.13, .36, .59]) blk(g, [1.11, y, .49], [.1, .014, .016], M(0x6a6d72, { metalness: .6, roughness: .3 }), { r: .004 });
  contact(g, 1.16, .26, .7, .7, .35);
  const shelfBooks = new THREE.Group(); g.add(shelfBooks);
  [[0x7a2e2a, .26], [0x23395b, .3], [0x3b3a36, .24], [0xc9a35d, .22]].forEach(([col, h], i) => {
    const bk = blk(shelfBooks, [1.0 + i * .075, .7, .1], [.06, h, .22], M(col, { roughness: .7 }), { r: .004 });
    if (i === 3) { bk.rotation.z = -.35; bk.position.x += .04; }
  });
  hot(shelfBooks, 'books');
  const box = blk(g, [.05, 0, .1], [.5, .38, .62], new THREE.MeshPhysicalMaterial({ color: 0xc9d1d8, roughness: .25, transmission: .55, transparent: true, opacity: .8, thickness: .02 }), { r: .015 });
  box.castShadow = false;
  blk(g, [.04, .37, .09], [.52, .025, .64], M(0x9aa3ab, { roughness: .4 }), { r: .01 });
  for (let i = 0; i < 3; i++) blk(g, [.1 + i * .14, .02, .2], [.12, .2 + i * .04, .4], M([0x6b5a4a, 0x3a5070, 0x8a8f96][i], { roughness: .9 }), { r: .02 });
  contact(g, .3, .41, .7, .8, .3);

  /* office chair with the green strap */
  officeChair(g, 2.02, 1.02, -.2, M(0xffffff, { map: fabricTex('#26272b', 31), roughness: .85 }), 0x2fa36b);
  contact(g, 2.02, 1.02, .75, .75, .35);

  /* his bed along the right wall: pine frame, blue plaid sheet, pillow and blanket */
  const bx = W - 1.0, bz = .08, bl = 2.1;
  for (const x of [bx, W - .07]) {
    blk(g, [x, .2, bz], [.07, .12, bl], pine, { r: .008 });
    blk(g, [x, 0, bz], [.07, .8, .07], pine, { r: .008 });
    blk(g, [x, 0, bz + bl - .07], [.07, .64, .07], pine, { r: .008 });
    blk(g, [x + .005, .8, bz + .005], [.06, .015, .06], pineLight, { r: .006 });
  }
  for (const y of [.42, .66]) blk(g, [bx + .07, y, bz + .01], [.86, .07, .05], pine, { r: .008 });
  blk(g, [bx + .07, .52, bz + bl - .06], [.86, .07, .05], pine, { r: .008 });
  for (let i = 1; i <= 3; i++) blk(g, [bx + .07 + i * .215 - .025, .26, bz + bl - .055], [.05, .26, .04], pineLight, { r: .006 });
  const pl = plaid();
  const sheetMat = M(0xffffff, { map: pl, roughness: .95 });
  const mattress = blk(g, [bx + .05, .3, bz + .06], [.9, .22, bl - .12], sheetMat, { r: .05 });
  mattress.material.map.repeat.set(1.6, 1.6);
  hot(mattress, 'bed');
  const pillow = blk(g, [bx + .16, .5, bz + .12], [.62, .1, .34], M(0xffffff, { map: fabricTex('#e9ecf2', 41), roughness: .95 }), { r: .05 });
  pillow.rotation.x = -.08; pillow.scale.y = .9;
  const blanket = blk(g, [bx + .22, .51, bz + .62], [.5, .09, .4], M(0xffffff, { map: fabricTex('#dfe3c9', 43), roughness: 1 }), { r: .035 });
  blanket.rotation.y = .06;
  blk(g, [bx + .36, .52, bz + 1.3], [.075, .01, .15], M(0x111214, { roughness: .3 }), { r: .004 });
  contact(g, bx + .5, bz + bl / 2, 1.25, 2.4, .45);
  /* boots under the bed */
  shoe(g, bx + .3, bz + 1.75, 'boot'); shoe(g, bx + .3, bz + 1.6, 'boot');
  /* pink slippers by the bed, waiting for her */
  const sl = new THREE.Group(); g.add(sl);
  for (const dz of [0, .13]) {
    blk(sl, [bx - .32, 0, 1.2 + dz], [.26, .03, .1], M(0xffffff, { map: fabricTex('#f3c3c6', 51), roughness: 1 }), { r: .015 });
    blk(sl, [bx - .32, .025, 1.205 + dz], [.13, .05, .09], M(0xffffff, { map: fabricTex('#f6cfd2', 52), roughness: 1 }), { r: .03 });
  }
  hot(sl, 'slippers');

  /* hooks on the right wall with bags and the bunny keychain; shoes lined up underneath */
  const hm = M(0xc9ccd0, { metalness: .7, roughness: .3 });
  for (const z of [2.42, 2.82, 3.22]) { cyl(g, [W - .05, 1.86, z], .012, .05, hm); }
  blk(g, [W - .19, 1.28, 2.28], [.14, .27, .3], ink, { r: .05 });
  blk(g, [W - .1, 1.5, 2.41], [.015, .36, .015], ink, { cast: false });
  blk(g, [W - .2, 1.12, 2.66], [.16, .62, .32], M(0xffffff, { map: fabricTex('#1b1c1f', 61), roughness: .9 }), { r: .06 });
  blk(g, [W - .21, 1.5, 2.7], [.005, .006, .24], M(0x9aa0a8, { metalness: .7 }), { cast: false });
  const pack = blk(g, [W - .3, .98, 3.0], [.26, .7, .44], navy, { r: .1 });
  blk(g, [W - .36, 1.02, 3.08], [.08, .3, .3], navy, { r: .06 });
  blk(g, [W - .365, 1.2, 3.1], [.004, .005, .26], M(0x9aa0a8, { metalness: .7 }), { cast: false });
  for (const z of [3.06, 3.38]) blk(g, [W - .08, 1.15, z], [.04, .7, .045], navy, { cast: false, r: .015 });
  hot(pack, 'bag');
  const bunny = new THREE.Group(); bunny.position.set(W - .25, 1.18, 2.98); g.add(bunny);
  const fur = M(0xffffff, { map: fabricTex('#dcc6a6', 71), roughness: 1 });
  ball(bunny, [0, 0, 0], .05, fur); ball(bunny, [0, .07, 0], .038, fur);
  for (const s of [-1, 1]) { const e = ball(bunny, [0, .12, s * .016], .016, fur); e.scale.set(.7, 2.2, .7); }
  ball(bunny, [-.035, .075, -.012], .006, M(0x2a1d14)); ball(bunny, [-.035, .075, .012], .006, M(0x2a1d14));
  blk(bunny, [-.002, .08, -.002], [.004, .2, .004], M(0xc9ccd0, { metalness: .7 }), { cast: false });
  hot(bunny, 'plush');
  [[2.36, 'boot'], [2.5, 'boot'], [2.72, 'red'], [2.86, 'red'], [3.06, 'red'], [3.2, 'red'], [3.4, 'black']].forEach(([z, k]) => shoe(g, W - .2, z, k));
  contact(g, W - .2, 2.9, .4, 1.3, .3);

  /* the other pine bed frame on the left: slats, suitcases standing on it */
  const fx0 = .05, fx1 = .98, fz0 = 1.3, fz1 = 3.45;
  for (const x of [fx0, fx1 - .06]) blk(g, [x, .16, fz0], [.06, .12, fz1 - fz0], pine, { r: .008 });
  for (const x of [fx0, fx1 - .06]) { blk(g, [x, 0, fz0], [.06, .62, .06], pine, { r: .008 }); blk(g, [x, 0, fz1 - .06], [.06, .4, .06], pine, { r: .008 }); }
  for (const y of [.36, .54]) blk(g, [fx0 + .06, y, fz0], [fx1 - fx0 - .12, .06, .05], pine, { r: .008 });
  for (let i = 0; i < 9; i++) blk(g, [fx0 + .06, .24, fz0 + .08 + i * .235], [fx1 - fx0 - .12, .022, .15], pineLight, { r: .004 });
  blk(g, [fx0 + .06, .26, fz1 - .06], [fx1 - fx0 - .12, .1, .05], pine, { r: .008 });
  contact(g, .52, 2.38, 1.2, 2.4, .4);
  const cases = new THREE.Group(); g.add(cases);
  [[.3, 1.62, 0x22427f, .58], [.3, 2.02, 0x234885, .52], [.72, 1.82, 0x22427f, .46]].forEach(([x, z, col, h]) => suitcase(cases, x, .265, z, col, h));
  suitcase(cases, .62, .265, 2.46, 0xf1f0ec, .5);
  hot(cases, 'suitcase');
  blk(g, [.2, .265, 2.85], [.5, .2, .4], M(0x8d939b, { roughness: .8 }), { r: .02 });

  /* clothes rack with coats on hangers, and bags */
  const rack = M(0x1a1b1e, { metalness: .6, roughness: .35 });
  const rx = 1.32;
  for (const z of [1.3, 2.6]) {
    cyl(g, [rx, 0, z], .013, 1.66, rack);
    blk(g, [rx - .2, .05, z - .012], [.4, .024, .024], rack, { r: .008 });
    for (const s of [-1, 1]) { const wv = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .022, 14), M(0x111214)); wv.rotation.z = Math.PI / 2; wv.position.set(rx + s * .18, .025, z); g.add(wv); }
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, 1.34, 12), rack);
  bar.rotation.x = Math.PI / 2; bar.position.set(rx, 1.65, 1.95); bar.castShadow = true; g.add(bar);
  [[0x1f2433, .78], [0x17181c, .95], [0x3b404b, .7], [0x23293a, .88], [0x1a1c20, .8]].forEach(([col, len], i) => coat(g, rx, 1.47 + i * .23, len, col, Math.PI / 2 + (i % 2 ? .06 : -.05)));
  blk(g, [rx - .06, .92, 2.42], [.13, .28, .3], M(0x6b3f22, { roughness: .5 }), { r: .04 });
  blk(g, [rx, 1.18, 2.55], [.012, .46, .012], M(0x5a3520), { cast: false });
  blk(g, [rx - .08, 1.1, 1.3], [.16, .19, .3], M(0x5c6670, { roughness: .7 }), { r: .04 });
  contact(g, rx, 1.95, .8, 1.7, .32);

  /* striped laundry basket with a shirt sticking out */
  const bm = M(0xffffff, { map: stripes(), roughness: 1, side: THREE.DoubleSide });
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(.24, .22, .55, 4, 1, true), bm);
  basket.rotation.y = Math.PI / 4; basket.position.set(1.98, .275, 2.25); basket.castShadow = true; g.add(basket);
  blk(g, [1.83, .02, 2.1], [.3, .02, .3], M(0x3d4045), { cast: false });
  const shirt = blk(g, [1.86, .42, 2.12], [.24, .14, .22], M(0xffffff, { map: fabricTex('#c9d6e6', 81), roughness: 1 }), { r: .05 });
  shirt.rotation.set(.2, .3, -.15);
  contact(g, 1.98, 2.25, .55, .55, .4);

  /* small black side table: the camera on top, a pack of water underneath */
  for (const x of [2.38, 2.78]) for (const z of [2.75, 3.13]) blk(g, [x, 0, z], [.02, .55, .02], black);
  blk(g, [2.37, .53, 2.74], [.44, .025, .42], M(0xd9d9d6, { roughness: .35 }), { r: .006 });
  blk(g, [2.38, .03, 2.75], [.42, .015, .4], black);
  const wm = new THREE.MeshPhysicalMaterial({ color: 0xbfe0ff, transmission: .7, roughness: .1, transparent: true, opacity: .7, thickness: .05 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { cyl(g, [2.47 + i * .1, .045, 2.85 + j * .14], .04, .22, wm, { seg: 18 }); cyl(g, [2.47 + i * .1, .265, 2.85 + j * .14], .016, .03, M(0x2d6fd4)); }
  const cam = new THREE.Group(); cam.position.set(2.59, .555, 2.95); cam.rotation.y = -.5; g.add(cam);
  blk(cam, [-.08, 0, -.05], [.16, .1, .09], M(0x1b1c1f, { roughness: .5 }), { r: .015 });
  const lens = cyl(cam, [0, 0, 0], .035, .07, M(0x2a2b2f, { metalness: .5, roughness: .25 }));
  lens.rotation.x = Math.PI / 2; lens.position.set(0, .05, .075);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.026, 24), M(0x0a1424, { metalness: .9, roughness: .05 })); glass.position.set(0, .05, .111); cam.add(glass);
  blk(cam, [-.075, .1, -.03], [.04, .02, .04], M(0x1b1c1f));
  hot(cam, 'camera');
  contact(g, 2.58, 2.94, .6, .6, .35);

  return { win, disc, screens: [scr] };
}

/* ================================================================ her room in New Jersey (until we have her photo) */
function buildHer(g) {
  const win = shell(g, { wall: 0xead2c9, floor: 0xd8bd97, seed: 11, wx: 2.1, curtains: 0xf3b9c7, frame: 0xfbf7f2 });
  const white = M(0xf8f4ee, { roughness: .5 }), pink = M(0xf4c3cf, { roughness: .9 }), wood = M(0xd9b48a);
  blk(g, [.9, 0, 1.3], [1.8, .012, 1.4], M(0xf4dde2, { roughness: 1 }), { r: .006 });

  /* desk under the window */
  blk(g, [1.35, .72, .03], [1.2, .04, .6], white, { r: .01 });
  for (const x of [1.37, 2.49]) for (const z of [.06, .56]) blk(g, [x, 0, z], [.04, .72, .04], white);
  blk(g, [1.6, .76, .12], [.36, .016, .25], M(0xd9dbe0, { metalness: .6, roughness: .3 }));
  const lid = new THREE.Group(); lid.position.set(1.78, .776, .12); lid.rotation.x = -.2; g.add(lid);
  blk(lid, [-.18, 0, -.01], [.36, .24, .01], M(0xd9dbe0, { metalness: .6, roughness: .3 }));
  const scr = screenTex();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.33, .21), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }));
  face.position.set(0, .125, .002); lid.add(face);
  hot(lid, 'screen');
  const disc = cdPlayer(g, [2.22, .76, .42], 0xf2a9bb);
  /* plant and a round mirror */
  cyl(g, [2.42, .76, .14], .06, .1, M(0xe9e2d6));
  for (let i = 0; i < 6; i++) ball(g, [2.42 + Math.cos(i) * .05, .9 + (i % 3) * .04, .14 + Math.sin(i) * .05], .045, M(0x6f9d5f));
  const mirror = new THREE.Mesh(new THREE.TorusGeometry(.14, .018, 10, 36), M(0xe7c88f, { metalness: .5, roughness: .35 }));
  mirror.position.set(1.52, 1.0, .06); g.add(mirror);
  /* chair */
  const ch = new THREE.Group(); ch.position.set(1.95, 0, .95); g.add(ch);
  for (const x of [-.2, .2]) for (const z of [-.2, .2]) blk(ch, [x - .02, 0, z - .02], [.04, .45, .04], wood);
  blk(ch, [-.24, .45, -.24], [.48, .06, .48], pink, { r: .03 });
  blk(ch, [-.24, .5, .2], [.48, .45, .06], pink, { r: .03 });

  /* bed with a pink duvet and a bear */
  const bx = W - 1.08, bz = .1, bl = 2.05;
  blk(g, [bx, 0, bz], [1.04, .3, bl], white, { r: .03 });
  blk(g, [bx, 0, bz - .02], [1.04, .95, .07], white, { r: .03 });
  blk(g, [bx + .04, .3, bz + .07], [.96, .14, bl - .1], M(0xfbf6ef), { r: .04 });
  const duvet = blk(g, [bx + .02, .36, bz + .62], [1.0, .14, bl - .66], M(0xf6c6d2, { roughness: 1 }), { r: .06 });
  hot(duvet, 'bed');
  for (const x of [bx + .1, bx + .54]) blk(g, [x, .44, bz + .12], [.4, .12, .28], M(0xffffff), { r: .05 });
  const bear = new THREE.Group(); bear.position.set(bx + .3, .55, bz + .55); g.add(bear);
  const fur = M(0xb8835a, { roughness: 1 });
  ball(bear, [0, 0, 0], .11, fur); ball(bear, [0, .15, 0], .085, fur);
  ball(bear, [0, .23, -.06], .03, fur); ball(bear, [0, .23, .06], .03, fur);
  ball(bear, [-.075, .14, 0], .03, M(0xe7c9a5));
  for (const s of [-1, 1]) ball(bear, [-.05, .03, s * .1], .04, fur);
  hot(bear, 'plush');
  /* nightstand and lamp */
  blk(g, [bx - .5, 0, .08], [.42, .48, .38], wood, { r: .02 });
  cyl(g, [bx - .29, .48, .25], .02, .22, M(0xe9e2d6));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.08, .13, .14, 24, 1, true), M(0xfff1d6, { emissive: 0xffc98a, emissiveIntensity: .8, side: THREE.DoubleSide }));
  shade.position.set(bx - .29, .76, .25); g.add(shade);
  /* bookshelf on the left wall corner */
  for (const y of [.0, .42, .84, 1.26]) blk(g, [.08, y, .06], [.7, .04, .3], wood);
  for (const x of [.08, .74]) blk(g, [x, 0, .06], [.04, 1.3, .3], wood);
  const bc = [0xe8a0a8, 0x9fc0e0, 0xf3d38b, 0xb7d3a8, 0xd5b6e8, 0xf1f1f1];
  const shelfBooks = new THREE.Group(); g.add(shelfBooks);
  for (let s = 0; s < 3; s++) for (let i = 0; i < 6; i++) blk(shelfBooks, [.14 + i * .095, .04 + s * .42, .1], [.07, .26 + (i % 3) * .04, .2], M(bc[(i + s) % bc.length]));
  hot(shelfBooks, 'books');
  /* fairy lights along the right wall */
  for (let i = 0; i < 14; i++) {
    const z = .2 + i * .24, y = 2.05 - Math.sin(i * .9) * .06;
    ball(g, [W - .03, y, z], .022, new THREE.MeshStandardMaterial({ color: 0xffe0a8, emissive: 0xffc36b, emissiveIntensity: 2.2 }));
  }
  /* floor lamp in the corner */
  cyl(g, [.55, 0, 2.95], .12, .03, M(0xd8c9b0));
  cyl(g, [.55, .03, 2.95], .015, 1.45, M(0xd8c9b0));
  const fl = new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, .24, 24, 1, true), M(0xfff1d6, { emissive: 0xffc98a, emissiveIntensity: .9, side: THREE.DoubleSide }));
  fl.position.set(.55, 1.55, 2.95); g.add(fl);

  return { win, disc, screens: [scr] };
}

/* ---------------------------------------------------------------- the window: the other one's sky, right now */
function paintSky(t, kind0) {
  const c = HOMES[kind0], g = cur.win.sky.userData.canvas.getContext('2d'), w = 512, h = 486;
  const s = Sun ? Sun.height(c.lat, c.lng) : .5;
  const wk = wkind(weather[kind0] && weather[kind0].code);
  const day = smooth(-.1, .2, s), dusk = Math.max(0, 1 - Math.abs(s - .01) / .13);
  const grey = { overcast: .55, rain: .7, storm: .8, fog: .7, snow: .5, cloudy: .15, clear: 0 }[wk];
  const top = mixHex(0x0a1030, 0x4a92d6, day), bot = mixHex(0x1f2d5a, 0xcfe6f6, day);
  let gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (dusk > 0) {
    gr = g.createLinearGradient(0, h * .2, 0, h);
    gr.addColorStop(0, 'rgba(255,140,110,0)'); gr.addColorStop(.7, 'rgba(255,140,110,' + (.55 * dusk) + ')'); gr.addColorStop(1, 'rgba(255,196,140,' + (.75 * dusk) + ')');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  if (grey) { g.fillStyle = mixHex(0x1a1d26, 0x9aa3ad, day).replace('rgb', 'rgba').replace(')', ',' + grey + ')'); g.fillRect(0, 0, w, h); }
  const r = seeded(42);
  if (day < .5 && grey < .6) {
    for (let i = 0; i < 70; i++) { g.globalAlpha = (1 - day * 2) * (.3 + r() * .7) * (1 - grey); g.fillStyle = '#fff'; g.fillRect(r() * w, r() * h * .55, 1.6, 1.6); }
    g.globalAlpha = (1 - day * 2) * (1 - grey * .8);
    g.fillStyle = '#fbf4dc'; g.beginPath(); g.arc(w * .78, h * .16, 22, 0, 6.283); g.fill();
    g.fillStyle = top; g.beginPath(); g.arc(w * .78 + 9, h * .16 - 6, 20, 0, 6.283); g.fill();
    g.globalAlpha = 1;
  } else if (day >= .5 && grey < .4) {
    const sg = g.createRadialGradient(w * .22, h * .18, 0, w * .22, h * .18, 90);
    sg.addColorStop(0, 'rgba(255,250,230,.95)'); sg.addColorStop(.25, 'rgba(255,245,215,.6)'); sg.addColorStop(1, 'rgba(255,245,215,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
  }
  const nClouds = { clear: 2, cloudy: 6, overcast: 10, fog: 4, rain: 10, storm: 12, snow: 9 }[wk];
  const drift = (t / 1000 * 4) % (w + 200);
  for (let i = 0; i < nClouds; i++) {
    const cx = ((r() * (w + 200) + drift * (.5 + r() * .5)) % (w + 200)) - 100, cy = h * (.08 + r() * .38), sc = .6 + r() * .9;
    g.fillStyle = mixHex(0x2b3048, 0xffffff, day * (1 - grey * .4)).replace('rgb', 'rgba').replace(')', ',' + (.55 + grey * .3) + ')');
    for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + (k - 2) * 22 * sc, cy + Math.sin(k * 2.1) * 6 * sc, 30 * sc, 16 * sc, 0, 0, 6.283); g.fill(); }
  }
  skyline(g, w, h, kind0 === 'a' ? 'toronto' : 'manhattan', day, r);
  if (wk === 'rain' || wk === 'storm') {
    g.strokeStyle = 'rgba(210,225,245,.45)'; g.lineWidth = 1.3;
    const rr = seeded(Math.floor(t / 70));
    for (let i = 0; i < 90; i++) { const x = rr() * w, y = rr() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + 18); g.stroke(); }
  } else if (wk === 'snow') {
    g.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < 70; i++) {
      const sp = .5 + (i % 5) * .2, x = (i * 73.3 + Math.sin(t / 900 + i) * 12) % w, y = ((i * 37.7) + t / 1000 * 30 * sp) % h;
      g.beginPath(); g.arc(x, y, 1.6 + (i % 3) * .7, 0, 6.283); g.fill();
    }
  }
  cur.win.sky.needsUpdate = true;
  /* light that comes in through the window */
  const lc = new THREE.Color().setStyle(mixHex(0x7d93d6, 0xdbe9ff, day));
  if (dusk > .3) lc.lerp(new THREE.Color(0xffb07a), dusk * .5);
  winLight.color.copy(lc);
  winLight.intensity = (2 + day * 22) * (1 - grey * .45);
  return precip(wk);
}
const precip = (wk) => wk === 'rain' || wk === 'storm' || wk === 'snow';
function skyline(g, w, h, which, day, r) {
  const sil = mixHex(0x0b0f1f, 0x7c8798, day * .85), base = h * .98;
  const lit = day < .45;
  g.fillStyle = sil;
  const tower = (x, bw, bh) => {
    g.fillStyle = sil; g.fillRect(x, base - bh, bw, bh);
    if (lit) {
      g.fillStyle = 'rgba(255,214,140,.85)';
      for (let yy = base - bh + 6; yy < base - 4; yy += 9) for (let xx = x + 3; xx < x + bw - 3; xx += 7) if (r() < .32) g.fillRect(xx, yy, 2.5, 3.5);
    }
  };
  if (which === 'manhattan') {
    const water = h * .1;
    const bw0 = base - water;
    const hs = [60, 90, 70, 120, 85, 150, 95, 70, 110, 80, 60, 130, 90, 75, 65, 100, 70];
    let x = -6;
    const saved = base;
    hs.forEach((bh, i) => { const bw = 24 + (i % 4) * 6; tower(x, bw, bh + water); x += bw + 2; });
    /* the Empire State and One WTC spires */
    g.fillStyle = sil;
    g.fillRect(w * .36, saved - water - 210, 26, 210); g.fillRect(w * .36 + 6, saved - water - 240, 14, 30); g.fillRect(w * .36 + 11, saved - water - 280, 3, 40);
    g.beginPath(); g.moveTo(w * .7, saved - water); g.lineTo(w * .7 + 44, saved - water); g.lineTo(w * .7 + 30, saved - water - 250); g.lineTo(w * .7 + 14, saved - water - 250); g.closePath(); g.fill();
    g.fillRect(w * .7 + 21, saved - water - 300, 2.5, 50);
    const wg = g.createLinearGradient(0, bw0, 0, base);
    wg.addColorStop(0, mixHex(0x0c1430, 0x5d86b5, day)); wg.addColorStop(1, mixHex(0x070b1a, 0x3d6290, day));
    g.fillStyle = wg; g.fillRect(0, bw0, w, h - bw0);
    g.fillStyle = lit ? 'rgba(255,214,140,.35)' : 'rgba(255,255,255,.25)';
    for (let i = 0; i < 30; i++) g.fillRect(r() * w, bw0 + 4 + r() * (water - 6), 8 + r() * 18, 1.5);
  } else {
    const hs = [55, 80, 65, 100, 75, 120, 90, 60, 105, 70, 85, 60, 95, 70];
    let x = -4;
    hs.forEach((bh, i) => { const bw = 26 + (i % 3) * 7; tower(x, bw, bh); x += bw + 3; });
    /* Rogers Centre dome */
    g.fillStyle = sil; g.beginPath(); g.ellipse(w * .3, base, 60, 26, 0, Math.PI, 0); g.fill();
    /* the CN Tower */
    const cx = w * .62;
    g.beginPath(); g.moveTo(cx - 12, base); g.lineTo(cx - 4, base - 250); g.lineTo(cx + 4, base - 250); g.lineTo(cx + 12, base); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(cx, base - 255, 20, 11, 0, 0, 6.283); g.fill();
    g.fillRect(cx - 5, base - 330, 10, 70); g.beginPath(); g.ellipse(cx, base - 318, 8, 5, 0, 0, 6.283); g.fill();
    g.fillRect(cx - 1.5, base - 420, 3, 92);
    if (lit) { g.fillStyle = 'rgba(255,90,90,.9)'; g.beginPath(); g.arc(cx, base - 420, 2.5, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,214,140,.9)'; g.fillRect(cx - 18, base - 256, 36, 2); }
  }
}

/* ---------------------------------------------------------------- the screens: our countdown */
let countdown = null;
function nextMeet() {
  const evs = countdown && Array.isArray(countdown.events) ? countdown.events : [];
  const ev = evs.filter((e) => e.id === 'fly')[0] || null;
  if (!ev || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(ev.date || '')) return null;
  const p = ev.date.split('-').map(Number), tm = /^(\d{1,2}):(\d{2})/.exec(ev.time || '') || [0, 0, 0];
  const target = new Date(p[0], p[1] - 1, p[2], +tm[1], +tm[2]).getTime();
  const days = Math.ceil((target - Date.now()) / 864e5);
  return { name: String(ev.name || '见面').trim(), days, date: p[1] + '/' + p[2] };
}
function paintScreens() {
  if (!cur) return;
  const n = nextMeet();
  cur.screens.forEach((tex) => {
    const c = tex.userData.canvas, g = c.getContext('2d'), w = c.width, h = c.height;
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#2a2148'); gr.addColorStop(1, '#6b3b5e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.08)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (.1 + i * .17), h * (.2 + (i % 2) * .6), 40 + i * 6, 0, 6.283); g.fill(); }
    g.fillStyle = '#ffe6c7'; g.textAlign = 'center';
    g.font = '600 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    if (n && n.days > 0) {
      g.fillText(n.name + ' 还有', w / 2, h * .3);
      g.font = '700 120px "PingFang SC", sans-serif'; g.fillText(String(n.days), w / 2, h * .72);
      g.font = '500 26px "PingFang SC", sans-serif'; g.fillText('天 · ' + n.date, w / 2, h * .9);
    } else if (n && n.days > -1) {
      g.font = '700 70px "PingFang SC", sans-serif'; g.fillText('就是今天', w / 2, h * .58);
    } else {
      g.font = '700 80px "PingFang SC", sans-serif'; g.fillText('想你', w / 2, h * .6);
    }
    tex.needsUpdate = true;
  });
}

/* ---------------------------------------------------------------- the rooms */
let cur = null, roomGroup = null;
function build(w) {
  if (roomGroup) {
    scene.remove(roomGroup);
    roomGroup.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); } });
  }
  hotList.length = 0;
  roomGroup = new THREE.Group();
  scene.add(roomGroup);
  cur = (w === 'a' ? buildLogan : buildHer)(roomGroup);
  cur.who = w;
  winLight.position.set(cur.win.wx, 1.75, .35);
  winLight.target.position.set(cur.win.wx + .3, 0, 2.2);
  paintScreens();
  skyAt = 0;
  updateTexts();
}

let skyAt = 0, skyAnim = false;
function updateLights() {
  const h = HOMES[roomOf], s = Sun ? Sun.height(h.lat, h.lng) : .5, day = smooth(-.1, .2, s);
  hemi.intensity = (lightsOn ? .32 : .1) + day * .8;
  key.intensity = .25 + day * 1.35;
  key.color.setHex(day > .3 ? 0xfff0dc : 0x9fb0e0);
  lamp.intensity = lightsOn ? 8 + (1 - day) * 7 : 0;
  scene.environmentIntensity = (lightsOn ? .12 : .05) + day * .24;
  renderer.toneMappingExposure = 1.05;
  $('lights').setAttribute('aria-pressed', String(lightsOn));
}

/* ---------------------------------------------------------------- page text */
function updateTexts() {
  const h = HOMES[roomOf], o = other(roomOf);
  $('room-name').textContent = NAMES[roomOf] + ' 的小屋';
  $('kicker').textContent = 'A LITTLE HOME · ' + h.en.toUpperCase();
  const ww = weatherWord(roomOf);
  $('room-sub').textContent = h.city + ' · ' + clockIn(roomOf) + (ww ? ' · ' + ww : '');
  $('go-other').textContent = '去 ' + NAMES[o] + ' 的小屋 →';
  $('back').href = h.earth;
  document.title = NAMES[roomOf] + ' 的小屋';
  $('hint').textContent = '点窗户去 ' + NAMES[o] + ' 那儿 · 点 CD 机放歌 · 拖动转一转，双指或滚轮缩放';
  updatePresence();
}
function hotLabel(k) {
  const o = other(roomOf);
  if (k === 'window') { const ww = weatherWord(o); return '窗外是' + HOMES[o].city + ' · ' + clockIn(o) + (ww ? ' · ' + ww : '') + ' · 点一下过去'; }
  if (k === 'cd') return playing ? 'CD 机 · 正在放《' + playing.title + '》' : 'CD 机 · 放首歌';
  if (k === 'screen') return '屏幕 · 我们的倒计时';
  if (k === 'plush') return roomOf === 'a' ? '小兔子挂件' : '小熊';
  if (k === 'books') return '书 · 去读书角';
  if (k === 'photo') return '她的照片';
  if (k === 'bag') return '书包';
  if (k === 'slippers') return '粉色拖鞋 · 等她来穿';
  if (k === 'suitcase') return '行李箱 · 我们的倒计时';
  if (k === 'camera') return '相机 · 咔嚓';
  if (k === 'bed') return lightsOn ? '床 · 关灯睡觉' : '床 · 起床开灯';
  return '';
}

/* ---------------------------------------------------------------- pointing at things */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = $('tip');
let down = null, hoverKey = null;
function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(roomGroup ? roomGroup.children : [], true)[0];
  return hit && hit.object.userData.hot ? { key: hit.object.userData.hot.key, point: hit.point } : null;
}
function hideTip() { tip.hidden = true; hoverKey = null; stage.classList.remove('hot'); }
renderer.domElement.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY }; });
renderer.domElement.addEventListener('pointermove', (ev) => {
  if (busy || ev.pointerType === 'touch') return;
  if (down && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 4) { hideTip(); return; }
  const p = pick(ev);
  if (!p) { hideTip(); return; }
  hoverKey = p.key; stage.classList.add('hot');
  tip.textContent = hotLabel(p.key); tip.hidden = false;
  tip.style.left = ev.clientX + 'px'; tip.style.top = ev.clientY + 'px';
});
renderer.domElement.addEventListener('pointerleave', hideTip);
renderer.domElement.addEventListener('pointerup', (ev) => {
  const d = down; down = null;
  if (!d || busy || Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > 6) return;
  const p = pick(ev);
  if (p) act(p.key, p.point);
});
function act(k, at) {
  hideTip();
  if (k === 'window') goTo(other(roomOf));
  else if (k === 'cd') openMusic(true);
  else if (k === 'screen') showCountdownCard();
  else if (k === 'plush') { burst(at); toast(roomOf === me || !me ? '想你 💗' : '偷偷捏了一下 💗'); }
  else if (k === 'books') location.href = 'books.html?from=' + roomOf;
  else if (k === 'photo') showPhoto();
  else if (k === 'bag') { burst(at); toast('明天也要好好上学 🎒'); }
  else if (k === 'slippers') { burst(at); toast('给你准备好了 🩷'); }
  else if (k === 'suitcase') showCountdownCard();
  else if (k === 'camera') flash();
  else if (k === 'bed') { lightsOn = !lightsOn; updateLights(); toast(lightsOn ? '早安 ☀️' : '晚安 🌙'); }
}
function showPhoto() {
  const box = $('photo');
  box.hidden = false;
  $('photo-close').focus();
}
$('photo').addEventListener('click', (ev) => { if (ev.target === $('photo') || ev.target === $('photo-close')) $('photo').hidden = true; });
function flash() {
  const v = $('veil'); v.style.background = '#fff'; v.style.transition = 'none'; v.style.opacity = '.85';
  requestAnimationFrame(() => { v.style.transition = 'opacity .5s'; v.style.opacity = '0'; setTimeout(() => { v.style.transition = ''; }, 520); });
  toast('咔嚓 📸');
}
let toastT = 0;
function toast(text) {
  const t = $('toast'); t.textContent = text; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 1400);
}
function showCountdownCard() {
  const n = nextMeet(), card = $('card');
  card.textContent = '';
  const add = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; card.appendChild(e); return e; };
  add('p', 'kicker', 'OUR COUNTDOWN');
  if (n && n.days > 0) { add('h2', null, n.name); add('p', 'big', n.days + ' 天'); add('p', null, '到 ' + n.date + ' 就能见面了。'); }
  else add('h2', null, '我们的倒计时');
  const acts = add('div', 'acts');
  const a = document.createElement('a'); a.className = 'btn'; a.href = 'countdown.html'; a.textContent = '打开倒计时'; acts.appendChild(a);
  const b = document.createElement('button'); b.className = 'btn ghost'; b.type = 'button'; b.textContent = '关上'; b.onclick = () => { card.hidden = true; }; acts.appendChild(b);
  card.hidden = false; b.focus();
}
$('card').addEventListener('keydown', (ev) => { if (ev.key === 'Escape') $('card').hidden = true; });

/* ---------------------------------------------------------------- going through the window */
let busy = false;
function tween(ms, step, done) {
  if (reduced) { step(1); done(); return; }
  const t0 = performance.now();
  (function f(now) {
    const k = clamp((now - t0) / ms, 0, 1);
    step(ease(k));
    if (k < 1) requestAnimationFrame(f); else done();
  })(t0);
}
function goTo(w) {
  if (busy || w === roomOf) return;
  busy = true; hideTip(); $('card').hidden = true;
  const veil = $('veil');
  const s = Sun ? Sun.height(HOMES[w].lat, HOMES[w].lng) : .5;
  veil.style.background = mixHex(0x16204a, 0xd5e8f8, smooth(-.1, .2, s));
  const off = camera.position.clone().sub(controls.target);
  const t0 = controls.target.clone(), z0 = camera.zoom, aim = cur.win.center.clone();
  controls.enabled = false;
  tween(750, (k) => {
    controls.target.lerpVectors(t0, aim, k);
    camera.position.copy(controls.target).add(off);
    camera.zoom = z0 + (3.6 - z0) * k; camera.updateProjectionMatrix();
    veil.style.opacity = String(clamp((k - .5) / .5, 0, 1));
  }, () => {
    roomOf = w;
    history.replaceState(null, '', '#' + w);
    build(w); updateLights();
    const from = cur.win.center.clone();
    controls.target.copy(from); camera.position.copy(from).add(off);
    tween(950, (k) => {
      controls.target.lerpVectors(from, CENTER, k);
      camera.position.copy(controls.target).add(off);
      camera.zoom = 3.6 + (1 - 3.6) * k; camera.updateProjectionMatrix();
      veil.style.opacity = String(1 - k);
    }, () => { busy = false; controls.enabled = true; beat(); });
  });
}
$('go-other').addEventListener('click', () => goTo(other(roomOf)));
$('lights').addEventListener('click', () => { lightsOn = !lightsOn; updateLights(); });
addEventListener('hashchange', () => { const w = fromHash(); if (w && w !== roomOf) goTo(w); });

/* ================================================================ music: our CD player */
const db = (() => {
  try {
    const cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (!cfg || !cfg.projectId || !fb) return null;
    if (!fb.apps.length) fb.initializeApp(cfg);
    return fb.firestore();
  } catch (e) { return null; }
})();
let music = { songs: [], now: null }, playing = null;
const SRC = { 163: '网易云', spotify: 'Spotify', apple: 'Apple', youtube: 'YouTube', link: '链接' };
function parseSong(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const title = ((/《([^》]+)》/.exec(t) || [])[1] || '').trim();
  const url = (t.match(/https?:\/\/[^\s"'<>，。）)]+/) || [t])[0];
  let m;
  if (/163\.com|163cn\.tv|126\.net/.test(url)) {
    m = /(song|playlist|album)\?(?:[^#]*&)?id=(\d+)/.exec(url) || /\/(song|playlist|album)\/(\d+)/.exec(url);
    if (m) return { src: '163', kind: m[1], ref: m[2], title };
    return { src: 'link', kind: '163', ref: url, title };
  }
  if (/^\d{5,12}$/.test(t)) return { src: '163', kind: 'song', ref: t, title };
  m = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/.exec(url) || /spotify:(track|album|playlist):([A-Za-z0-9]+)/.exec(t);
  if (m) return { src: 'spotify', kind: m[1], ref: m[2], title };
  if (/music\.apple\.com\//.test(url)) return { src: 'apple', kind: /[?&]i=\d+|\/song\//.test(url) ? 'song' : 'list', ref: url.replace('://music.apple.com', '://embed.music.apple.com'), title: title || decodeURIComponent((/\/(?:album|song|playlist)\/([^/?]+)/.exec(url) || [])[1] || '').replace(/-/g, ' ') };
  m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/.exec(url);
  if (m && /youtu/.test(url)) return { src: 'youtube', kind: 'video', ref: m[1], title };
  if (/^https?:\/\//.test(url)) return { src: 'link', kind: 'web', ref: url, title };
  return null;
}
function embedOf(s) {
  if (s.src === '163') { const ty = s.kind === 'playlist' ? 0 : s.kind === 'album' ? 1 : 2; return { url: 'https://music.163.com/outchain/player?type=' + ty + '&id=' + s.ref + '&auto=1&height=' + (ty === 2 ? 66 : 430), h: ty === 2 ? 86 : 450 }; }
  if (s.src === 'spotify') return { url: 'https://open.spotify.com/embed/' + s.kind + '/' + s.ref + '?utm_source=generator', h: s.kind === 'track' || s.kind === 'episode' ? 152 : 352 };
  if (s.src === 'apple') return { url: s.ref, h: s.kind === 'song' ? 175 : 450 };
  if (s.src === 'youtube') return { url: 'https://www.youtube-nocookie.com/embed/' + s.ref + '?autoplay=1', h: 220 };
  return null;
}
function songUrl(s) {
  if (s.src === '163') return 'https://music.163.com/#/' + s.kind + '?id=' + s.ref;
  if (s.src === 'spotify') return 'https://open.spotify.com/' + s.kind + '/' + s.ref;
  if (s.src === 'apple') return s.ref.replace('://embed.music.apple.com', '://music.apple.com');
  if (s.src === 'youtube') return 'https://www.youtube.com/watch?v=' + s.ref;
  return s.ref;
}
function lookupTitle(s) {
  let u = null;
  if (s.src === 'spotify') u = 'https://open.spotify.com/oembed?url=' + encodeURIComponent(songUrl(s));
  else if (s.src === 'youtube') u = 'https://noembed.com/embed?url=' + encodeURIComponent(songUrl(s));
  if (!u) return Promise.resolve('');
  return fetch(u).then((r) => r.json()).then((j) => (j && j.title) || '').catch(() => '');
}
function saveMusic() {
  if (!db) { renderSongs(); return Promise.resolve(); }
  return db.collection('places').doc('_music').set({ state: JSON.stringify(music) }).catch(() => { $('add-msg').textContent = '没存上，再试一次'; });
}
function renderSongs() {
  const ol = $('songs'); ol.textContent = '';
  $('song-n').textContent = music.songs.length ? '· ' + music.songs.length + ' 首' : '';
  if (!music.songs.length) { const li = document.createElement('li'); li.className = 'none'; li.textContent = '歌单还是空的，放第一首吧。'; ol.appendChild(li); }
  music.songs.slice().reverse().forEach((s) => {
    const li = document.createElement('li');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'song';
    b.setAttribute('aria-current', String(!!(playing && playing.id === s.id)));
    const src = document.createElement('span'); src.className = 'src'; src.textContent = SRC[s.src] || '链接';
    const tt = document.createElement('b'); tt.textContent = s.title || '未命名的歌';
    const by = document.createElement('small'); by.textContent = (NAMES[s.by] || '') + (s.by ? ' 放的' : '');
    b.append(src, tt, by);
    b.onclick = () => play(s, true);
    const x = document.createElement('button'); x.type = 'button'; x.className = 'del'; x.setAttribute('aria-label', '从歌单删掉《' + (s.title || '这首') + '》'); x.textContent = '×';
    x.onclick = () => { music.songs = music.songs.filter((y) => y.id !== s.id); if (playing && playing.id === s.id) stop(); saveMusic(); renderSongs(); };
    li.append(b, x); ol.appendChild(li);
  });
  const nb = $('now-by');
  if (music.now && music.now.by && music.now.by !== me && Date.now() - music.now.at < 6 * 3600e3) {
    const s = music.songs.filter((y) => y.id === music.now.id)[0];
    nb.textContent = s ? NAMES[music.now.by] + ' 刚刚放了《' + (s.title || '一首歌') + '》' : '';
  } else nb.textContent = '';
}
function play(s, share) {
  const box = $('player'); box.textContent = '';
  const e = embedOf(s);
  if (e) {
    const f = document.createElement('iframe');
    f.src = e.url; f.height = e.h; f.title = s.title || '正在播放';
    f.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
    f.loading = 'eager';
    box.appendChild(f);
  } else {
    const d = document.createElement('div'); d.className = 'ext';
    const p = document.createElement('p'); p.textContent = '这个链接没法在这里直接放，点下面去' + (s.kind === '163' ? '网易云' : '那边') + '听。';
    const a = document.createElement('a'); a.className = 'btn'; a.href = songUrl(s); a.target = '_blank'; a.rel = 'noopener'; a.textContent = '打开《' + (s.title || '这首歌') + '》';
    d.append(p, a); box.appendChild(d);
  }
  playing = s;
  $('music').classList.add('playing');
  $('mini').hidden = false; $('mini-open').textContent = '♪ ' + (s.title || '正在放歌');
  if (share && me) { music.now = { id: s.id, by: me, at: Date.now() }; saveMusic(); }
  renderSongs();
}
function stop() {
  playing = null; $('player').textContent = '';
  const p = document.createElement('p'); p.className = 'empty'; p.textContent = '停了。从下面选一首，或者贴一个链接进来。'; $('player').appendChild(p);
  $('music').classList.remove('playing'); $('mini').hidden = true; renderSongs();
}
function openMusic(on) {
  $('music').classList.toggle('open', on);
  $('music').setAttribute('aria-hidden', String(!on));
  if (on) setTimeout(() => $('song-url').focus({ preventScroll: true }), 50);
}
$('music-close').addEventListener('click', () => openMusic(false));
$('mini-open').addEventListener('click', () => openMusic(true));
$('mini-stop').addEventListener('click', stop);
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { openMusic(false); $('card').hidden = true; $('photo').hidden = true; } });
$('add-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const msg = $('add-msg'), s = parseSong($('song-url').value);
  if (!s) { msg.textContent = '没认出来这个链接，复制分享链接再贴一次试试。'; return; }
  s.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  s.title = $('song-title').value.trim() || s.title || '';
  s.by = me || ''; s.at = Date.now();
  music.songs.push(s);
  if (music.songs.length > 200) music.songs = music.songs.slice(-200);
  $('song-url').value = ''; $('song-title').value = '';
  msg.textContent = s.src === 'link' && s.kind === '163' ? '加好了。网易云的短链接这里放不了，点开会去网易云听。' : '加好了，正在放。';
  play(s, true);
  if (!s.title) lookupTitle(s).then((t) => {
    const live = music.songs.filter((y) => y.id === s.id)[0];
    if (!t || !live) return;
    live.title = s.title = t;
    if (playing && playing.id === s.id) { playing.title = t; $('mini-open').textContent = '♪ ' + t; }
    saveMusic(); renderSongs();
  });
});
$('search-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const q = $('song-q').value.trim(); if (!q) { $('song-q').focus(); return; }
  open('https://music.163.com/#/search/m/?s=' + encodeURIComponent(q) + '&type=1', '_blank', 'noopener');
});
$('search-sp').addEventListener('click', () => {
  const q = $('song-q').value.trim(); if (!q) { $('song-q').focus(); return; }
  open('https://open.spotify.com/search/' + encodeURIComponent(q), '_blank', 'noopener');
});

/* ================================================================ who is home right now */
let rooms = {};
function updatePresence() {
  const o = other(me || roomOf), x = rooms[o], el = $('presence');
  if (!me || !x || Date.now() - x.at > 75000) { el.hidden = true; return; }
  el.hidden = false;
  el.textContent = x.room === roomOf ? NAMES[o] + ' 也在这间小屋里 👀' : x.room === o ? NAMES[o] + ' 现在在自己的小屋里' : NAMES[o] + ' 在你的小屋里 👀';
}
function beat() {
  if (!db || !me || document.hidden) return;
  db.collection('places').doc('_rooms').set({ [me]: { at: Date.now(), room: roomOf } }, { merge: true }).catch(() => {});
}

/* ================================================================ start */
build(roomOf);
updateLights();
renderSongs();
history.replaceState(null, '', '#' + roomOf);
Promise.all([loadWeather('a'), loadWeather('b')]).then(() => { skyAt = 0; updateTexts(); });
setInterval(() => { loadWeather('a'); loadWeather('b'); }, 15 * 60e3);
setInterval(() => { updateTexts(); updateLights(); paintScreens(); }, 30e3);
if (db) {
  db.collection('places').doc('_people').onSnapshot((d) => {
    const p = d.exists ? d.data() : null;
    if (p) { NAMES = { a: p.a || 'Logan', b: p.b || '茄子萌' }; updateTexts(); renderSongs(); }
  }, () => {});
  db.collection('pages').doc((window.QZ_FIREBASE && window.QZ_FIREBASE.pageId) || 'xiaoqiezi').onSnapshot((d) => {
    try { countdown = JSON.parse(d.data().state); paintScreens(); } catch (e) { /* keep what we have */ }
  }, () => {});
  db.collection('places').doc('_music').onSnapshot((d) => {
    if (d.metadata && d.metadata.hasPendingWrites) return;
    try { const x = JSON.parse(d.data().state); music = { songs: Array.isArray(x.songs) ? x.songs : [], now: x.now || null }; } catch (e) { /* empty list */ }
    renderSongs();
  }, () => {});
  db.collection('places').doc('_rooms').onSnapshot((d) => { rooms = (d.exists && d.data()) || {}; updatePresence(); }, () => {});
  beat(); setInterval(beat, 25e3);
  document.addEventListener('visibilitychange', beat);
}

let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (document.hidden) return;
  controls.update();
  const t = controls.target;
  t.set(clamp(t.x, .3, W - .3), clamp(t.y, .2, 1.9), clamp(t.z, .3, D - .3));
  if (!skyAt || now - skyAt > (skyAnim ? 80 : 60000)) { skyAnim = paintSky(now, other(roomOf)); skyAt = now; }
  if (cur && cur.disc && playing) cur.disc.rotation.y += dt * 9;
  for (let i = hearts.length - 1; i >= 0; i--) {
    const s = hearts[i]; s.userData.t += dt;
    s.position.addScaledVector(s.userData.v, dt); s.userData.v.y -= dt * .25;
    s.material.opacity = 1 - s.userData.t / 1.3;
    if (s.userData.t > 1.3) { scene.remove(s); s.material.dispose(); hearts.splice(i, 1); }
  }
  renderer.render(scene, camera);
});
