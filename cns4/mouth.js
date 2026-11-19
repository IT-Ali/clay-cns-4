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
    mesh(new THREE.SphereGeometry(1, 40, 28).scale(0.19, 0.16, 0.3), M.cavity, upper, [0, MOUTH_Y - 0.1, ML - 0.27], 'cavity');
    mesh(new THREE.SphereGeometry(1, 32, 20).scale(0.12, 0.13, 0.03), M.throat, upper, [0, MOUTH_Y - 0.13, ML - 0.52], 'throat');
    // the hard palate: a shallow pink dome behind the upper teeth
    { const g = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(0.15, 0.065, 0.17); mesh(g, M.palate, upper, [0, MOUTH_Y + 0.0, ML - 0.2], 'hard-palate'); }
    // the soft palate: a curtain hanging from the back of the dome, its free edge a soft arch; the pillars down each side;
    // the uvula hanging from the middle of the arch. Built in a group that rises a little on "Ah".
    const softG = new THREE.Group(); softG.position.set(0, 0, ML - 0.37); upper.add(softG);
    const ARCH = { w: 0.11, top: MOUTH_Y - 0.035, foot: MOUTH_Y - 0.17 };
    const archPts = (w, top, foot, n = 24) => { const pts = []; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; pts.push([-Math.cos(a) * w, foot + (top - foot) * Math.pow(Math.sin(a), 0.7), 0]); } return pts; };
    const curtain = (() => {   // the membrane between the arch and the roof
      const s = new THREE.Shape(); const pts = archPts(ARCH.w + 0.02, ARCH.top, ARCH.foot + 0.02);
      s.moveTo(-0.15, ARCH.foot + 0.02); pts.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(0.15, ARCH.foot + 0.02); s.lineTo(0.15, MOUTH_Y + 0.08); s.lineTo(-0.15, MOUTH_Y + 0.08); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 24 }); g.translate(0, 0, -0.01);
      return mesh(g, M.soft, softG, null, 'soft-palate');
    })();
    const archEdge = mesh(K.tube(archPts(ARCH.w + 0.02, ARCH.top, ARCH.foot + 0.02), 0.016, { radial: 12, segments: 48 }), M.soft, softG, null, 'palate-arch');
    // the pillars (palatoglossal in front, palatopharyngeal behind), rounded folds from the arch down to the tongue
    for (const sx of [-1, 1]) {
      mesh(K.tube([[sx * (ARCH.w + 0.02), ARCH.foot + 0.04, 0.0], [sx * (ARCH.w + 0.03), ARCH.foot - 0.02, 0.025], [sx * (ARCH.w + 0.035), ARCH.foot - 0.09, 0.045]], 0.012, { radial: 12 }), M.soft, softG, null, 'pillar-front');
      mesh(K.tube([[sx * (ARCH.w - 0.01), ARCH.foot + 0.05, -0.03], [sx * (ARCH.w - 0.02), ARCH.foot - 0.03, -0.05], [sx * (ARCH.w - 0.03), ARCH.foot - 0.1, -0.06]], 0.011, { radial: 12 }), M.soft, softG, null, 'pillar-back');
    }
    // the uvula: a rounded drop, tapering, hanging in the midline
    const uvG = new THREE.Group(); uvG.position.set(0, ARCH.top + 0.006, 0.012); softG.add(uvG);
    { const prof = [[0.0, 0.006], [0.017, 0.0], [0.02, -0.02], [0.018, -0.045], [0.015, -0.065], [0.012, -0.078], [0.006, -0.087], [0.0, -0.089]].map(([r, y]) => new THREE.Vector2(r, y));
      const g = new THREE.LatheGeometry(prof, 28); g.scale(1, 1, 0.85); mesh(g, M.soft, uvG, null, 'uvula4'); }
    // teeth: rounded crowns on the curve of the jaw; the upper row hangs from the upper gum, the lower row stands on the lower
    const arch = (x, back) => -back * x * x - 0.9 * Math.pow(Math.abs(x), 3);
    const teethRow = (parent, isUpper) => {
      const ws = isUpper ? [0.043, 0.034, 0.034, 0.033, 0.033, 0.036] : [0.03, 0.03, 0.032, 0.033, 0.033, 0.036];
      const hs = isUpper ? [0.06, 0.052, 0.058, 0.048, 0.045, 0.042] : [0.048, 0.048, 0.052, 0.046, 0.044, 0.04];
      const z0 = isUpper ? ML - 0.022 : ML - 0.052, yGum = isUpper ? MOUTH_Y + 0.035 : MOUTH_Y - 0.07, back = isUpper ? 2.4 : 2.6;
      const g = new THREE.Group(); parent.add(g);
      for (const sx of [-1, 1]) {
        let x = 0.0015;
        ws.forEach((w, i) => {
          const cx = sx * (x + w / 2), h = hs[i], d = i < 3 ? 0.026 : 0.04;
          const geo = K.roundedBox(w * 0.9, h, d, Math.min(w * 0.42, d * 0.48, h * 0.3), 4);
          const p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const yy = (p.getY(k) / h + 0.5); const tip = isUpper ? 1 - yy : yy; p.setX(k, p.getX(k) * (1 - 0.12 * tip * (i === 2 ? 2.2 : 1))); p.setZ(k, p.getZ(k) * (1 - 0.25 * tip)); }
          geo.computeVertexNormals();
          const t = mesh(geo, M.teeth, g, [cx, isUpper ? yGum - h / 2 : yGum + h / 2, z0 + arch(cx, back) - d / 2], 'tooth');
          t.rotation.y = -sx * Math.atan(2 * back * Math.abs(cx) + 2.7 * cx * cx) * 0.9;
          x += w;
        });
        // the gum along the row
        const gp = []; for (let k = 0; k <= 10; k++) { const xx = sx * (0.005 + 0.2 * k / 10); gp.push([xx, yGum + (isUpper ? 0.008 : -0.008), z0 + arch(xx, back) - 0.02]); }
        mesh(K.tube(gp, 0.02, { radial: 10, segments: 30 }), M.gum, g, null, 'gum');
      }
      return g;
    };
    const upTeeth = teethRow(upper, true), loTeeth = teethRow(lower, false);
    // the floor of the mouth under the tongue, and the tongue: a soft rounded body on the floor between the lower teeth,
    // its tip just behind the lower front teeth, a shallow groove down its middle
    mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(0.15, 0.06, 0.24), M.cavity, lower, [0, MOUTH_Y - 0.1, ML - 0.27], 'floor');
    const TL = 0.42, tongueG = new THREE.Group(); lower.add(tongueG);
    const tongueGeo = CLAY.loft([
      { s: 0, a: 0.11, c: 0.05, d: 0.05 }, { s: 0.12, a: 0.13, c: 0.055, d: 0.045 }, { s: 0.26, a: 0.125, c: 0.05, d: 0.035 },
      { s: 0.36, a: 0.1, c: 0.04, d: 0.028 }, { s: TL, a: 0.07, c: 0.028, d: 0.022 },
    ], { axis: 'x', radial: 56, rings: 40, pow: 2.3, capStart: 0.5, capEnd: 0.95, deform: (p, s2) => { if (p.y > 0) p.y -= 0.01 * Math.exp(-((p.z / 0.028) ** 2)) * K.smooth(0.03, 0.15, s2) * (1 - K.smooth(TL - 0.03, TL + 0.04, s2)); } });
    tongueGeo.rotateY(-Math.PI / 2);                                             // +X along the tongue -> +Z (out of the mouth)
    const tongue = mesh(tongueGeo, M.tongue, tongueG, null, 'tongue4');
    const TIP_REST = ML - 0.075;                                                  // the tip, just behind the lower incisors
    const restTongue = { p: V(0, MOUTH_Y - 0.03, TIP_REST - TL), r: 0.08 };
    const outTongue = { p: V(0, MOUTH_Y - 0.025, TIP_REST - TL + 0.19), r: 0.2 };   // over the lower teeth and lip, tip down a little

    // ---- the cheek bulge: rounder, and its peak further out (added on top of the kit's own bulge)
    const NV = restC.length / 3, delta = new Float32Array(NV * 3); let applied = 0;
    const bulgeDelta = (cR, cL) => {
      delta.fill(0);
      for (let i = 0; i < NV; i++) {
        const x = restC[3 * i], y = restC[3 * i + 1], z = restC[3 * i + 2]; if (z < 0.05) continue;
        const sx = Math.sign(x) || 1, u = sx < 0 ? cR : cL; if (!u) continue;
        const ax = Math.abs(x);
        // undo the kit's bulge (its own formula, on the same rest shape) ...
        const kb = Math.exp(-Math.pow((((ax - 0.37) / 0.11) ** 2 + ((y + 0.5) / 0.1) ** 2), 1.4));
        // ... and put a round one in its place: between the corner of the mouth and the ear, at the level of the teeth
        const r2 = ((ax - 0.45) / 0.13) ** 2 + ((y - (MOUTH_Y - 0.03)) / 0.125) ** 2, b = Math.exp(-r2) * K.smooth(0.05, 0.35, z);
        delta[3 * i] = sx * u * (0.12 * b - 0.11 * kb); delta[3 * i + 2] = u * (0.09 * b - 0.085 * kb);
      }
    };
    const addDelta = (sign) => { const A = cranium.geometry.attributes.position.array; for (let i = 0; i < A.length; i++) A[i] += sign * delta[i]; cranium.geometry.attributes.position.needsUpdate = true; };

    let lastKey = null, open = false;
    const api = {
      group: G, upper, lower, jawPivot, tongue, tongueG, softG, uvG, ML,
      face(f0) {
        const f = Object.assign({}, f0), key = JSON.stringify(f);
        if (key !== lastKey) {
          if (applied) { addDelta(-1); applied = 0; }
          P.setFace(f);
          const cR = K.clamp(f.cheekR || 0), cL = K.clamp(f.cheekL || 0);
          if (cR || cL) { bulgeDelta(cR, cL); addDelta(1); applied = 1; cranium.geometry.computeVertexNormals(); cranium.geometry.computeBoundingSphere(); }
          lastKey = key;
        } else P.setFace(f);                                                       // (memoised in the kit: cheap)
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
        tongueG.scale.set(1, 1 - 0.12 * ah, 1);
      },
      tongueTip() { G.updateMatrixWorld(true); return tongue.localToWorld(V(0, 0, TL + 0.02)); },
    };
    return api;
  };
})(typeof window !== 'undefined' ? window : globalThis);
