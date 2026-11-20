// cns4/mouth.js: a better mouth interior for the CNS videos, in this part's own code (shared/ is not touched).
// Classic script; needs THREE, K, CLAY and a patient built with PATIENT.build(S, { neuro: true }). Defines window.MOUTH.
//
//   const M4 = MOUTH.install(P)    once, right after the patient is built
//   M4.face(f)                     use INSTEAD of P.setFace(f) every frame: calls P.setFace, then
//                                  - hides the kit's mouth-interior pieces (v4 dish + teeth + tongue pieces, v5 "Ah" set)
//                                  - opens the face between the lips (its own hole in the head and hair meshes)
//                                  - poses its own interior: cavity and throat, hard palate, soft palate arch with the
//                                    two pillars each side and a rounded tapering uvula, rows of rounded teeth on the
//                                    curve of the jaw, and the tongue on the floor (tip behind the lower front teeth);
//                                    the lower teeth and the tongue turn with the mandible about the kit's jaw joints
//                                  - with cheekR / cheekL: makes the kit's tongue-in-cheek bulge rounder and moves its
//                                    peak out between the corner of the mouth and the ear, at the level of the teeth
//   M4.tongueTip()                 world point of the tongue tip;  M4.bulge(side) the bulge peak (world) and normal
// See CONTINUE.md ("mouth.js") for exactly what it replaces, so it can go into the kit later.
(function (root) {
  const THREE = root.THREE, K = root.K, CLAY = root.CLAY;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const MOUTH = (root.MOUTH = {});
  // the kit's own constants (shared/patient.js and shared/patient-neuro.js), copied: the mouth line, the jaw joint axis
  const MOUTH_Y = -0.5, mouthY = (x) => MOUTH_Y + 0.22 * x * x, JP = V(0, -0.12, -0.08), JK = 0.22;
  const VIS = { rest: {}, A: { jaw: 0.9 }, E: { jaw: 0.35 }, O: { jaw: 0.7 }, U: { jaw: 0.25 }, M: { jaw: 0 }, F: { jaw: 0.2 } };
  // the jaw opening the kit gives a face (the same rules as its setFace)
  const jawOf = (f) => {
    let j = f.jaw; if (j == null && f.viseme && VIS[f.viseme]) j = VIS[f.viseme].jaw; j = j || 0;
    if ((f.ah || 0) > 0) j = Math.max(j, 1.6);
    if (f.cough) j = Math.max(j, 0.7 * K.clamp(f.cough));
    if (f.smile) j = Math.max(j, 0.1 * f.smile);
    return j;
  };

  MOUTH.install = (P) => {
    const head = P.head, cranium = head.children.find((m) => m.name === 'cranium');
    const hairM = head.children.find((m) => m.isMesh && m.material === P.M.hair);
    const kitMouth = head.children.find((g) => { let t = false; g.traverse((m) => { if (m.name === 'tongue-out') t = true; }); return t && !g.isMesh; });
    const kitAh = head.children.find((g) => { let t = false; g.traverse((m) => { if (m.name === 'uvula') t = true; }); return t && !g.isMesh; });
    head.updateMatrixWorld(true);
    const lipsL = head.worldToLocal(P.anchor('lips').clone()), ML = lipsL.z - 0.05;   // the face surface at the mouth

    // ---- the opening: the triangles that straddle the line between the lips (rest shape) are left out while it is open
    const restC = Float32Array.from(cranium.geometry.attributes.position.array);
    const I0c = Array.from(cranium.geometry.index.array), openC = [];
    for (let t = 0; t < I0c.length; t += 3) {
      let cx = 0, cy = 0, cz = 0; for (let k = 0; k < 3; k++) { const i = I0c[t + k]; cx += restC[3 * i] / 3; cy += restC[3 * i + 1] / 3; cz += restC[3 * i + 2] / 3; }
      const ax = Math.abs(cx), half = 0.034 * Math.sqrt(Math.max(0, 1 - (ax / 0.2) ** 2));
      if (cz > 0.3 && ax < 0.2 && Math.abs(cy - mouthY(ax)) < half + 0.004) continue;
      openC.push(I0c[t], I0c[t + 1], I0c[t + 2]);
    }
    const idxC = { closed: new THREE.Uint32BufferAttribute(I0c, 1), open: new THREE.Uint32BufferAttribute(openC, 1) };
    const hp = hairM.geometry.attributes.position, I0h = Array.from(hairM.geometry.index.array), openH = [];
    for (let t = 0; t < I0h.length; t += 3) { const i = I0h[t]; if (Math.abs(hp.getX(i)) < 0.32 && hp.getY(i) < -0.3 && hp.getY(i) > -1.1 && hp.getZ(i) > 0.15) continue; openH.push(I0h[t], I0h[t + 1], I0h[t + 2]); }
    const idxH = { closed: new THREE.Uint32BufferAttribute(I0h, 1), open: new THREE.Uint32BufferAttribute(openH, 1) };

    // ---- materials: soft, waxy, lit a little from within so the inside of the mouth is never a black hole
    let seed = 9700;
    const mat = (a, b, o = {}) => { const m = CLAY.mat(a, b, Object.assign({ prints: 0, rough: 0.5, streak: 0.15, freq: 5, bump: 0.25, fixedSeed: seed++ }, o)); if (o.glow) m.emissive = new THREE.Color(a).multiplyScalar(o.glow); return m; };
    const M = {
      cavity: mat('#5a1c24', '#4a161d', { glow: 0.35, side: THREE.BackSide }),
      throat: mat('#3a1015', '#2c0b10', { glow: 0.25 }),
      palate: mat('#d98a90', '#cc7c84', { glow: 0.45, side: THREE.DoubleSide }),
      soft: mat('#d4747e', '#c76771', { glow: 0.45, side: THREE.DoubleSide }),
      gum: mat('#c86a72', '#b85c65', { glow: 0.35 }),
      tongue: mat('#d97f80', '#cf7476', { glow: 0.25, rough: 0.42, sheen: 0.3, bump: 0.5 }),
      teeth: P.M.teeth,
    };
    const mesh = (geo, m, parent, pos, name) => { const o = new THREE.Mesh(geo, m); o.castShadow = false; o.receiveShadow = true; if (pos) o.position.set(...pos); if (name) o.name = name; parent.add(o); return o; };
    const G = new THREE.Group(); G.name = 'mouth4'; G.visible = false; head.add(G);
    const upper = new THREE.Group(); G.add(upper);                              // fixed to the skull
    const jawPivot = new THREE.Group(); jawPivot.position.copy(JP); G.add(jawPivot);
    const lower = new THREE.Group(); lower.position.copy(JP).negate(); jawPivot.add(lower);   // turns with the mandible

    // the cavity, the back of the throat
    mesh(new THREE.SphereGeometry(1, 40, 28).scale(0.165, 0.2, 0.3), M.cavity, upper, [0, MOUTH_Y - 0.14, ML - 0.29], 'cavity');
    mesh(new THREE.SphereGeometry(1, 32, 20).scale(0.12, 0.13, 0.03), M.throat, upper, [0, MOUTH_Y - 0.13, ML - 0.52], 'throat');
    // the hard palate: a shallow pink dome behind the upper teeth
    { const g = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(0.15, 0.065, 0.17); mesh(g, M.palate, upper, [0, MOUTH_Y + 0.0, ML - 0.2], 'hard-palate'); }
    // the soft palate: a curtain hanging from the back of the dome, its free edge a soft arch; the pillars down each side;
    // the uvula hanging from the middle of the arch. Built in a group that rises a little on "Ah".
    const softG = new THREE.Group(); softG.position.set(0, 0, ML - 0.37); upper.add(softG);
    // Two arches each side, as in a real throat: the FRONT one (palatoglossal) is the free edge of the soft palate,
    // running from the uvula's base out and down to the side of the tongue; the BACK one (palatopharyngeal) runs the
    // same way a little further back and nearer the middle. Each is one smooth curve, so the arches flow out of the palate.
    const ARCH = { top: MOUTH_Y - 0.035 };
    const archCurve = (w, flare, top, foot, z, zFoot, n = 40) => { const pts = []; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n, s = Math.sin(a), ww = w * (1 + flare * (1 - s)); pts.push([-Math.cos(a) * ww, foot + (top - foot) * Math.pow(s, 0.65), K.lerp(zFoot, z, s)]); } return pts; };
    const FRONT = archCurve(0.125, 0.3, ARCH.top, MOUTH_Y - 0.215, 0.012, 0.07), BACK = archCurve(0.095, 0.22, ARCH.top + 0.012, MOUTH_Y - 0.23, -0.035, -0.06);
    const curtain = (() => {   // the soft palate: the membrane from the roof down to the front arch
      const sh = new THREE.Shape(); sh.moveTo(FRONT[0][0] - 0.015, FRONT[0][1]); FRONT.forEach(([x, y]) => sh.lineTo(x, y));
      sh.lineTo(FRONT[FRONT.length - 1][0] + 0.015, FRONT[FRONT.length - 1][1]); sh.lineTo(0.165, MOUTH_Y + 0.06); sh.lineTo(-0.165, MOUTH_Y + 0.06); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 24 }); g.translate(0, 0, -0.005);
      return mesh(g, M.soft, softG, null, 'soft-palate');
    })();
    mesh(K.tube(FRONT, 0.017, { radial: 14, segments: 80 }), M.soft, softG, null, 'arch-front');
    mesh(K.tube(BACK, 0.014, { radial: 14, segments: 80 }), M.soft, softG, null, 'arch-back');
    // the shallow hollow between the two arches each side (where the tonsil sits), a little darker
    for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(1, 20, 14).scale(0.018, 0.06, 0.03), M.throat, softG, [sx * 0.125, MOUTH_Y - 0.15, -0.02], 'fossa');
    // the uvula: a rounded drop, tapering, hanging in the midline
    const uvG = new THREE.Group(); uvG.position.set(0, ARCH.top + 0.006, 0.012); softG.add(uvG);
    { const prof = [[0.0, 0.006], [0.017, 0.0], [0.02, -0.02], [0.018, -0.045], [0.015, -0.065], [0.012, -0.078], [0.006, -0.087], [0.0, -0.089]].map(([r, y]) => new THREE.Vector2(r, y));
      const g = new THREE.LatheGeometry(prof, 28); g.scale(1, 1, 0.85); mesh(g, M.soft, uvG, null, 'uvula4'); }
    // teeth: rounded crowns on the curve of the jaw; the upper row hangs from the upper gum, the lower row stands on the lower
    const arch = (x, back) => -back * x * x - 0.9 * Math.pow(Math.abs(x), 3);
    const teethRow = (parent, isUpper) => {
      const N = 6, W = isUpper ? 0.032 : 0.029, H0 = isUpper ? 0.056 : 0.048;
      const z0 = isUpper ? ML - 0.022 : ML - 0.05, yGum = isUpper ? MOUTH_Y + 0.035 : MOUTH_Y - 0.07, back = isUpper ? 2.4 : 2.6;
      const g = new THREE.Group(); parent.add(g);
      const zOf = (x) => z0 + arch(x, back), slope = (x) => -(2 * back * x + 2.7 * x * Math.abs(x));
      // walk along the curve so neighbouring teeth touch: equal arc length per tooth
      for (const sx of [-1, 1]) {
        let x = 0;
        for (let i = 0; i < N; i++) {
          let x1 = x; for (let k = 0; k < 40; k++) { const xm = x1 + 0.001; if (Math.hypot(xm - x, zOf(xm) - zOf(x)) > W) break; x1 = xm; }
          const cx = sx * (x + x1) / 2, h = H0 * (1 - 0.035 * i), d = 0.028 + 0.003 * i;
          const geo = K.roundedBox(W * 0.96, h, d, Math.min(W * 0.35, d * 0.45, h * 0.28), 4);
          const p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const yy = p.getY(k) / h + 0.5, tip = isUpper ? 1 - yy : yy; p.setZ(k, p.getZ(k) * (1 - 0.3 * tip)); }
          geo.computeVertexNormals();
          const t = mesh(geo, M.teeth, g, [cx, isUpper ? yGum - h / 2 : yGum + h / 2, zOf(cx) - d / 2], 'tooth');
          t.rotation.y = -Math.atan(slope(cx));                                // the tooth's width along the curve
          x = x1;
        }
        const gp = []; for (let k = 0; k <= 12; k++) { const xx = sx * (0.004 + 0.17 * k / 12); gp.push([xx, yGum + (isUpper ? 0.008 : -0.008), zOf(xx) - 0.018]); }
        mesh(K.tube(gp, 0.021, { radial: 10, segments: 36 }), M.gum, g, null, 'gum');
      }
      return g;
    };
    const upTeeth = teethRow(upper, true), loTeeth = teethRow(lower, false);
    // the floor of the mouth under the tongue, and the tongue: a soft rounded body on the floor between the lower teeth,
    // its tip just behind the lower front teeth, a shallow groove down its middle
    const TL = 0.54, tongueG = new THREE.Group(); lower.add(tongueG);
    const tongueGeo = CLAY.loft([
      { s: 0, a: 0.1, c: 0.05, d: 0.05 }, { s: 0.14, a: 0.125, c: 0.055, d: 0.045 }, { s: 0.3, a: 0.12, c: 0.05, d: 0.038 },
      { s: 0.44, a: 0.1, c: 0.042, d: 0.03 }, { s: 0.5, a: 0.085, c: 0.036, d: 0.027 }, { s: TL, a: 0.06, c: 0.03, d: 0.024 },
    ], { axis: 'x', radial: 56, rings: 48, pow: 2.2, capStart: 0.5, capEnd: 1.0, deform: (p, s2) => { if (p.y > 0) p.y -= 0.011 * Math.exp(-((p.z / 0.026) ** 2)) * K.smooth(0.05, 0.2, s2) * (1 - K.smooth(TL - 0.025, TL + 0.03, s2)); } });
    tongueGeo.rotateY(-Math.PI / 2);                                             // +X along the tongue -> +Z (out of the mouth)
    const tongue = mesh(tongueGeo, M.tongue, tongueG, null, 'tongue4');
    const TIP_REST = ML - 0.085;                                                  // the tip, just behind the lower incisors
    const restTongue = { p: V(0, MOUTH_Y - 0.045, TIP_REST - TL), r: 0.07 };
    const outTongue = { p: V(0, MOUTH_Y + 0.02, TIP_REST - TL + 0.39), r: 0.07 };   // out over the lower teeth and lip, 2-3 cm past the lip

    // ---- the cheek bulge: rounder, and its peak further out (added on top of the kit's own bulge)
    const BULGE = { x: 0.42, y: MOUTH_Y + 0.01, r: 0.1 };                        // centre (head-local |x|, y) and radius
    const NV = restC.length / 3, delta = new Float32Array(NV * 3); let applied = 0;
    // the skin vertex at the middle of each bulge (the examiner's finger pad goes there)
    const bulgeV = {}; for (const [side, sx] of [['R', -1], ['L', 1]]) { let best = -1, bd = 9; for (let i = 0; i < NV; i++) { const x = restC[3 * i], y = restC[3 * i + 1], z = restC[3 * i + 2]; if (z < 0.1 || Math.sign(x) !== sx) continue; const d = Math.hypot(Math.abs(x) - BULGE.x, y - BULGE.y); if (d < bd) { bd = d; best = i; } } bulgeV[side] = best; }
    // the larynx (laryngeal prominence): a subtle bump on the front of the neck that rises about 2 cm and falls back in a
    // swallow. Shown only in the swallow beat (f.larynx 0..1), so the home shot stays exactly the kit's.
    const neckM = P.torso.children.find((m) => m.name === 'neck'), NA = neckM.geometry.attributes.position, NN = neckM.geometry.attributes.normal;
    const neckRestN = Float32Array.from(NN.array), neckD = new Float32Array(NA.count * 3); let neckOn = 0, larynxV = -1;
    const larynxDelta = (pres, su) => {
      neckD.fill(0); const yc = 5.85 + 0.2 * Math.sin(Math.PI * K.clamp(su)); let best = 0;
      for (let i = 0; i < NA.count; i++) {
        const nx = neckRestN[3 * i], nz = neckRestN[3 * i + 2]; if (nz < 0.2) continue;
        const a = Math.atan2(nx, nz), w = 0.045 * pres * Math.exp(-((a / 0.3) ** 2)) * Math.exp(-(((NA.getY(i) - yc) / 0.09) ** 2));
        neckD[3 * i] = nx * w; neckD[3 * i + 1] = neckRestN[3 * i + 1] * w; neckD[3 * i + 2] = nz * w; if (w > best) { best = w; larynxV = i; }
      }
    };
    const addNeck = (sign) => { const A = NA.array; for (let i = 0; i < A.length; i++) A[i] += sign * neckD[i]; NA.needsUpdate = true; neckM.geometry.computeVertexNormals(); };
    const bulgeDelta = (cR, cL) => {
      delta.fill(0);
      for (let i = 0; i < NV; i++) {
        const x = restC[3 * i], y = restC[3 * i + 1], z = restC[3 * i + 2]; if (z < 0.05) continue;
        const sx = Math.sign(x) || 1, u = sx < 0 ? cR : cL; if (!u) continue;
        const ax = Math.abs(x);
        // undo the kit's bulge (its own formula, on the same rest shape) ...
        const kb = Math.exp(-Math.pow((((ax - 0.37) / 0.11) ** 2 + ((y + 0.5) / 0.1) ** 2), 1.4));
        // ... and put a round one in its place: between the corner of the mouth and the ear, at the level of the teeth
        const r2 = ((ax - BULGE.x) / BULGE.r) ** 2 + ((y - BULGE.y) / BULGE.r) ** 2, b = Math.exp(-r2 * r2 * 0.6) * K.smooth(0.05, 0.35, z);
        delta[3 * i] = sx * u * (0.11 * b - 0.11 * kb); delta[3 * i + 2] = u * (0.1 * b - 0.085 * kb);
      }
    };
    const addDelta = (sign) => { const A = cranium.geometry.attributes.position.array; for (let i = 0; i < A.length; i++) A[i] += sign * delta[i]; cranium.geometry.attributes.position.needsUpdate = true; };

    let lastKey = null, open = false;
    const api = {
      group: G, upper, lower, jawPivot, tongue, tongueG, softG, uvG, ML,
      // use instead of P.setHead (the larynx bump is taken off the neck before the kit rebuilds it)
      head(h) { if (neckOn) { addNeck(-1); neckOn = 0; } P.setHead(h || {}); },
      face(f0) {
        const f = Object.assign({}, f0), lar = K.clamp(f.larynx || 0), su = f.swallow || 0;
        delete f.larynx; if (lar > 0) f.swallow = 0;                                // the swallow is this file's larynx, not the kit's
        const key = JSON.stringify(f);
        if (neckOn) { addNeck(-1); neckOn = 0; }
        if (key !== lastKey) {
          if (applied) { addDelta(-1); applied = 0; }
          P.setFace(f);
          const cR = K.clamp(f.cheekR || 0), cL = K.clamp(f.cheekL || 0);
          if (cR || cL) { bulgeDelta(cR, cL); addDelta(1); applied = 1; cranium.geometry.computeVertexNormals(); cranium.geometry.computeBoundingSphere(); }
          lastKey = key;
        } else P.setFace(f);                                                       // (memoised in the kit: cheap)
        if (lar > 0) { larynxDelta(lar, su); addNeck(1); neckOn = 1; }
        // the kit's interior pieces are never shown; this interior is
        if (kitMouth) kitMouth.visible = false;
        if (kitAh) kitAh.visible = false;
        const jaw = jawOf(f), tOut = K.clamp(f.tongue || 0), ah = K.clamp(f.ah || 0);
        open = jaw > 0.02 || tOut > 0.01;
        cranium.geometry.setIndex(open ? idxC.open : idxC.closed);
        hairM.geometry.setIndex(open ? idxH.open : idxH.closed);
        G.visible = open;
        if (!open) return;
        jawPivot.rotation.x = JK * jaw;
        // "Ah": the soft palate and the uvula rise a little, evenly on both sides; the uvula stays in the midline
        softG.position.y = 0.028 * ah; softG.scale.set(1 + 0.06 * ah, 1, 1); uvG.scale.set(1, 1 - 0.14 * ah, 1);
        // the tongue: at rest on the floor, or out over the lower teeth and lip (the tip on the midline); flatter on "Ah"
        const u = K.ease.inOut(tOut);
        tongueG.position.lerpVectors(restTongue.p, outTongue.p, u); tongueG.rotation.x = K.lerp(restTongue.r, outTongue.r, u);
        // with the mouth only a little open (speech, cough) the tongue lies lower and further back, out of sight
        const low = (1 - u) * (1 - K.smooth(0.6, 1.4, jaw)); tongueG.position.y -= 0.05 * low; tongueG.position.z -= 0.04 * low;
        tongueG.scale.set(1, 1 - 0.12 * ah, 1);
      },
      tongueTip() { G.updateMatrixWorld(true); return tongue.localToWorld(V(0, 0, TL + 0.02)); },
      bulge(side) { cranium.updateMatrixWorld(true); const i = bulgeV[side], g = cranium.geometry; return { p: V(0, 0, 0).fromBufferAttribute(g.attributes.position, i).applyMatrix4(cranium.matrixWorld), n: V(0, 0, 0).fromBufferAttribute(g.attributes.normal, i).transformDirection(cranium.matrixWorld).normalize() }; },
      larynx() { neckM.updateMatrixWorld(true); return larynxV >= 0 ? V(0, 0, 0).fromBufferAttribute(NA, larynxV).applyMatrix4(neckM.matrixWorld) : null; },
    };
    return api;
  };
})(typeof window !== 'undefined' ? window : globalThis);
