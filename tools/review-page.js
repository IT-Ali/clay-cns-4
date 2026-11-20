// tools/review-page.js: injected into index.html by tools/storyboard.mjs (review only, never in the video).
// Every panel reads the SAME shots, states and solved contacts as the animation (window.CNS4_WORLD); the review panels
// only add a camera for a close look and a 2D overlay with arrows and gap numbers.
(function () {
  const W = window.CNS4_WORLD, THREE = window.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z), C4 = W.C4;
  const proj = (p, w, h) => { const v = p.clone().project(W.S.camera); return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h, v.z]; };
  const mm = (g) => (g * 100).toFixed(1) + ' mm';
  const label = (ctx, x, y, text, o = {}) => {
    const k = ctx.canvas.width / 960; ctx.save(); ctx.font = `600 ${(o.size || 15) * k}px "Fredoka", sans-serif`;
    const tw = ctx.measureText(text).width, pad = 6 * k, bh = (o.size || 15) * 1.5 * k;
    ctx.fillStyle = o.bg || 'rgba(255,248,232,0.93)'; ctx.strokeStyle = o.ink || '#b3261e'; ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.roundRect(x - tw / 2 - pad, y - bh / 2, tw + 2 * pad, bh, 6 * k); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.ink || '#b3261e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1 * k); ctx.restore();
  };
  const arrow = (ctx, x0, y0, x1, y1, col = '#b3261e') => {
    const k = ctx.canvas.width / 960; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2 * k;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0), L = 10 * k; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - L * Math.cos(a - 0.4), y1 - L * Math.sin(a - 0.4)); ctx.lineTo(x1 - L * Math.cos(a + 0.4), y1 - L * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x1, y1, 3.2 * k, 0, 7); ctx.fill(); ctx.restore();
  };
  const title = (ctx, text) => { const k = ctx.canvas.width / 960; label(ctx, ctx.canvas.width / 2, ctx.canvas.height - 22 * k, text, { size: 16, ink: '#26336b' }); };
  // contact callouts: each solved contact (filtered) gets a leader arrow from a label to the closest point
  const callouts = (filter, labels) => (ctx, t, w, h) => {
    const list = W.CONTACTS.filter(filter); const k = w / 960;
    list.forEach((c, i) => {
      if (!c.on) return; const [x, y] = proj(c.on, w, h);
      const ang = (labels && labels[i] && labels[i].ang != null) ? labels[i].ang : -2.4 + i * (4.8 / Math.max(1, list.length - 1)) * 0.55;
      const r = (labels && labels[i] && labels[i].r) || 95 * k, lx = x + Math.cos(ang) * r, ly = y + Math.sin(ang) * r;
      arrow(ctx, lx, ly, x, y);
      label(ctx, lx, ly, (c.part || (labels && labels[i] && labels[i].name) || 'contact') + ': ' + mm(c.gap), { size: 13 });
    });
  };
  const cams = () => {
    const mR = W.mastoid.R.p, f = W.fore.p, P = W.P, lips = P.anchor('lips');
    const HZ = V(0, 0, 1).transformDirection(W.head.matrixWorld), HY = V(0, 1, 0).transformDirection(W.head.matrixWorld);
    const at = (c, dirs, d, tgt, ap) => { const v = V(0, 0, 0); for (const [a, s] of dirs) v.addScaledVector(a, s); return { pos: c.clone().addScaledVector(v.normalize(), d).toArray(), target: (tgt || c).toArray(), fov: 28, focus: c.toArray(), aperture: ap == null ? 0.002 : ap }; };
    const Z = V(0, 0, 1), UP = V(0, 1, 0), neck = P.torso.localToWorld(V(0, 5.4, 0.5));
    return {
      plan: { pos: [1.0, 36.5, 0.01], target: [1.0, 6, 0], up: [0, 0, -1], fov: 28, focus: [1, 9, 0], aperture: 0 },
      mastR: at(mR, [[Z, 0.6], [HZ, 0.75], [HY, -0.25]], 3.8, mR.clone().addScaledVector(Z, 0.15)),
      scmL: at(P.torso.localToWorld(V(0.42, 5.9, 0.1)), [[Z, -0.92], [HZ, 0.38]], 4.4, P.torso.localToWorld(V(0.42, 5.9, 0.1)), 0.004),
      scmR: at(P.torso.localToWorld(V(-0.42, 5.9, 0.1)), [[Z, 0.92], [HZ, 0.38]], 4.4, P.torso.localToWorld(V(-0.42, 5.9, 0.1)), 0.004),
      airR: at(W.canal.R.p, [[Z, 0.88], [HZ, 0.42], [HY, 0.1]], 4.4, W.canal.R.p.clone().addScaledVector(Z, 0.3).addScaledVector(HY, 0.1)),
      fore: at(f, [[HZ, 0.8], [Z, -0.55], [HY, 0.15]], 3.6, f.clone().addScaledVector(HY, -0.1)),
      mouth: at(lips, [[HZ, 1], [HY, -0.2], [Z, -0.05]], 2.0, lips.clone().addScaledVector(HZ, -0.2), 0.0015),
      shrug: at(neck, [[HZ, 0.5], [UP, 0.85], [Z, 0.05]], 8.5, neck, 0.006),
      jawR: at(W.P.anchor('lips'), [[HZ, 0.75], [Z, 0.6], [HY, 0.0]], 4.2, lips.clone().addScaledVector(Z, 0.35).addScaledVector(HY, -0.2), 0.004),
      cheekR: at(lips, [[HZ, 0.8], [Z, 0.6], [HY, 0.15]], 3.6, lips.clone().addScaledVector(Z, 0.3), 0.003),
      cheekL: at(lips, [[HZ, 0.8], [Z, -0.6], [HY, 0.15]], 3.6, lips.clone().addScaledVector(Z, -0.3), 0.003),
      neckSide: at(neck.clone().addScaledVector(HY, 0.35), [[Z, 0.55], [HZ, 0.78], [HY, -0.3]], 5.2, neck.clone().addScaledVector(HY, 0.4).addScaledVector(HZ, 0.15), 0.004),
      airL: at(W.canal.L.p, [[Z, -0.85], [HZ, 0.45], [HY, 0.15]], 3.8, W.canal.L.p.clone().addScaledVector(Z, -0.28).addScaledVector(HY, 0.1)),
    };
  };
  const PANELS = {
    'a-plan': { t: 0.5, cam: 'plan', draw: (ctx, t, w, h) => {
      const P = W.P, head = P.head.localToWorld(V(0, 0, 0)), k = w / 960;
      const p = (v) => proj(v, w, h);
      let [x, y] = p(head); label(ctx, x, y - 40 * k, 'HEAD (screen left)', { ink: '#26336b' });
      [x, y] = p(P.legPoint('R', 'toeTip')); label(ctx, x + 10 * k, y + 60 * k, 'FEET (screen right)', { ink: '#26336b' });
      [x, y] = p(P.shoulder('R')); arrow(ctx, x + 60 * k, y + 60 * k, x, y); label(ctx, x + 60 * k, y + 72 * k, "his RIGHT shoulder (+Z, nearest the camera)");
      [x, y] = p(P.shoulder('L')); arrow(ctx, x + 60 * k, y - 60 * k, x, y); label(ctx, x + 60 * k, y - 72 * k, 'his LEFT shoulder');
      [x, y] = p(W.table.glass.position); label(ctx, x, y - 30 * k, 'bedside table + glass (his LEFT, near the head)', { ink: '#26336b' });
      [x, y] = p(W.EX.R.hand.group.position); label(ctx, x, y + 40 * k, "examiner's gloved hands: on HIS RIGHT side", { ink: '#26336b' });
      title(ctx, 'Plan from above: his RIGHT = toward the camera = bottom here; his LEFT = far side, with the table');
    } },
    'b-mastR': { t: 10.0, cam: 'mastR', draw: (ctx, t, w, h) => { callouts((c) => /Rinne R/.test(c.name), [{ name: 'foot of the stem on the R mastoid', ang: -2.3, r: 150 }])(ctx, t, w, h); title(ctx, 'Rinne, right: the foot of the stem on the mastoid, the hand on the stem behind and below the ear'); } },
    'b-airR': { t: 12.4, cam: 'airR', draw: (ctx, t, w, h) => { airDraw(ctx, w, h, 'R'); title(ctx, 'Rinne, right: the vibrating prongs about 2 cm from the opening of the ear canal, in line with it'); } },
    'b-airL2': { t: 17.0, cam: 'airL', draw: (ctx, t, w, h) => { airDraw(ctx, w, h, 'L'); title(ctx, 'Rinne, left: looking at the ear, the prongs 2 cm from the canal opening, in line with it, the hand clear'); } },
    'b-fore': { t: 22.4, cam: 'fore', draw: (ctx, t, w, h) => { callouts((c) => /Weber/.test(c.name), [{ name: 'foot on the middle of the forehead', ang: -2.6, r: 150 }])(ctx, t, w, h); title(ctx, 'Weber: the foot of the stem on the middle of the forehead'); } },
    'c-rest': { t: 30.6, cam: 'mouth', draw: (ctx, t, w, h) => { title(ctx, "Inside the mouth, open, before 'Ah': soft palate and uvula at rest, in the midline"); midline(ctx, w, h); } },
    'c-risen': { t: 33.5, cam: 'mouth', draw: (ctx, t, w, h) => { title(ctx, "'Ah': the soft palate rises equally on both sides, the uvula stays in the midline"); midline(ctx, w, h); } },
    'd-shrug': { t: 56.0, cam: 'shrug', draw: (ctx, t, w, h) => { callouts((c) => /Shrug up/.test(c.name) && /palm|index|little/.test(c.name), [])(ctx, t, w, h); title(ctx, 'Shrug: both palms flat on the tops of the shoulders (gaps: palm and fingers to the skin)'); } },
    'd-jaw': { t: 63.6, cam: 'turn', draw: (ctx, t, w, h) => { callouts((c) => /Head turn: examiner R/.test(c.name), [])(ctx, t, w, h); scm(ctx, w, h, 'L'); title(ctx, 'Turning RIGHT against the palm on the right of the chin: the LEFT sternocleidomastoid stands out'); } },
    'd-jawL': { t: 67.2, cam: 'turn', draw: (ctx, t, w, h) => { callouts((c) => /Head turn: examiner L/.test(c.name), [])(ctx, t, w, h); scm(ctx, w, h, 'R'); title(ctx, 'Turning LEFT against the palm on the left of the chin: the RIGHT sternocleidomastoid stands out'); } },
    'e-out': { t: 79.0, cam: 'tongueOut', draw: (ctx, t, w, h) => { title(ctx, 'Tongue out, from the front: the tip on the midline (nose to chin)'); noseChin(ctx, w, h); } },
    'e-cheekR': { t: 84.6, cam: 'cheekR', draw: (ctx, t, w, h) => { callouts((c) => /Cheek R: pad/.test(c.name), [{ name: 'index pad on the bulge', ang: -0.5, r: 150 }])(ctx, t, w, h); title(ctx, "Tongue in the RIGHT cheek: the examiner's index pad on the bulge"); } },
    'e-cheekL': { t: 87.1, cam: 'cheekL', draw: (ctx, t, w, h) => { callouts((c) => /Cheek L: pad/.test(c.name), [{ name: 'index pad on the bulge', ang: -2.6, r: 150 }])(ctx, t, w, h); title(ctx, "Tongue in the LEFT cheek: the examiner's index pad on the bulge"); } },
    'f-before': { t: 46.35, cam: 'neckSide', draw: (ctx, t, w, h) => { larynx(ctx, w, h, 0); title(ctx, 'From his right front, a little low (his left arm holds the glass): the front of the neck, chin to sternal notch, the larynx at rest'); } },
    'f-during': { t: 46.85, cam: 'neckSide', draw: (ctx, t, w, h) => { larynx(ctx, w, h, 1); title(ctx, 'During the swallow: the larynx rises about 2 cm, then falls back'); } },
  };
  function midline(ctx, w, h) {
    const P = W.P, lips = P.anchor('lips'), HY = V(0, 1, 0).transformDirection(W.head.matrixWorld), k = w / 960;
    const a = proj(lips.clone().addScaledVector(HY, 0.45), w, h), b = proj(lips.clone().addScaledVector(HY, -0.5), w, h);
    ctx.save(); ctx.setLineDash([7 * k, 6 * k]); ctx.strokeStyle = 'rgba(27,107,47,0.9)'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
    label(ctx, a[0] + 50 * k, a[1] + 10 * k, 'midline', { ink: '#1b6b2f', size: 13 });
  }
  function airDraw(ctx, w, h, side) {
    const c = W.canal[side], pr = []; W.fork.group.traverse((m) => { if (m.isMesh && m.parent !== W.fork.group) pr.push(m); });
    const S = C4.surface(pr, c.p, 1.0), d = C4.dist(c.p, S, 1.0), k = w / 960;
    const [x0, y0] = proj(c.p, w, h), [x1, y1] = proj(d.q, w, h); arrow(ctx, x0, y0, x1, y1, '#1b6b2f');
    const e = proj(c.p.clone().addScaledVector(c.out, 0.6), w, h);
    ctx.save(); ctx.setLineDash([6 * k, 5 * k]); ctx.strokeStyle = '#1b6b2f'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.restore();
    label(ctx, x0 + 10 * k, y0 + 70 * k, 'canal opening -> near prong: ' + (Math.abs(d.d) * 10).toFixed(1) + ' cm', { ink: '#1b6b2f', size: 13 });
    label(ctx, e[0], e[1] - 40 * k, 'canal axis: both prongs in line with it', { ink: '#1b6b2f', size: 13 });
  }
  function noseChin(ctx, w, h) {
    const N = window.NEURO.points(W.P), a = proj(N.noseTip, w, h), b = proj(N.chin, w, h), k = w / 960;
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    ctx.save(); ctx.strokeStyle = 'rgba(27,107,47,0.95)'; ctx.lineWidth = 1.3 * k; ctx.beginPath(); ctx.moveTo(a[0] - ux * 60 * k, a[1] - uy * 60 * k); ctx.lineTo(b[0] + ux * 40 * k, b[1] + uy * 40 * k); ctx.stroke(); ctx.restore();
    label(ctx, a[0] + 90 * k, a[1] - 30 * k, 'midline: nose tip to chin', { ink: '#1b6b2f', size: 13 });
  }
  function scm(ctx, w, h, side) {
    const P = W.P, k = w / 960, sx = side === 'L' ? 1 : -1, off = (side === 'L' ? -130 : 130) * k;
    const p = P.torso.localToWorld(V(sx * 0.3, 5.75, 0.45)), [x, y] = proj(p, w, h);
    arrow(ctx, x + off, y + 60 * k, x, y, '#1b6b2f');
    label(ctx, x + off, y + 72 * k, (side === 'L' ? 'his LEFT' : 'his RIGHT') + ' sternocleidomastoid', { ink: '#1b6b2f', size: 13 });
  }
  function larynx(ctx, w, h, up) {
    const p = W.M4.larynx(), k = w / 960; if (!p) return;
    const [x, y] = proj(p, w, h); arrow(ctx, x - 150 * k, y + 40 * k, x, y, '#1b6b2f'); label(ctx, x - 150 * k, y + 52 * k, up ? 'larynx risen (about 2 cm)' : 'larynx (laryngeal prominence) at rest', { ink: '#1b6b2f' });
  }
  // the skin on top of each shoulder (the trapezius ridge), found by a ray straight down the trunk
  const shoulderTops = () => { const P = W.P, rc = new THREE.Raycaster(), out = {}; P.torso.updateMatrixWorld(true); const down = V(0, -1, 0).transformDirection(P.torso.matrixWorld);
    for (const [s, x] of [['R', -1.05], ['L', 1.05]]) { rc.set(P.torso.localToWorld(V(x, 7.5, 0.3)), down); const h = rc.intersectObject(P.torsoMesh, false)[0]; out[s] = h ? h.point.clone() : V(0, 0, 0); } return out; };
  // before/after pairs: the same camera, two moments, each a 2x crop around a point, side by side
  const PAIRS = {
    'd-shrug2': { cam: 'shrugLevel', zoom: 1.7, measure: true, focus: () => W.P.torso.localToWorld(V(0, 5.25, 0.4)), a: { t: 54.4, label: 'rest: palms on the shoulder tops' }, b: { t: 56.0, label: 'shrugged: shoulders up about 3 cm' }, title: 'Shrug against the hands: both shoulders rise equally under the palms' },
    'd-scmR': { cam: 'scmL', zoom: 1.3, focus: () => W.P.torso.localToWorld(V(0.42, 5.9, 0.1)), a: { t: 61.0, label: 'head straight' }, b: { t: 63.6, label: 'turning RIGHT: his LEFT SCM stands out' }, title: 'His LEFT sternocleidomastoid, seen from his left side (1.3x): rest vs turning right against the hand' },
    'd-scmL': { cam: 'scmR', zoom: 1.3, focus: () => W.P.torso.localToWorld(V(-0.42, 5.9, 0.1)), a: { t: 61.0, label: 'head straight' }, b: { t: 67.2, label: 'turning LEFT: his RIGHT SCM stands out' }, title: 'His RIGHT sternocleidomastoid, seen from his right side (1.3x): rest vs turning left against the hand' },
    'e-bulgeR': { cam: 'cheekR', zoom: 2, hide: true, focus: () => W.M4.bulge('R').p, a: { t: 82.5, label: 'tongue at rest' }, b: { t: 84.6, label: 'tongue in the RIGHT cheek' }, title: "Right cheek (2x, the examiner's hand hidden): the round bulge between the mouth corner and the ear" },
    'e-bulgeL': { cam: 'cheekL', zoom: 2, hide: true, focus: () => W.M4.bulge('L').p, a: { t: 82.5, label: 'tongue at rest' }, b: { t: 87.1, label: 'tongue in the LEFT cheek' }, title: "Left cheek (2x, the examiner's hand hidden): the round bulge between the mouth corner and the ear" },
  };
  window.REVIEW = {
    names: Object.keys(PANELS),
    panel(name) {
      const p = PANELS[name], C = Object.assign({}, W.CAM, cams());
      window.CAM_OVERRIDE = C[p.cam] || null; window.REVIEW_OVERLAY = p.draw; return p.t;
    },
    beat() { window.CAM_OVERRIDE = null; window.REVIEW_OVERLAY = null; },
    async pair(name) {
      const p = PAIRS[name], C = Object.assign({}, W.CAM, cams()), cv = document.getElementById('c'), Wd = cv.width, Hd = cv.height;
      window.CAPTIONS = false; window.REVIEW_OVERLAY = null; window.CAM_OVERRIDE = C[p.cam];
      const out = document.createElement('canvas'); out.width = Wd; out.height = Hd; const o = out.getContext('2d'), k = Wd / 960;
      for (const [i, st] of [p.a, p.b].entries()) {
        if (p.hide) { W.EX.R.group.visible = false; W.EX.L.group.visible = false; }
        window.seek(st.t);
        const [x, y] = proj(p.focus(), Wd, Hd), cw = Wd / 2 / p.zoom, ch = Hd / p.zoom; (p.crop = p.crop || [])[i] = [x - cw / 2, y - ch / 2, (Wd / 2) / cw];
        o.drawImage(cv, x - cw / 2, y - ch / 2, cw, ch, i * Wd / 2, 0, Wd / 2, Hd);
        W.EX.R.group.visible = true; W.EX.L.group.visible = true;
        if (p.measure) { (p.pts = p.pts || []).push(shoulderTops()); }
        label(o, i * Wd / 2 + Wd / 4, 26 * k, st.label, { ink: '#26336b', size: 14 });
      }
      o.fillStyle = '#f8eedb'; o.fillRect(Wd / 2 - 2 * k, 0, 4 * k, Hd);
      if (p.measure && p.pts.length === 2) {
        const up = V(0, 1, 0).transformDirection(W.P.torso.matrixWorld), r = ['R', 'L'].map((s) => (p.pts[1][s].clone().sub(p.pts[0][s]).dot(up) * 10).toFixed(1));
        // reference lines through the shoulder tops: at rest (dashed) in both halves, shrugged (solid) on the right
        const line = (i, a, b, dash, col) => { const [cx, cy, sc] = p.crop[i], A = proj(a, Wd, Hd), B = proj(b, Wd, Hd), X = (q) => i * Wd / 2 + (q[0] - cx) * sc, Y = (q) => (q[1] - cy) * sc;
          o.save(); o.beginPath(); o.rect(i * Wd / 2, 0, Wd / 2, Hd); o.clip(); o.setLineDash(dash ? [9 * k, 7 * k] : []); o.strokeStyle = col; o.lineWidth = 2.2 * k; o.beginPath(); o.moveTo(X(A), Y(A)); o.lineTo(X(B), Y(B)); o.stroke(); o.restore(); };
        for (const i of [0, 1]) line(i, p.pts[0].R, p.pts[0].L, true, '#f8eedb');
        line(1, p.pts[1].R, p.pts[1].L, false, '#1b6b2f');
        label(o, Wd / 2, Hd - 64 * k, 'measured rise of the shoulder tops toward the ears: right ' + r[0] + ' cm, left ' + r[1] + ' cm (dashed: at rest; green: shrugged)', { ink: '#1b6b2f', size: 14 });
        p.pts = [];
      }
      title(o, p.title); window.CAM_OVERRIDE = null;
      return out.toDataURL('image/jpeg', 0.9);
    },
    pairs: Object.keys(PAIRS),
    report() { return W.CONTACTS.map((c) => ({ name: c.name, gapMM: +(c.gap * 100).toFixed(2), clearance: !!c.clearance })); },
  };
})();
