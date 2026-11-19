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
      mastR: at(mR, [[Z, 0.6], [UP, 0.75], [HZ, -0.05]], 3.4, mR.clone().addScaledVector(Z, 0.2)),
      airR: at(W.canal.R.p, [[Z, 0.55], [HZ, 0.75], [HY, 0.25]], 3.6, W.canal.R.p.clone().addScaledVector(Z, 0.25).addScaledVector(HY, 0.25)),
      fore: at(f, [[HZ, 0.8], [Z, -0.55], [HY, 0.15]], 3.6, f.clone().addScaledVector(HY, -0.1)),
      mouth: at(lips, [[HZ, 1], [HY, -0.2], [Z, -0.05]], 2.0, lips.clone().addScaledVector(HZ, -0.2), 0.0015),
      shrug: at(neck, [[HZ, 0.5], [UP, 0.85], [Z, 0.05]], 8.5, neck, 0.006),
      jawR: at(W.P.anchor('lips'), [[HZ, 0.75], [Z, 0.6], [HY, 0.0]], 4.2, lips.clone().addScaledVector(Z, 0.35).addScaledVector(HY, -0.2), 0.004),
      cheekR: at(lips, [[HZ, 0.8], [Z, 0.6], [HY, 0.15]], 3.6, lips.clone().addScaledVector(Z, 0.3), 0.003),
      cheekL: at(lips, [[HZ, 0.8], [Z, -0.6], [HY, 0.15]], 3.6, lips.clone().addScaledVector(Z, -0.3), 0.003),
      neckSide: at(neck.clone().addScaledVector(HY, 0.2), [[Z, 1], [HZ, 0.12]], 4.4, neck.clone().addScaledVector(HY, 0.25).addScaledVector(HZ, 0.3), 0.004),
      tongueOut: at(lips, [[HZ, 1], [HY, 0.08]], 2.6, lips.clone().addScaledVector(HY, -0.1), 0.002),
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
    'b-mastR': { t: 10.0, cam: 'mastR', draw: (ctx, t, w, h) => { callouts((c) => /Rinne R/.test(c.name), [{ name: 'foot of the stem on the R mastoid', ang: -0.6, r: 150 }])(ctx, t, w, h); title(ctx, 'Rinne, right: the foot of the stem on the mastoid (behind and below the ear)'); } },
    'b-airR': { t: 12.4, cam: 'airR', draw: (ctx, t, w, h) => {
      const c = W.canal.R, pr = []; W.fork.group.traverse((m) => { if (m.isMesh && m.parent !== W.fork.group) pr.push(m); });
      const S = C4.surface(pr, c.p, 1.0), d = C4.dist(c.p, S, 1.0);
      const [x0, y0] = proj(c.p, w, h), [x1, y1] = proj(d.q, w, h); arrow(ctx, x0, y0, x1, y1, '#1b6b2f');
      const k = w / 960, e = proj(c.p.clone().addScaledVector(c.out, 0.6), w, h);
      ctx.save(); ctx.setLineDash([6 * k, 5 * k]); ctx.strokeStyle = '#1b6b2f'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.restore();
      label(ctx, (x0 + x1) / 2 - 90 * k, (y0 + y1) / 2 + 40 * k, 'ear canal opening -> near prong: ' + (Math.abs(d.d) * 10).toFixed(1) + ' cm', { ink: '#1b6b2f', size: 13 });
      label(ctx, e[0] + 40 * k, e[1] - 18 * k, 'canal axis: both prongs in line with it', { ink: '#1b6b2f', size: 13 });
      title(ctx, 'Rinne, right: the vibrating prongs about 2 cm from the opening of the ear canal, in line with it');
    } },
    'b-fore': { t: 22.4, cam: 'fore', draw: (ctx, t, w, h) => { callouts((c) => /Weber/.test(c.name), [{ name: 'foot on the middle of the forehead', ang: -2.6, r: 150 }])(ctx, t, w, h); title(ctx, 'Weber: the foot of the stem on the middle of the forehead'); } },
    'c-rest': { t: 30.6, cam: 'mouth', draw: (ctx, t, w, h) => { title(ctx, "Inside the mouth, open, before 'Ah': soft palate and uvula at rest, in the midline"); midline(ctx, w, h); } },
    'c-risen': { t: 33.5, cam: 'mouth', draw: (ctx, t, w, h) => { title(ctx, "'Ah': the soft palate rises equally on both sides, the uvula stays in the midline"); midline(ctx, w, h); } },
    'd-shrug': { t: 56.0, cam: 'shrug', draw: (ctx, t, w, h) => { callouts((c) => /Shrug up/.test(c.name) && /palm|index|little/.test(c.name), [])(ctx, t, w, h); title(ctx, 'Shrug: both palms flat on the tops of the shoulders (gaps: palm and fingers to the skin)'); } },
    'd-jaw': { t: 63.6, cam: 'jawR', draw: (ctx, t, w, h) => { callouts((c) => /Head turn: examiner R/.test(c.name), [])(ctx, t, w, h); title(ctx, 'Head turn to the right: the palm against the right side of the chin and jaw'); } },
    'e-out': { t: 79.0, cam: 'tongueOut', draw: (ctx, t, w, h) => { title(ctx, 'Tongue out: straight, in the midline'); midline(ctx, w, h); } },
    'e-cheekR': { t: 84.6, cam: 'cheekR', draw: (ctx, t, w, h) => { callouts((c) => /Cheek R: pad/.test(c.name), [{ name: 'index pad on the bulge', ang: -0.5, r: 150 }])(ctx, t, w, h); title(ctx, "Tongue in the RIGHT cheek: the examiner's index pad on the bulge"); } },
    'e-cheekL': { t: 87.1, cam: 'cheekL', draw: (ctx, t, w, h) => { callouts((c) => /Cheek L: pad/.test(c.name), [{ name: 'index pad on the bulge', ang: -2.6, r: 150 }])(ctx, t, w, h); title(ctx, "Tongue in the LEFT cheek: the examiner's index pad on the bulge"); } },
    'f-before': { t: 46.35, cam: 'neckSide', draw: (ctx, t, w, h) => { larynx(ctx, w, h, 0); title(ctx, 'Swallow, side view of the neck: the larynx before the swallow'); } },
    'f-during': { t: 46.85, cam: 'neckSide', draw: (ctx, t, w, h) => { larynx(ctx, w, h, 1); title(ctx, 'During the swallow: the larynx rises (about 3 cm) and then falls back'); } },
  };
  function midline(ctx, w, h) {
    const P = W.P, lips = P.anchor('lips'), HY = V(0, 1, 0).transformDirection(W.head.matrixWorld), k = w / 960;
    const a = proj(lips.clone().addScaledVector(HY, 0.45), w, h), b = proj(lips.clone().addScaledVector(HY, -0.5), w, h);
    ctx.save(); ctx.setLineDash([7 * k, 6 * k]); ctx.strokeStyle = 'rgba(27,107,47,0.9)'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
    label(ctx, a[0] + 50 * k, a[1] + 10 * k, 'midline', { ink: '#1b6b2f', size: 13 });
  }
  function larynx(ctx, w, h, up) {
    const P = W.P, k = w / 960, ray = new THREE.Raycaster(), neck = P.torso.children.find((m) => m.name === 'neck');
    const y = 5.3 + 0.28 * up, o = P.torso.localToWorld(V(0, y, 2)), d = P.torso.localToWorld(V(0, y, 0)).sub(o).normalize();
    ray.set(o, d); const hit = ray.intersectObject(neck, false)[0]; if (!hit) return;
    const [x, yy] = proj(hit.point, w, h); arrow(ctx, x + 110 * k, yy + 50 * k, x, yy, '#1b6b2f'); label(ctx, x + 110 * k, yy + 62 * k, up ? 'larynx risen' : 'larynx at rest', { ink: '#1b6b2f' });
  }
  window.REVIEW = {
    names: Object.keys(PANELS),
    panel(name) {
      const p = PANELS[name], C = cams();
      window.CAM_OVERRIDE = C[p.cam] || null; window.REVIEW_OVERLAY = p.draw; return p.t;
    },
    beat() { window.CAM_OVERRIDE = null; window.REVIEW_OVERLAY = null; },
    report() { return W.CONTACTS.map((c) => ({ name: c.name, gapMM: +(c.gap * 100).toFixed(2), clearance: !!c.clearance })); },
  };
})();
