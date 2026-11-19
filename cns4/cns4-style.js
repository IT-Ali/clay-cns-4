// cns4/cns4-style.js: "Soft Clay" style object for PART 4 OF 11 of the neurological (CNS) examination video:
// the lower cranial nerves VIII to XII (hearing, palate and swallowing, accessory nerve, tongue).
// Classic script. Needs THREE, K (lib/stage.js), SOUND (lib/sound.js), the shared/ scripts (v5, neuro mode) and
// cns4/contact4.js. Defines window.CNS4 (the style object). Units: 1 = 10 cm. Head at screen left (-X), feet at
// screen right (+X), the patient's RIGHT side toward the camera (+Z), the examiner on his right.
//
// STORYBOARD = ANIMATION: every camera (W.CAM) and every contact pose (W.ST) is defined once here; the storyboard
// (tools/storyboard.mjs) renders its stills from this same data through window.CNS4_WORLD.
(function (root) {
  const THREE = root.THREE, K = root.K;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const Q = () => new THREE.Quaternion();

  // ================================================================ CONTENT (the story, in order; times in seconds)
  const D = 92;
  const HOME_HOLD = 1.0;              // the CNS home shot, still, at both ends
  const BEATS = [
    { n: 1, name: 'Position', t0: 0, t1: 5 },
    { n: 2, name: 'Rinne (VIII)', t0: 5, t1: 19, hold: [5.8, 7.3] },
    { n: 3, name: 'Weber (VIII)', t0: 19, t1: 27 },
    { n: 4, name: 'Voice and palate (IX, X)', t0: 27, t1: 37, hold: [27.8, 29.3] },
    { n: 5, name: 'Cough (X)', t0: 37, t1: 41, hold: [37.6, 39.1] },
    { n: 6, name: 'Water swallow (IX, X)', t0: 41, t1: 51, hold: [41.6, 43.1] },
    { n: 7, name: 'Shoulder shrug (XI)', t0: 51, t1: 59, hold: [51.8, 53.3] },
    { n: 8, name: 'Head turning (XI)', t0: 59, t1: 69, hold: [59.8, 61.3] },
    { n: 9, name: 'Tongue at rest (XII)', t0: 69, t1: 75, hold: [69.6, 71.1] },
    { n: 10, name: 'Tongue out (XII)', t0: 75, t1: 81, hold: [75.6, 77.1] },
    { n: 11, name: 'Tongue into each cheek (XII)', t0: 81, t1: 89, hold: [81.4, 82.9] },
    { n: 12, name: 'End', t0: 89, t1: 92 },
  ];
  // every event of the part, in seconds: the picture and the sound both read this table
  const T = {
    // 1
    push: [1.0, 5.0],
    // 2 Rinne: right ear, then left ear (reaching behind his head)
    toRinne: [5.0, 5.8], forkIn: [7.3, 8.1], strike1: 8.1, toMastR: [8.2, 8.9], onMastR: [8.9, 11.0], sigStopR: [10.3, 10.9],
    toAirR: [11.0, 11.5], airR: [11.5, 13.0], sigHearR: [12.0, 12.7], strike2: 13.4, toMastL: [13.6, 14.6], camL: [13.4, 14.6], onMastL: [14.6, 15.9], sigStopL: [15.3, 15.8],
    toAirL: [15.9, 16.3], airL: [16.3, 17.6], sigHearL: [16.8, 17.4], forkOut: [17.6, 18.6],
    // 3 Weber
    toWeber: [19.0, 20.0], forkIn3: [19.4, 20.3], strike3: 20.5, toFore: [20.6, 21.2], onFore: [21.2, 24.6], sigMid: [22.6, 23.7], forkOut3: [24.6, 25.8],
    // 4 voice and palate
    toMouth: [27.0, 27.8], torchIn: [29.3, 30.0], torchOn: 30.0, open: [30.1, 30.5], ah: [30.9, 31.6], ahHold: [31.6, 34.8], close: [34.8, 35.3], torchOff: 35.35, torchOut: [35.4, 36.4],
    // 5 cough
    toCough: [37.0, 37.6], cough: [39.3, 39.9],
    // 6 water swallow (instead of the gag)
    toDrink: [41.0, 41.6], camTable: [43.0, 44.0], reach: [43.1, 44.3], grasp: 44.3, lift: [44.4, 45.6], camSide: [44.6, 45.8],
    sip1: [45.7, 46.4], swallow1: [46.4, 47.3], sip2: [47.4, 48.0], swallow2: [48.0, 48.9], lower: [48.9, 49.5], speak6: [49.3, 50.1],
    camBack6: [49.6, 50.4], back: [49.7, 50.8], setDown: 50.8, release: [50.8, 51.5],
    // 7 shrug
    toShrug: [51.0, 51.8], handsOnSh: [53.3, 54.2], shrug: [54.5, 55.3], shrugHold: [55.3, 56.9], shrugDown: [56.9, 57.4], handsOffSh: [57.4, 58.4],
    // 8 head turning
    toTurn: [59.0, 59.8], palmR: [61.3, 62.1], turnR: [62.2, 63.0], turnRHold: [63.0, 64.3], turnRBack: [64.3, 64.8], palmMove: [64.8, 65.7],
    turnL: [65.8, 66.6], turnLHold: [66.6, 67.8], turnLBack: [67.8, 68.3], palmOff: [68.2, 69.0],
    // 9 tongue at rest
    toRest9: [69.0, 69.6], torchIn9: [71.1, 71.7], torchOn9: 71.7, open9: [71.8, 72.2], close9: [74.1, 74.5], torchOff9: 74.55, torchOut9: [74.6, 75.4],
    // 10 tongue out (the key beat)
    toOut: [75.0, 75.6], tongueOut: [77.3, 77.9], tongueIn: [80.1, 80.6],
    // 11 tongue into each cheek
    toCheek: [81.0, 81.4], cheekR: [83.0, 83.5], fingerR: [83.4, 84.0], holdR: [84.0, 85.0], offR: [85.0, 85.5],
    camCheekL: [85.2, 86.0], cheekL: [85.6, 86.1], fingerL: [85.9, 86.6], holdL: [86.6, 87.7], offL: [87.7, 88.2], handsHome: [88.2, 89.0],
    // 12 end
    pull: [89.0, 91.0],
  };
  const STRIKES = [T.strike1, T.strike2, T.strike3];
  const HUM_DECAY = 1.6;               // seconds: the fork's sound and the prongs' blur fall to a third in this time
  const CAPTIONS = [
    { t0: 1.4, t1: 4.8, text: 'Cranial nerves VIII-XII', place: 'top' },
    { t0: 8.4, t1: 18.6, text: 'Rinne: fork on the mastoid, then beside the ear - louder in the air: positive, both ears', place: 'top' },
    { t0: 21.3, t1: 26.6, text: 'Weber: fork on the forehead - heard in the middle', place: 'top' },
    { t0: 31.0, t1: 36.6, text: "Say 'Ah': the palate rises equally, the uvula stays central", place: 'top' },
    { t0: 39.3, t1: 40.85, text: 'A normal, explosive cough', place: 'top' },
    { t0: 45.9, t1: 50.6, text: 'Sips of water: no cough, no choking, voice unchanged (instead of the gag)', place: 'top' },
    { t0: 54.4, t1: 58.7, text: 'Shrug against my hands: strong and equal (trapezius)', place: 'top' },
    { t0: 62.2, t1: 68.7, text: 'Turn the head against my hand, each side: strong (sternocleidomastoid)', place: 'top' },
    { t0: 72.0, t1: 74.9, text: 'Tongue at rest in the mouth: no wasting, no fasciculation', place: 'top' },
    { t0: 77.6, t1: 80.8, text: 'Tongue out: straight in the midline', place: 'top' },
    { t0: 83.6, t1: 88.6, text: 'Tongue into each cheek against my finger: strong', place: 'top' },
  ];

  // ================================================================ stop-motion time and helpers
  const POSES = 15;
  const poseT = (t) => Math.floor(t * POSES + 1e-3) / POSES;          // = SET.poseTime
  const seg = (t, w, e) => K.seg(t, w[0], w[1], e || K.ease.inOut);
  const bump = (t, w) => Math.sin(Math.PI * K.clamp((t - w[0]) / (w[1] - w[0])));   // 0 -> 1 -> 0 over a window
  const inWin = (t, w) => t >= w[0] && t <= w[1];
  // breathing: about 14 a minute, starting from the home breath at the end of the first second and back to it,
  // exactly, at the start of the last second (21 whole breaths in 90 s; P.breathe has a 4.6 s period)
  const BREATH_K = 4.6 * 14 / 60;
  const breathT = (t) => K.clamp(t - HOME_HOLD, 0, D - 2 * HOME_HOLD) * BREATH_K;
  // the fork: how strongly it rings at time t (0..1), from the latest strike
  const ring = (t) => { let a = 0; for (const s of STRIKES) if (t >= s) a = Math.exp(-(t - s) / HUM_DECAY); return a; };

  // silent speech: [time, viseme] lists; between keys the mouth holds the last viseme
  const SPEECH = [
    [T.sigStopR[0], ['O', 'M', 'A', 'rest']],     // "Gone" (the sound has stopped)
    [T.sigHearR[0], ['E', 'A', 'rest']],          // "Yes, I hear it"
    [T.sigStopL[0], ['O', 'M', 'A', 'rest']],
    [T.sigHearL[0], ['E', 'A', 'rest']],
    [T.sigMid[0], ['E', 'A', 'M', 'E', 'rest']],  // "In the middle"
    [T.speak6[0], ['E', 'O', 'A', 'U', 'rest']],  // a normal voice after the sips
  ];
  const VIS_DUR = 0.2;   // seconds per viseme (3 poses)

  // ================================================================ the style
  const style = {
    id: 'cns4-soft-clay', name: 'Soft Clay - CNS part 4: cranial nerves VIII-XII', duration: D,
    fonts: ['600 56px "Fredoka"'],
    render: Object.assign({}, root.SET.RENDER),
    content: { BEATS, CAPTIONS, T, HOME_HOLD, STRIKES, SPEECH },
    captions: true,      // the CAPTIONS switch (window.CAPTIONS = false renders the clean version)
    // The end hold plays the start hold backwards (same still scene; only the film grain, which follows the frame
    // number, differs), so the LAST frame is the FIRST frame exactly: the parts join with no jump.
    seekTime(t) { return t >= D - HOME_HOLD - 1e-6 ? Math.max(0, D - 1 / 30 - t) : t; },

    build(S) {
      const SET = root.SET, BED = root.BED, PATIENT = root.PATIENT, SHEET = root.SHEET, HANDS = root.HANDS, PROPS = root.PROPS, CLAY = root.CLAY, CAPTION = root.CAPTION, HOME = root.HOME, NEURO = root.NEURO, C4 = root.C4;
      // ------------------------------------------------------------ the CNS home (exactly as shared/README.md)
      const L = SET.build(S);
      const bed = BED.build(S);
      const table = BED.table(S);
      const P = PATIENT.build(S, { neuro: true });
      const SH = SHEET.build(S, P, { from: 'foot' });
      bed.placePillow(P.headBack(), 7.15);
      const exM = { glove: CLAY.mat('#5a8fd8', '#3e73c3', { rough: 0.42, sheen: 0.25, streak: 0.5, freq: 2, tile: 0.8, bump: 0.45, lump: 0.006, lumpSize: 0.6 }), sleeve: CLAY.mat('#24636a', '#1d5359', { rough: 0.82, streak: 0.4, scale: 1.6, side: THREE.DoubleSide }) };
      const EX = { R: HANDS.examinerArm(S, exM, 'R'), L: HANDS.examinerArm(S, exM, 'L') };
      HOME.apply(P, EX, SH, 'cns');
      P.setFace({}); P.breathe(0);
      const FACE0 = { pupilR: 3.5, pupilL: 3.5 };      // normal pupils for the CNS video (README)
      // the instruments (shared/neuro-props.js): built after the home pieces so no shared seed moves
      const fork = PROPS.tuningFork(S, { hz: 512 });
      const torch = PROPS.penTorch(S, { power: 30 });
      fork.group.visible = false; torch.group.visible = false; torch.setOn(false);
      for (const m of C4.meshesUnder(fork.group).concat(C4.meshesUnder(torch.group))) { m.castShadow = true; m.receiveShadow = true; }

      // ------------------------------------------------------------ frames and landmarks
      P.group.updateMatrixWorld(true);
      const head = P.head, cranium = head.children.find((m) => m.name === 'cranium');
      const hX = () => V(1, 0, 0).transformDirection(head.matrixWorld), hY = () => V(0, 1, 0).transformDirection(head.matrixWorld), hZ = () => V(0, 0, 1).transformDirection(head.matrixWorld);
      const HX = hX(), HY = hY(), HZ = hZ();         // at rest: HX = his left (-Z), HY = toward the crown, HZ = where the face looks
      const headC = head.localToWorld(V(0, 0, 0));
      const NP0 = NEURO.points(P);
      const ears = head.children.filter((m) => m.isMesh && Math.abs(Math.abs(m.position.x) - 0.7) < 0.01);
      const rc = new THREE.Raycaster();
      const hitHead = (meshes, fromLocal, dirLocal) => {
        head.updateMatrixWorld(true);
        rc.set(head.localToWorld(fromLocal.clone()), dirLocal.clone().transformDirection(head.matrixWorld).normalize());
        const h = rc.intersectObjects(meshes, false)[0]; if (!h) return null;
        return { p: h.point.clone(), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize() };
      };
      // the ear canal opening: in the concha, just in front of the middle of the ear; a small dark opening (like the
      // nostrils) sits in it, below the skin surface so it blends in with no edge
      const canal = {};
      M_dark: {
        const dark = P.M && P.M.dark ? P.M.dark : null;
        for (const side of ['R', 'L']) {
          const sx = side === 'R' ? -1 : 1, ear = ears.filter((m) => Math.sign(m.position.x) === sx);
          const h = hitHead(ear, V(sx * 1.4, 0.0, 0.03), V(-sx, 0, 0));
          const axisOut = HX.clone().multiplyScalar(sx).addScaledVector(HZ, 0.18).normalize();   // the canal runs in and a little forward
          canal[side] = { p: h.p.clone(), out: axisOut };
          if (dark) {
            const g = CLAY.ellipsoid(0.03, 0.042, 0.03), m = new THREE.Mesh(g, dark); m.castShadow = false; m.receiveShadow = true;
            head.add(m); m.position.copy(head.worldToLocal(h.p.clone().addScaledVector(axisOut, -0.012)));
          }
        }
      }
      // the mastoid process: the bony bump just behind and below the ear (2 cm behind and 1.5 cm below the canal)
      const mastoid = {};
      for (const side of ['R', 'L']) {
        const sx = side === 'R' ? -1 : 1;
        const cl = head.worldToLocal(canal[side].p.clone());
        const h = hitHead([cranium], V(sx * 1.4, cl.y - 0.16, cl.z - 0.22), V(-sx, 0, 0));
        mastoid[side] = { p: h.p, n: h.n.clone().addScaledVector(HX.clone().multiplyScalar(sx), 0.4).normalize() };
      }
      const fore = { p: NP0.forehead.clone(), n: NP0.normals.forehead.clone() };

      // ------------------------------------------------------------ hands: poses
      const q = (f, d) => HANDS.quat(f, d);
      const POSE = {
        relaxed: { all: [0.22, 0.3, 0.18], spread: 0.3, thumb: [0.15, 0, 0.12, 0.08] },
        flat: { all: [0.04, 0.06, 0.03], spread: 0.25, thumb: [0.1, 0, 0.06, 0.04] },
        pinch: { curl: { index: [0.5, 0.75, 0.45], middle: [0.95, 1.25, 0.8], ring: [1.1, 1.35, 0.85], little: [1.2, 1.4, 0.85] }, spread: 0.25, thumb: [0.75, 0.55, 0.25, 0.15] },
        point: { curl: { index: [0.08, 0.12, 0.08], middle: [1.25, 1.45, 0.9], ring: [1.3, 1.5, 0.9], little: [1.3, 1.5, 0.9] }, spread: 0.3, thumb: [0.55, 0.45, 0.4, 0.3] },
      };
      const clonePose = (p) => JSON.parse(JSON.stringify(p));
      const exSolve = (side, st) => { const hand = EX[side].hand; hand.pose(st.pose); const w = HANDS.place(hand, st.contact, st.at, st.quat); return { wrist: w, quat: st.quat.clone(), pose: st.pose, back: (st.back || V(0, -0.3, 1)).clone().normalize() }; };
      const applyEx = (side, st) => HOME.applyEx(EX, side, st);
      const ST = { R: {}, L: {}, arm: {}, fork: {}, torch: {}, glass: {} };
      ST.R.rest = HOME.solveEx(EX, 'R', HOME.exRest('R', 'cns', SH));
      ST.L.rest = HOME.solveEx(EX, 'L', HOME.exRest('L', 'cns', SH));
      ST.arm.rest = { R: HOME.restArm('R', 'reclined45', SH), L: HOME.restArm('L', 'reclined45', SH) };
      // off frame: the right hand goes to the scrub pocket at his right side (low, toward the camera) and comes back
      // with an instrument; this place is never in frame of the close shots
      ST.R.pocket = exSolve('R', { contact: 'palm', at: V(-3.2, 8.6, 7.6), quat: q(V(-0.4, 0.5, -0.75), V(0.3, 0.6, 0.6)), pose: POSE.relaxed, back: V(0.2, -0.5, 1) });

      // ------------------------------------------------------------ instruments held in the right hand
      // A prop held in a pinch: solved once, stored as the prop's pose in the hand's own frame. While it is held, the
      // PROP is keyed and the hand follows it, so the grip never slips.
      const handOf = (side) => EX[side].hand;
      const meshesOf = (prop) => C4.meshesUnder(prop.group);
      const placeHandAt = (side, wrist, quat) => { const g = handOf(side).group; g.position.copy(wrist); g.quaternion.copy(quat); g.updateMatrixWorld(true); };
      function pinchGrip(prop, gripLocal, axisLocal, rollLocal, pose0) {
        // hand at a neutral place; the prop's +X runs along `axisLocal` (hand frame), its +Y along `rollLocal`
        const hand = handOf('R'), pose = clonePose(pose0);
        placeHandAt('R', V(0, 30, 0), Q());
        const toW = (v) => v.clone().transformDirection(hand.group.matrixWorld).normalize();
        const xW = toW(axisLocal), yW = toW(rollLocal);
        const put = () => { hand.pose(pose); hand.group.updateMatrixWorld(true); const mid = hand.world('thumbPad').add(hand.world('indexPad')).multiplyScalar(0.5); PROPS.place(prop, gripLocal, mid, xW, yW); };
        put();
        // close the index finger and the thumb onto the prop: each pad 0.5 mm from it
        for (let it = 0; it < 6; it++) {
          put();
          const Sx = C4.surface(meshesOf(prop), hand.world('indexPad'), 1.2);
          const gi = C4.gap(C4.parts(hand, 'indexTip'), Sx).gap, gt = C4.gap(C4.parts(hand, 'thumbTip'), Sx).gap;
          // shift the prop toward the farther pad, and bend both a little to close the remaining gap
          const pad = hand.world('indexPad').sub(hand.world('thumbPad')).normalize();
          prop.group.position.addScaledVector(pad, (gi - gt) / 2); prop.group.updateMatrixWorld(true);
          const ci = pose.curl.index; const k = ((gi + gt) / 2 - C4.TARGET) * 2.2;
          pose.curl.index = [ci[0] + k * 0.6, ci[1] + k, ci[2] + k * 0.6];
          pose.thumb = [pose.thumb[0] + k * 0.5, pose.thumb[1], pose.thumb[2] + k * 0.5, pose.thumb[3] + k * 0.6];
        }
        // the other fingers: curled into the palm, each bent just enough to stay clear of the prop
        put();
        const Sp = C4.surface(meshesOf(prop), hand.world('indexPad'), 1.2);
        for (const f of ['middle', 'ring', 'little']) {
          const base = pose.curl[f].slice(); let best = null;
          for (const k of [0, 0.1, 0.2, 0.3, 0.4, 0.5, -0.1, -0.2, -0.3, -0.45, -0.6]) {
            pose.curl[f] = base.map((v, i) => Math.max(0, v + k * [0.7, 1, 0.6][i])); hand.pose(pose); hand.group.updateMatrixWorld(true);
            const g = C4.gap(C4.parts(hand, f), Sp).gap;
            if (g >= C4.TARGET * 2) { best = pose.curl[f].slice(); break; }
          }
          pose.curl[f] = best || base;
        }
        hand.pose(pose); hand.group.updateMatrixWorld(true);
        const Sx = C4.surface(meshesOf(prop), hand.world('indexPad'), 1.2);
        const gaps = { index: C4.gap(C4.parts(hand, 'indexTip'), Sx).gap, thumb: C4.gap(C4.parts(hand, 'thumbTip'), Sx).gap, fingers: C4.gap(['middle', 'ring', 'little'].flatMap((f) => C4.parts(hand, f)), Sx).gap, palm: C4.gap(C4.parts(hand, 'palm'), Sx).gap };
        const rel = C4.relative(hand.group, prop.group.position, prop.group.quaternion);
        return { rel, pose, gaps };
      }
      // the 512 Hz fork held by its stem: pinched 3.2 cm from the foot, the stem across the pads, prongs above the hand
      const FORK_GRIP = pinchGrip(fork, V(0.3, 0, 0), V(-0.62, 0.78, 0.05), V(1, 0, 0), POSE.pinch);
      const TORCH_GRIP = pinchGrip(torch, V(0.75, 0, 0), V(0.62, -0.78, -0.05), V(0, 1, 0), POSE.pinch);
      // where the right hand must be for a prop pose {p, q}
      const handForProp = (G, pp) => {
        const hq = pp.q.clone().multiply(G.rel.q.clone().invert());
        const s = handOf('R').group.scale.x;
        const wrist = pp.p.clone().sub(G.rel.p.clone().multiplyScalar(s).applyQuaternion(hq));
        return { wrist, quat: hq, pose: G.pose };
      };
      const propForHand = (G, st) => { const s = handOf('R').group.scale.x; return { p: st.wrist.clone().add(G.rel.p.clone().multiplyScalar(s).applyQuaternion(st.quat)), q: st.quat.clone().multiply(G.rel.q) }; };
      const setProp = (prop, pp) => { prop.group.position.copy(pp.p); prop.group.quaternion.copy(pp.q); prop.group.updateMatrixWorld(true); };
      // a prop pose from a point on the prop placed at a world point, with its +X and +Y along given directions
      const propPose = (prop, local, at, xDir, yDir) => { PROPS.place(prop, local, at, xDir, yDir); return { p: prop.group.position.clone(), q: prop.group.quaternion.clone() }; };
      // slide a prop pose along `dir` until its smallest gap to the surface S is 0.5 mm (part = its meshes)
      const settleProp = (prop, pp, dir, S0, meshes) => {
        const p0 = pp.p.clone();
        C4.settle((d) => { prop.group.position.copy(p0).addScaledVector(dir, d); prop.group.updateMatrixWorld(true); }, () => C4.gap(meshes || meshesOf(prop), S0).gap);
        return { p: prop.group.position.clone(), q: pp.q.clone() };
      };
      const CONTACTS = [];      // every solved contact, for the review panels and the gap report
      const record = (name, meshes, S0, extra) => { const g = C4.gap(meshes, S0); CONTACTS.push(Object.assign({ name, gap: g.gap, at: g.at, on: g.on }, extra || {})); return g; };

      // ---- Rinne: the foot of the stem on each mastoid, then the prongs 2 cm from the ear canal, in line with it
      const forkFoot = () => meshesOf(fork).filter((m) => m.geometry.type === 'CylinderGeometry');
      const forkProngs = () => meshesOf(fork).filter((m) => m.parent !== fork.group);
      const skinS = (at, r) => C4.surface([cranium].concat(ears), at, r || 0.5);
      // fork turned about the stem so the examiner's hand sits on the side of the stem away from the head (Rinne R:
      // fingers toward his crown; L: the hand comes over the top of his head from his right)
      const onBone = (pt, rollDir, tilt = 0) => {
        const ax = pt.n.clone().addScaledVector(HY, tilt).normalize();
        const pp = propPose(fork, 'foot', pt.p.clone().addScaledVector(pt.n, 0.03), ax, rollDir);
        return settleProp(fork, pp, pt.n, skinS(pt.p, 0.4), forkFoot());
      };
      const rollFor = (side, tilt) => { const ax = mastoid[side].n.clone().addScaledVector(HY, tilt).normalize(); return new THREE.Vector3().crossVectors(canal[side].out, ax).normalize(); };
      ST.fork.mastR = onBone(mastoid.R, HZ.clone().multiplyScalar(-0.85).addScaledVector(HY, 0.2), 0.9);
      setProp(fork, ST.fork.mastR); record('Rinne R: foot of the stem on the right mastoid', forkFoot(), skinS(mastoid.R.p, 0.4), { group: 'b' });
      ST.fork.mastL = onBone(mastoid.L, HZ.clone().multiplyScalar(0.75).addScaledVector(HY, 0.65), 0.9);
      setProp(fork, ST.fork.mastL); record('Rinne L: foot of the stem on the left mastoid', forkFoot(), skinS(mastoid.L.p, 0.4), { group: 'b' });
      ST.fork.fore = onBone(fore, HX.clone().negate().addScaledVector(HY, 0.3));
      setProp(fork, ST.fork.fore); record('Weber: foot of the stem on the middle of the forehead', forkFoot(), skinS(fore.p, 0.4), { group: 'b' });
      // in the air: the fork upright beside the ear (stem toward his jaw, prongs toward his crown), the two prongs one
      // behind the other along the canal's axis, the near prong 2 cm from the opening, the middle of the prongs level with it
      const airAt = (side) => {
        const c = canal[side], up = HY.clone(), out = c.out.clone();
        const x = up.clone().addScaledVector(out, -up.dot(out)).normalize();
        // fork frame: +X along the fork (toward the prongs), +Z across the two prongs = along the canal axis
        const zW = out.clone(), yW = new THREE.Vector3().crossVectors(zW, x).normalize();
        const prongMid = fork.length * 0.72;                     // the part of the prongs held level with the canal
        const near = 0.2 + 0.03;                                 // 2 cm gap to the near prong's face, + half its width
        const yokeR = 0.105, centre = c.p.clone().addScaledVector(out, near + yokeR);
        return propPose(fork, V(prongMid, 0, 0), centre, x, yW);
      };
      ST.fork.airR = airAt('R'); ST.fork.airL = airAt('L');
      // the strike: the side of a prong comes down on the heel of the examiner's other (left) gloved hand, which is held
      // palm up in the air in front of him, at his right side (never on the patient)
      const strikeL = (at) => exSolve('L', { contact: 'palm', at, quat: q(V(-0.55, 0.1, -0.83), V(0.05, -1, 0.1)), pose: POSE.flat, back: V(0.35, -0.55, 1) });
      const heelOf = (hand) => { hand.group.updateMatrixWorld(true); return hand.body.localToWorld(V(0.14, -0.17, 0.1)); };
      const strikePose = (lst) => {
        applyEx('L', lst);
        const heel = heelOf(handOf('L')), S0 = C4.surface(C4.parts(handOf('L'), 'palm'), heel, 0.5);
        // fork upright-ish, prongs pointing away, the outer prong's flat side down onto the heel
        const xDir = V(-0.3, 0.25, -0.9).normalize(), yDir = V(0, 1, 0);
        PROPS.place(fork, fork.pts.prongTip.clone().setX(fork.length * 0.8), heel.clone().add(V(0, 0.08, 0)), xDir, yDir);
        const pp = { p: fork.group.position.clone(), q: fork.group.quaternion.clone() };
        const pp2 = settleProp(fork, pp, V(0, 1, 0), S0, forkProngs());
        return pp2;
      };
      ST.L.strike = strikeL(headC.clone().add(V(0, 0, 2.4)).addScaledVector(HZ, 1.6).addScaledVector(HY, -1.1));
      ST.fork.strike = strikePose(ST.L.strike);
      setProp(fork, ST.fork.strike); record('Strike: a prong on the heel of the left glove', forkProngs(), C4.surface(C4.parts(handOf('L'), 'palm'), heelOf(handOf('L')), 0.5), { group: 'b' });
      ST.L.strikeW = strikeL(V(-2.6, 12.2, 3.6));
      ST.fork.strikeW = strikePose(ST.L.strikeW);
      applyEx('L', ST.L.rest);
      ST.fork.pocket = propForHand(FORK_GRIP, ST.R.pocket);
      ST.torch.pocket = propForHand(TORCH_GRIP, ST.R.pocket);

      const BACK = { mastR: V(0.15, -0.85, 0.55), mastL: V(-0.25, 0.55, 1), fore: V(0.3, -0.45, 1), air: V(0.75, -0.65, 0.2), torch: V(0.2, -0.7, 0.8) };
      const withBack = (st, b) => Object.assign({}, st, { back: b.clone().normalize() });
      const forkHand = (pp, b) => withBack(handForProp(FORK_GRIP, pp), b);
      const torchHand = (pp, b) => withBack(handForProp(TORCH_GRIP, pp), b);
      // hand states for every fork pose (the fork is drawn from the hand while it is held)
      ST.R.mastR = forkHand(ST.fork.mastR, BACK.mastR);
      ST.R.mastL = forkHand(ST.fork.mastL, BACK.mastL);
      ST.R.fore = forkHand(ST.fork.fore, BACK.fore);
      ST.R.airR = forkHand(ST.fork.airR, BACK.air);
      ST.R.airL = forkHand(ST.fork.airL, BACK.mastL);
      ST.R.strike = forkHand(ST.fork.strike, V(0.3, -0.5, 1));
      ST.R.strikeW = forkHand(ST.fork.strikeW, V(0.3, -0.5, 1));
      // just before each strike the fork is lifted 4 cm above the heel; just off each bony point it hovers 1 cm away
      const offset = (st, d) => Object.assign({}, st, { wrist: st.wrist.clone().add(d) });
      ST.R.strikeUp = offset(ST.R.strike, V(0, 0.4, 0)); ST.R.strikeWUp = offset(ST.R.strikeW, V(0, 0.4, 0));
      ST.R.mastRoff = offset(ST.R.mastR, mastoid.R.n.clone().multiplyScalar(0.12));
      ST.R.mastLoff = offset(ST.R.mastL, mastoid.L.n.clone().multiplyScalar(0.12));
      ST.R.foreOff = offset(ST.R.fore, fore.n.clone().multiplyScalar(0.12));
      ST.R.pocketFork = withBack(ST.R.pocket, V(0.2, -0.5, 1)); ST.R.pocketFork.pose = FORK_GRIP.pose;
      ST.R.pocketTorch = withBack(ST.R.pocket, V(0.2, -0.5, 1)); ST.R.pocketTorch.pose = TORCH_GRIP.pose;
      // over his crown on the way to the left ear (the hand never passes in front of his face)
      ST.R.overHead = forkHand({ p: headC.clone().addScaledVector(HY, 1.25).addScaledVector(HZ, -0.2).add(V(0, 0, 0.1)), q: ST.fork.mastL.q.clone() }, BACK.mastL);

      // ---- the pen torch: the lens in front of and below his mouth, the beam into the back of the mouth
      const lips0 = P.anchor('lips');
      const mouthBack = lips0.clone().addScaledVector(HZ, -0.38).addScaledVector(HY, 0.03);
      const torchAt = (d, down, side) => { const lens = lips0.clone().addScaledVector(HZ, d).addScaledVector(HY, -down).add(V(0, 0, side)); const x = mouthBack.clone().sub(lens).normalize(); return propPose(torch, 'lens', lens, x, HY.clone()); };
      ST.torch.ah = torchAt(0.85, 0.55, 0.62);
      ST.torch.rest9 = torchAt(0.8, 0.5, 0.6);
      ST.R.torchAh = torchHand(ST.torch.ah, BACK.torch);
      ST.R.torch9 = torchHand(ST.torch.rest9, BACK.torch);
      const skinAll = (at, r) => { const ms = []; P.group.traverse((m) => { if (m.isMesh && m.visible) ms.push(m); }); return C4.surface(ms, at, r || 0.8); };
      applyEx('R', ST.R.torchAh); setProp(torch, propForHand(TORCH_GRIP, ST.R.torchAh));
      CONTACTS.push({ name: 'Pen torch: the hand stays clear of his face (clearance, not a contact)', gap: C4.gap(C4.parts(handOf('R'), 'hand'), skinAll(lips0, 3), { near: 3 }).gap, clearance: true, group: 'c' });

      // ---- shrug: both palms flat on the tops of his shoulders (trapezius), fingers together, pressing down
      const torsoMesh = P.torsoMesh;
      const tFrame = () => { P.torso.updateMatrixWorld(true); const m = P.torso.matrixWorld; return { up: V(0, 1, 0).transformDirection(m), front: V(0, 0, 1).transformDirection(m) }; };
      const shoulderTop = (x) => { const F = tFrame(); rc.set(P.torso.localToWorld(V(x, 7.5, 0.05)), F.up.clone().negate()); const h = rc.intersectObject(torsoMesh, false)[0]; return { p: h.point.clone(), n: h.face.normal.clone().transformDirection(torsoMesh.matrixWorld).normalize() }; };
      const trunkS = (at, r) => { const ms = []; P.group.traverse((m) => { if (m.isMesh && m.visible) { let o = m, inHead = false; while (o) { if (o === head) inHead = true; o = o.parent; } if (!inHead) ms.push(m); } }); return C4.surface(ms, at, r || 1.4); };
      // a gloved hand laid on the skin: the palm settled to 0.5 mm, then each finger bent until it rests on the skin
      const layHand = (side, contact, at, n, fingerDir, base, surfFn, back) => {
        const hand = handOf(side), pose = clonePose(base), quat = q(fingerDir.clone().addScaledVector(n, -fingerDir.dot(n)).normalize(), n);
        const S0 = surfFn(at, 1.4);
        hand.pose(pose); HANDS.place(hand, contact, at.clone().addScaledVector(n, 0.15), quat);
        const w0 = hand.group.position.clone();
        const part = contact === 'palm' ? C4.parts(hand, 'palm') : C4.parts(hand, contact.replace('Pad', 'Tip'));
        C4.settle((d) => { hand.group.position.copy(w0).addScaledVector(n, d); hand.group.updateMatrixWorld(true); }, () => C4.gap(part, S0).gap);
        if (contact === 'palm') for (let pass = 0; pass < 2; pass++) {
          for (const f of ['index', 'middle', 'ring', 'little']) C4.curlTo(hand, pose, f, S0, { lo: -0.5, hi: 1.2 });
          C4.thumbTo(hand, pose, S0, { lo: -0.3, hi: 1.0 });
          const w1 = hand.group.position.clone();
          C4.settle((d) => { hand.group.position.copy(w1).addScaledVector(n, d); hand.group.updateMatrixWorld(true); }, () => C4.gap(part, S0).gap);
        }
        if (contact === 'palm') { for (const f of ['index', 'middle', 'ring', 'little']) C4.curlTo(hand, pose, f, S0, { lo: -0.5, hi: 1.8 }); C4.thumbTo(hand, pose, S0, { lo: -0.6, hi: 1.0 }); }
        hand.pose(pose); hand.group.updateMatrixWorld(true);
        return { st: { wrist: hand.group.position.clone(), quat, pose, back: back.clone().normalize() }, S0 };
      };
      const shPose = { all: [0.1, 0.12, 0.08], spread: 0.2, thumb: [0.15, 0, 0.1, 0.05] };
      const shrugHands = (u) => {
        P.setShrug(u);
        const out = {};
        for (const [hs, x, b] of [['R', -1.35, V(-0.2, 0.55, 1)], ['L', 1.05, V(0.45, 0.05, 1)]]) {
          const top = shoulderTop(x), r = layHand(hs, 'palm', top.p, top.n, V(0, 0, -1), shPose, trunkS, b);
          out[hs] = r.st;
          applyEx(hs, r.st);
          if (u === 0 || u === 1) for (const part of ['palm', 'index', 'middle', 'ring', 'little', 'thumb']) record(`Shrug ${u ? 'up' : 'start'}: examiner ${hs} ${part} on his ${hs === 'R' ? 'right' : 'left'} shoulder`, C4.parts(handOf(hs), part), r.S0, { group: 'd', part, side: hs, shrug: u });
        }
        P.setShrug(0);
        return out;
      };
      ST.shrug0 = shrugHands(0); ST.shrug1 = shrugHands(1);
      applyEx('R', ST.R.rest); applyEx('L', ST.L.rest);

      // ---- head turning: the examiner's palm against the side of his chin and jaw (follows the head as it turns)
      const NPa = NEURO.points(P);
      const jawHand = (hs, side) => {
        const at = NPa['V3_' + side].clone(), n = NPa.normals['V3_' + side].clone();
        const r = layHand(hs, 'palm', at, n, HY.clone().addScaledVector(HZ, -0.35), shPose, (a, rr) => C4.surface([cranium], a, rr), hs === 'R' ? V(0.2, -0.75, 0.7) : V(0.6, -0.3, 0.8));
        applyEx(hs, r.st);
        for (const part of ['palm', 'index', 'middle', 'ring', 'little']) record(`Head turn: examiner ${hs} ${part} on the ${side === 'R' ? 'right' : 'left'} side of his chin and jaw`, C4.parts(handOf(hs), part), r.S0, { group: 'd', part, side });
        applyEx(hs, ST[hs].rest);
        return { rel: C4.relative(head, r.st.wrist, r.st.quat), pose: r.st.pose, back: r.st.back };
      };
      ST.jawR = jawHand('R', 'R'); ST.jawL = jawHand('L', 'L');
      // ---- tongue into each cheek: the pad of the examiner's index finger on the outside of the bulge
      const posA = cranium.geometry.attributes.position;
      const bulgeAt = (side) => {
        const rest = Float32Array.from(posA.array);
        P.setFace(side === 'R' ? { cheekR: 1 } : { cheekL: 1 }); head.updateMatrixWorld(true);
        let best = -1, bd = 0; for (let i = 0; i < posA.count; i++) { const d = Math.hypot(posA.array[3 * i] - rest[3 * i], posA.array[3 * i + 1] - rest[3 * i + 1], posA.array[3 * i + 2] - rest[3 * i + 2]); if (d > bd) { bd = d; best = i; } }
        const p = V(posA.getX(best), posA.getY(best), posA.getZ(best)).applyMatrix4(cranium.matrixWorld), n = V(0, 0, 0).fromBufferAttribute(cranium.geometry.attributes.normal, best).transformDirection(cranium.matrixWorld).normalize();
        return { p, n, bulge: bd };
      };
      const cheekHand = (hs, side) => {
        const b = bulgeAt(side);
        const r = layHand(hs, 'indexPad', b.p, b.n, HZ.clone().multiplyScalar(0.8).add(V(0, 0, side === 'R' ? -0.6 : 0.6)).addScaledVector(HY, 0.15), POSE.point, (a, rr) => C4.surface([cranium], a, rr), hs === 'R' ? V(-0.2, -0.7, 1) : V(0.5, -0.8, 0.5));
        applyEx(hs, r.st);
        record(`Cheek ${side}: pad of the examiner's index finger on the bulge`, C4.parts(handOf(hs), 'indexTip'), r.S0, { group: 'e', side });
        CONTACTS.push({ name: `Cheek ${side}: the other fingers clear of his face (clearance)`, gap: C4.gap(['middle', 'ring', 'little', 'thumb'].flatMap((f) => C4.parts(handOf(hs), f)), r.S0).gap, clearance: true, group: 'e' });
        applyEx(hs, ST[hs].rest); P.setFace({});
        return { rel: C4.relative(head, r.st.wrist, r.st.quat), pose: r.st.pose, back: r.st.back, bulge: b };
      };
      ST.cheekR = cheekHand('R', 'R'); ST.cheekL = cheekHand('L', 'L');
      const fromHead = (h) => { const r = C4.resolve(h.rel); return { wrist: r.p, quat: r.q, pose: h.pose, back: h.back }; };

      // ---- the water: the glass stands on the bedside table on his LEFT; he reaches for it with his left hand
      const glass = table.glass, water = table.water;
      const G0 = { p: glass.position.clone(), q: glass.quaternion.clone() };
      const setGlass = (gp, level = 1) => { glass.position.copy(gp.p); glass.quaternion.copy(gp.q); water.quaternion.copy(gp.q); water.scale.set(1, level, 1); water.position.copy(gp.p).add(V(0, 0.16 + 0.45 * level, 0).applyQuaternion(gp.q)); glass.updateMatrixWorld(true); water.updateMatrixWorld(true); };
      const glassS = (at) => C4.surface([glass], at, 1.6);
      // his left hand round the glass: palm on the side nearest him, fingers round the front, thumb round the back
      const pH = P.arms.L.hand, gripPose = { all: [0.35, 0.45, 0.3], spread: 0.25, thumb: [0.55, 0.5, 0.25, 0.2] };
      const GRIP = (() => {
        setGlass(G0);
        const at = glass.localToWorld(V(0, 0.7, 0.5)), n = V(0, 0, 1);
        let fd = V(1, 0, 0);
        pH.pose(gripPose); HANDS.place(pH, 'palm', at, q(fd, n));
        if (pH.world('thumbTip').y < pH.world('palm').y) fd = V(-1, 0, 0);
        const pose = clonePose(gripPose), quat = q(fd, n), S0 = glassS(at);
        pH.pose(pose); HANDS.place(pH, 'palm', at.clone().addScaledVector(n, 0.15), quat);
        const w0 = pH.group.position.clone();
        C4.settle((d) => { pH.group.position.copy(w0).addScaledVector(n, d); pH.group.updateMatrixWorld(true); }, () => C4.gap(C4.parts(pH, 'palm'), S0).gap);
        for (let pass = 0; pass < 2; pass++) {
          for (const f of ['index', 'middle', 'ring', 'little']) C4.curlTo(pH, pose, f, S0, { lo: 0, hi: 1.9 });
          C4.thumbTo(pH, pose, S0, { lo: -0.8, hi: 1.3 });
          const w1 = pH.group.position.clone();
          C4.settle((d) => { pH.group.position.copy(w1).addScaledVector(n, d); pH.group.updateMatrixWorld(true); }, () => C4.gap(C4.parts(pH, 'palm'), S0).gap);
        }
        for (const f of ['index', 'middle', 'ring', 'little']) C4.curlTo(pH, pose, f, S0, { lo: -0.3, hi: 1.9 });
        C4.thumbTo(pH, pose, S0, { lo: -0.8, hi: 1.3 });
        pH.pose(pose); pH.group.updateMatrixWorld(true);
        for (const part of ['palm', 'index', 'middle', 'ring', 'little', 'thumb']) record(`Glass: his left ${part} on the glass`, C4.parts(pH, part), S0, { group: 'f', part });
        return { wl: glass.worldToLocal(pH.group.position.clone()), ql: G0.q.clone().invert().multiply(quat), pose };
      })();
      const armForGlass = (gp, pole) => { const w = gp.p.clone().add(GRIP.wl.clone().applyQuaternion(gp.q)), qq = gp.q.clone().multiply(GRIP.ql); return { wrist: w, quat: qq, pose: GRIP.pose, pole: (pole || V(0.2, -1, -0.6)).normalize() }; };
      // the glass at his lips: tilted toward his mouth, the rim resting on his lower lip
      const lowerLip = head.children.find((m) => m.name === 'lower-lip');
      const glassAt = (tilt, out = 0) => {
        const toMouth = HZ.clone().negate(), axis = V(0, 1, 0).multiplyScalar(Math.cos(tilt)).addScaledVector(toMouth, Math.sin(tilt)).normalize();
        const X = toMouth.clone().addScaledVector(axis, -toMouth.dot(axis)).normalize(), Z = new THREE.Vector3().crossVectors(X, axis);
        const qq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, axis, Z));
        const rimLocal = V(0.52, 1.43, 0), lip = lips0.clone().addScaledVector(HY, -0.05).addScaledVector(HZ, 0.03);
        const p = lip.clone().sub(rimLocal.clone().applyQuaternion(qq)).addScaledVector(HZ, 0.1);
        setGlass({ p, q: qq });
        const S0 = C4.surface([lowerLip, cranium], lip, 0.8), p0 = p.clone();
        C4.settle((d) => { glass.position.copy(p0).addScaledVector(HZ, d); glass.updateMatrixWorld(true); }, () => C4.gap([glass], S0).gap);
        const gp = { p: glass.position.clone().addScaledVector(HZ, out), q: qq };
        return { gp, S0 };
      };
      { const r = glassAt(0.5); setGlass(r.gp); ST.glass.lips = r.gp; record('Glass: the rim on his lower lip', [glass], r.S0, { group: 'f' }); }
      ST.glass.sip = glassAt(0.68).gp;
      ST.glass.off = glassAt(0.42, 0.25).gp;
      ST.glass.table = G0;
      ST.glass.lift = { p: V(-3.9, 10.4, -3.4), q: G0.q.clone() };
      ST.glass.table_up = { p: G0.p.clone().add(V(0, 0.35, 0)), q: G0.q.clone() };
      setGlass(G0);
      root.CNS4_WORLD = Object.assign(root.CNS4_WORLD || {}, { S, P, SH, EX, fork, torch, bed, table, ST, L, canal, mastoid, fore, CONTACTS, FORK_GRIP, TORCH_GRIP, GRIP, handForProp, setProp, applyEx, head, cranium, C4, setGlass, armForGlass, fromHead, T, BEATS, CAPTIONS });

      // ================================================================ timelines (all on the pose clock)
      const lerpEx = (a, b, u) => ({ wrist: a.wrist.clone().lerp(b.wrist, u), quat: a.quat.clone().slerp(b.quat, u), pose: blendPose(a.pose, b.pose, u), back: a.back.clone().lerp(b.back, u).normalize() });
      const PK = ['index', 'middle', 'ring', 'little'];
      function blendPose(a, b, u) {
        if (a === b) return a;
        const ca = (p, k) => (p.curl && p.curl[k]) || p.all || [0.12, 0.18, 0.1];
        const curl = {}; for (const k of PK) curl[k] = ca(a, k).map((v, i) => K.lerp(v, ca(b, k)[i], u));
        const ta = a.thumb || [0.15, 0, 0.12, 0.08], tb = b.thumb || [0.15, 0, 0.12, 0.08];
        return { curl, spread: K.lerp(a.spread == null ? 1 : a.spread, b.spread == null ? 1 : b.spread, u), thumb: ta.map((v, i) => K.lerp(v, tb[i], u)) };
      }
      // keys: [time, state or (tp) => state, { arc: V3 (a lift in the middle of the move into this key), relax }]
      const keyed = (keys, lerp) => (tp) => {
        let i = 0; while (i < keys.length - 1 && keys[i + 1][0] <= tp) i++;
        const val = (k) => (typeof keys[k][1] === 'function' ? keys[k][1](tp) : keys[k][1]);
        if (i === keys.length - 1) return val(i);
        const a = val(i), b = val(i + 1); if (a === b) return a;
        const t0 = keys[i][0], t1 = keys[i + 1][0], o = keys[i + 1][2] || {};
        const u = K.ease.inOut(K.clamp((tp - t0) / (t1 - t0)));
        const s = lerp(a, b, u);
        if (o.arc && s.wrist) s.wrist.addScaledVector(o.arc, Math.sin(Math.PI * u));
        if (o.relax && s.pose) s.pose = blendPose(s.pose, POSE.relaxed, Math.sin(Math.PI * u) * o.relax);
        return s;
      };
      const R = ST.R, Lh = ST.L, up = (y, z) => V(0, y, z || 0);
      const R_KEYS = [
        [0, R.rest], [T.toRinne[1], R.rest],
        [T.forkIn[0], R.rest], [T.forkIn[0] + 0.35, R.pocketFork, { relax: 1 }], [T.forkIn[1], R.strikeUp, { arc: up(0.6, 0.6) }], [T.strike1, R.strike], [T.toMastR[0] + 0.15, R.strikeUp],
        [T.toMastR[1] - 0.25, R.mastRoff, { arc: up(0.4, 0.6) }], [T.onMastR[0], R.mastR], [T.onMastR[1], R.mastR], [T.toAirR[1], R.airR, { arc: mastoid.R.n.clone().multiplyScalar(0.3) }], [T.airR[1], R.airR],
        [T.strike2 - 0.3, R.strikeUp, { arc: up(0.3, 0.4) }], [T.strike2, R.strike], [T.strike2 + 0.2, R.strikeUp], [T.toMastL[0] + 0.55, R.overHead, { arc: up(0.6, 0) }], [T.toMastL[1] - 0.2, R.mastLoff], [T.onMastL[0], R.mastL], [T.onMastL[1], R.mastL],
        [T.toAirL[1], R.airL, { arc: mastoid.L.n.clone().multiplyScalar(0.3) }], [T.airL[1], R.airL], [T.forkOut[0] + 0.5, R.overHead, { arc: up(0.4, 0) }], [T.forkOut[1], R.pocketFork, { arc: up(0.5, 0.8) }], [T.forkOut[1] + 0.3, R.rest, { relax: 1 }],
        // Weber
        [T.forkIn3[0], R.rest], [T.forkIn3[0] + 0.3, R.pocketFork, { relax: 1 }], [T.forkIn3[1], R.strikeWUp, { arc: up(0.5, 0.5) }], [T.strike3, R.strikeW], [T.toFore[0], R.strikeWUp],
        [T.toFore[1] - 0.2, R.foreOff, { arc: up(0.4, 0.3) }], [T.onFore[0], R.fore], [T.onFore[1], R.fore], [T.forkOut3[0] + 0.6, R.pocketFork, { arc: up(0.5, 0.6) }], [T.forkOut3[1], R.rest, { relax: 1 }],
        // the torch, twice
        [T.torchIn[0], R.rest], [T.torchIn[0] + 0.25, R.pocketTorch, { relax: 1 }], [T.torchIn[1], R.torchAh, { arc: up(0.5, 0.4) }], [T.torchOut[0], R.torchAh], [T.torchOut[1] - 0.3, R.pocketTorch, { arc: up(0.4, 0.4) }], [T.torchOut[1], R.rest, { relax: 1 }],
        // shrug, head turn (right side), cheeks
        [T.handsOnSh[0], R.rest], [T.handsOnSh[1], (tp) => lerpEx(ST.shrug0.R, ST.shrug1.R, shrugAt(tp)), { arc: up(0.8, 0.8), relax: 0.6 }], [T.handsOffSh[0], (tp) => lerpEx(ST.shrug0.R, ST.shrug1.R, shrugAt(tp))], [T.handsOffSh[1], R.rest, { arc: up(0.8, 0.8), relax: 0.6 }],
        [T.palmR[0], R.rest], [T.palmR[1], () => fromHead(ST.jawR), { arc: up(0.6, 1.0), relax: 0.6 }], [T.turnRBack[1], () => fromHead(ST.jawR)], [T.palmMove[1], R.rest, { arc: up(0.6, 1.0), relax: 0.6 }],
        [T.torchIn9[0], R.rest], [T.torchIn9[0] + 0.25, R.pocketTorch, { relax: 1 }], [T.torchIn9[1], R.torch9, { arc: up(0.5, 0.4) }], [T.torchOut9[0], R.torch9], [T.torchOut9[1] - 0.3, R.pocketTorch, { arc: up(0.4, 0.4) }], [T.torchOut9[1], R.rest, { relax: 1 }],
        [T.fingerR[0] - 0.6, R.rest], [T.fingerR[1], () => fromHead(ST.cheekR), { arc: up(0.6, 0.9), relax: 0.6 }], [T.offR[0], () => fromHead(ST.cheekR)], [T.offR[1] + 0.6, R.rest, { arc: up(0.6, 0.9), relax: 0.6 }],
        [D, R.rest],
      ];
      const L_KEYS = [
        [0, Lh.rest], [T.forkIn[1] - 0.4, Lh.rest], [T.strike1 - 0.1, Lh.strike, { arc: up(0.6, 0.6), relax: 0.6 }], [T.strike1 + 0.15, Lh.strike], [T.toMastR[1], Lh.rest, { arc: up(0.6, 0.6), relax: 0.6 }],
        [T.strike2 - 0.6, Lh.rest], [T.strike2 - 0.1, Lh.strike, { arc: up(0.5, 0.5), relax: 0.6 }], [T.strike2 + 0.15, Lh.strike], [T.toMastL[1], Lh.rest, { arc: up(0.5, 0.5), relax: 0.6 }],
        [T.strike3 - 0.6, Lh.rest], [T.strike3 - 0.1, Lh.strikeW, { arc: up(0.6, 0.5), relax: 0.6 }], [T.strike3 + 0.15, Lh.strikeW], [T.toFore[1], Lh.rest, { arc: up(0.6, 0.5), relax: 0.6 }],
        [T.handsOnSh[0], Lh.rest], [T.handsOnSh[1], (tp) => lerpEx(ST.shrug0.L, ST.shrug1.L, shrugAt(tp)), { arc: up(0.9, 1.0), relax: 0.6 }], [T.handsOffSh[0], (tp) => lerpEx(ST.shrug0.L, ST.shrug1.L, shrugAt(tp))], [T.handsOffSh[1], Lh.rest, { arc: up(0.9, 1.0), relax: 0.6 }],
        [T.palmMove[0], Lh.rest], [T.palmMove[1], () => fromHead(ST.jawL), { arc: up(0.6, 0.8), relax: 0.6 }], [T.turnLBack[1], () => fromHead(ST.jawL)], [T.palmOff[1], Lh.rest, { arc: up(0.6, 0.8), relax: 0.6 }],
        [T.fingerL[0] - 0.5, Lh.rest], [T.fingerL[1], () => fromHead(ST.cheekL), { arc: up(0.6, 0.8), relax: 0.6 }], [T.offL[0], () => fromHead(ST.cheekL)], [T.handsHome[1], Lh.rest, { arc: up(0.6, 0.8), relax: 0.6 }],
        [D, Lh.rest],
      ];
      const lerpGlass = (a, b, u) => ({ p: a.p.clone().lerp(b.p, u), q: a.q.clone().slerp(b.q, u) });
      const G = ST.glass;
      const GLASS_KEYS = [
        [0, G.table], [T.grasp, G.table], [T.grasp + 0.25, G.table_up], [T.lift[1] - 0.45, G.lift, { arc: up(0.5, 0) }], [T.lift[1], G.off], [T.sip1[0] + 0.25, G.lips], [T.sip1[1], G.sip], [T.swallow1[0] + 0.15, G.off],
        [T.sip2[0] + 0.25, G.lips], [T.sip2[1], G.sip], [T.swallow2[0] + 0.15, G.off], [T.lower[1], G.off], [T.back[0] + 0.55, G.lift], [T.back[1] - 0.25, G.table_up, { arc: up(0.5, 0) }], [T.setDown, G.table], [D, G.table],
      ];
      const glassAtT = keyed(GLASS_KEYS, lerpGlass);
      const level = (tp) => 1 - 0.07 * seg(tp, T.sip1) - 0.07 * seg(tp, T.sip2);
      const holdsGlass = (tp) => tp >= T.grasp && tp < T.setDown;
      const armL = (tp) => {
        const rest = ST.arm.rest.L;
        if (holdsGlass(tp)) return armForGlass(glassAtT(tp));
        const grab = armForGlass(G.table, V(0.2, -1, -0.8));
        if (tp >= T.reach[0] && tp < T.grasp) { const u = seg(tp, T.reach); const s = { wrist: rest.wrist.clone().lerp(grab.wrist, u).add(V(0, 0.7 * Math.sin(Math.PI * u), 0)), quat: rest.quat.clone().slerp(grab.quat, u), pose: blendPose(rest.pose, grab.pose, u), pole: rest.pole.clone().lerp(grab.pole, u).normalize() }; return s; }
        if (tp >= T.setDown && tp < T.release[1]) { const u = seg(tp, T.release); return { wrist: grab.wrist.clone().lerp(rest.wrist, u).add(V(0, 0.7 * Math.sin(Math.PI * u), 0)), quat: grab.quat.clone().slerp(rest.quat, u), pose: blendPose(grab.pose, rest.pose, u), pole: grab.pole.clone().lerp(rest.pole, u).normalize() }; }
        return rest;
      };
      const exR = keyed(R_KEYS, lerpEx), exL = keyed(L_KEYS, lerpEx);
      const holds = (tp) => (tp > T.forkIn[0] + 0.35 && tp < T.forkOut[1]) || (tp > T.forkIn3[0] + 0.3 && tp < T.forkOut3[0] + 0.6) ? 'fork'
        : (tp > T.torchIn[0] + 0.25 && tp < T.torchOut[1] - 0.3) || (tp > T.torchIn9[0] + 0.25 && tp < T.torchOut9[1] - 0.3) ? 'torch' : null;
      const torchOn = (tp) => (tp >= T.torchOn && tp < T.torchOff) || (tp >= T.torchOn9 && tp < T.torchOff9);
      // the patient
      function shrugAt(tp) { return seg(tp, T.shrug) * (1 - seg(tp, T.shrugDown)); }
      const turnAt = (tp) => 22 * seg(tp, T.turnR) * (1 - seg(tp, T.turnRBack)) - 22 * seg(tp, T.turnL) * (1 - seg(tp, T.turnLBack));
      const visemeAt = (tp) => { for (const [t0, list] of SPEECH) { const k = Math.floor((tp - t0) / VIS_DUR + 1e-6); if (k >= 0 && k < list.length) return list[k]; } return null; };
      const faceAt = (tp) => {
        const f = Object.assign({}, FACE0);
        const vis = visemeAt(tp); if (vis && vis !== 'rest') f.viseme = vis;
        const a4 = seg(tp, T.open) * (1 - seg(tp, T.close)), a9 = seg(tp, T.open9) * (1 - seg(tp, T.close9));
        if (a4 > 0.02) { f.ah = 0.02 + 0.98 * seg(tp, T.ah) * (1 - seg(tp, T.close)); f.jaw = 1.6 * a4; }
        if (a9 > 0.02) { f.ah = 0.02; f.jaw = 1.6 * a9; }
        if (inWin(tp, T.cough)) f.cough = bump(tp, T.cough);
        if (inWin(tp, T.swallow1)) f.swallow = seg(tp, T.swallow1, (u) => u);
        if (inWin(tp, T.swallow2)) f.swallow = seg(tp, T.swallow2, (u) => u);
        if (inWin(tp, [T.sip1[0], T.sip1[1]]) || inWin(tp, [T.sip2[0], T.sip2[1]])) f.round = 0.5;
        const tOut = seg(tp, T.tongueOut) * (1 - seg(tp, T.tongueIn)); if (tOut > 0.01) { f.tongue = tOut; f.jaw = Math.max(f.jaw || 0, 0.55 * tOut); }
        const cR = seg(tp, T.cheekR) * (1 - seg(tp, T.offR)), cL = seg(tp, T.cheekL) * (1 - seg(tp, T.offL));
        if (cR > 0.01) f.cheekR = cR; if (cL > 0.01) f.cheekL = cL;
        return f;
      };
      const ringAt = (tp) => (holds(tp) === 'fork' ? ring(tp) : 0);

      // ================================================================ cameras: one object per shot, used by the storyboard too
      const NPx = NEURO.points(P), earR = canal.R.p, earL = canal.L.p, mR = mastoid.R.p, mL = mastoid.L.p;
      const neckF = P.torso.localToWorld(V(0, 5.45, 0.5));
      const fromDir = (at, dirs, dist) => { const d = V(0, 0, 0); for (const [v, k] of dirs) d.addScaledVector(v, k); return at.clone().addScaledVector(d.normalize(), dist).toArray(); };
      const Z = V(0, 0, 1), UPW = V(0, 1, 0);
      const CAM = {
        home: Object.assign({}, SET.HOME_CNS),
        headWide: { pos: fromDir(headC, [[HZ, 0.85], [Z, 0.5], [UPW, 0.2]], 14), target: headC.clone().addScaledVector(HY, -1.3).addScaledVector(HZ, 0.3).toArray(), fov: 28, focus: headC.toArray(), aperture: 0.03 },
        rinneR: { pos: fromDir(mR.clone().lerp(earR, 0.5), [[Z, 0.75], [HZ, 0.6], [HY, 0.2]], 6.6), target: mR.clone().lerp(earR, 0.5).addScaledVector(Z, 0.35).addScaledVector(HY, 0.1).toArray(), fov: 28, focus: mR.toArray(), aperture: 0.006 },
        rinneRm: { pos: fromDir(mR, [[Z, 0.72], [HZ, 0.6], [HY, 0.3]], 6.6), target: mR.clone().addScaledVector(Z, 0.3).addScaledVector(HY, 0.15).addScaledVector(HZ, 0.3).toArray(), fov: 28, focus: mR.toArray(), aperture: 0.006 },
        rinneL: { pos: fromDir(mL.clone().lerp(earL, 0.5), [[Z, -0.8], [HZ, 0.55], [HY, 0.25]], 7.2), target: mL.clone().lerp(earL, 0.5).addScaledVector(Z, -0.35).addScaledVector(HY, 0.15).toArray(), fov: 28, focus: mL.toArray(), aperture: 0.006 },
        weber: { pos: fromDir(fore.p, [[HZ, 0.85], [Z, -0.45], [HY, 0.12]], 7.0), target: fore.p.clone().addScaledVector(HY, -0.5).addScaledVector(Z, 0.15).toArray(), fov: 28, focus: fore.p.toArray(), aperture: 0.008 },
        mouth: { pos: fromDir(lips0, [[HZ, 1], [HY, -0.2], [Z, -0.12]], 3.0), target: lips0.clone().addScaledVector(HZ, -0.2).addScaledVector(HY, 0.0).toArray(), fov: 28, focus: lips0.clone().addScaledVector(HZ, -0.15).toArray(), aperture: 0.003 },
        cough: { pos: fromDir(headC, [[HZ, 0.8], [Z, 0.55], [HY, -0.15]], 9.5), target: headC.clone().addScaledVector(HY, -1.5).addScaledVector(HZ, 0.4).toArray(), fov: 28, focus: lips0.toArray(), aperture: 0.015 },
        table: { pos: [0.5, 19.5, 6.5], target: [-4.6, 9.4, -4.4], fov: 28, focus: [-4.3, 9.0, -4.6], aperture: 0.03 },
        drink: { pos: fromDir(neckF, [[Z, 0.92], [HZ, 0.35], [UPW, 0.1]], 6.2), target: neckF.clone().addScaledVector(HY, 0.45).addScaledVector(HZ, 0.35).toArray(), fov: 28, focus: neckF.clone().addScaledVector(HY, 0.4).toArray(), aperture: 0.008 },
        shrug: { pos: fromDir(neckF, [[HZ, 0.55], [UPW, 0.85], [Z, 0.12]], 11.5), target: neckF.clone().addScaledVector(HY, 0.1).toArray(), fov: 28, focus: neckF.toArray(), aperture: 0.015 },
        turn: { pos: fromDir(neckF, [[HZ, 1], [HY, -0.08], [Z, 0.12]], 8.6), target: neckF.clone().addScaledVector(HY, 0.55).toArray(), fov: 28, focus: neckF.toArray(), aperture: 0.012 },
        tongue9: { pos: fromDir(lips0, [[HZ, 1], [HY, -0.08], [Z, -0.12]], 2.9), target: lips0.clone().addScaledVector(HZ, -0.15).addScaledVector(HY, -0.08).toArray(), fov: 28, focus: lips0.clone().addScaledVector(HZ, -0.12).toArray(), aperture: 0.003 },
        tongueOut: { pos: fromDir(lips0, [[HZ, 1], [HY, 0.1], [Z, 0.12]], 3.9), target: lips0.clone().addScaledVector(HY, -0.12).toArray(), fov: 28, focus: lips0.clone().addScaledVector(HZ, 0.1).toArray(), aperture: 0.005 },
        cheekR: { pos: fromDir(lips0, [[HZ, 0.85], [Z, 0.5], [HY, 0.15]], 5.6), target: lips0.clone().addScaledVector(Z, 0.3).addScaledVector(HY, 0.05).toArray(), fov: 28, focus: ST.cheekR.bulge.p.toArray(), aperture: 0.006 },
        cheekL: { pos: fromDir(lips0, [[HZ, 0.85], [Z, -0.5], [HY, 0.15]], 5.6), target: lips0.clone().addScaledVector(Z, -0.3).addScaledVector(HY, 0.05).toArray(), fov: 28, focus: ST.cheekL.bulge.p.toArray(), aperture: 0.006 },
      };
      const CAM_KEYS = [
        [0, 'home'], [HOME_HOLD, 'home'], [T.push[1], 'headWide'], [T.toRinne[1], 'rinneRm'], [T.toAirR[0], 'rinneRm'], [T.toAirR[1] + 0.1, 'rinneR'], [T.camL[0], 'rinneR'], [T.camL[1], 'rinneL'], [T.forkOut[0], 'rinneL'],
        [T.toWeber[1], 'weber'], [T.toMouth[0], 'weber'], [T.toMouth[1], 'mouth'], [T.toCough[0], 'mouth'], [T.toCough[1], 'cough'], [T.toDrink[0], 'cough'], [T.toDrink[1], 'drink'],
        [T.camTable[0], 'drink'], [T.camTable[1], 'table'], [T.camSide[0], 'table'], [T.camSide[1], 'drink'], [T.camBack6[0], 'drink'], [T.camBack6[1], 'table'], [T.toShrug[0], 'table'], [T.toShrug[1], 'shrug'],
        [T.toTurn[0], 'shrug'], [T.toTurn[1], 'turn'], [T.toRest9[0], 'turn'], [T.toRest9[1], 'tongue9'], [T.toOut[0], 'tongue9'], [T.toOut[1], 'tongueOut'], [T.toCheek[0], 'tongueOut'], [T.toCheek[1], 'cheekR'],
        [T.camCheekL[0], 'cheekR'], [T.camCheekL[1], 'cheekL'], [T.pull[0], 'cheekL'], [T.pull[1], 'home'], [D, 'home'],
      ];
      // one continuous dolly through each run of different shots; a shot repeated at both ends of a gap is a still camera
      const toPt = (c) => (Array.isArray(c.focus) ? c.focus : c.target);
      const vec = (c) => [...c.pos, ...c.target, ...toPt(c), c.fov, c.aperture];
      const runs = []; { let cur = [CAM_KEYS[0]]; for (let i = 1; i < CAM_KEYS.length; i++) { if (CAM_KEYS[i][1] === CAM_KEYS[i - 1][1]) { if (cur.length > 1) runs.push(cur); cur = [CAM_KEYS[i]]; } else cur.push(CAM_KEYS[i]); } if (cur.length > 1) runs.push(cur); }
      const runPaths = runs.map((r) => ({ t0: r[0][0], t1: r[r.length - 1][0], f: K.path(r.map(([t, n]) => [t, vec(CAM[n])])) }));
      const camAt = (t) => {
        let i = 0; while (i < CAM_KEYS.length - 1 && CAM_KEYS[i + 1][0] <= t) i++;
        const rp = runPaths.find((r) => t > r.t0 && t < r.t1);
        if (!rp) return CAM[CAM_KEYS[i][1]];
        const v = rp.f(t); return { pos: v.slice(0, 3), target: v.slice(3, 6), focus: v.slice(6, 9), fov: v[9], aperture: v[10] };
      };
      // where the shadow maps concentrate, and the lights for the mouth
      const shotOf = (t) => { let i = 0; while (i < CAM_KEYS.length - 1 && CAM_KEYS[i + 1][0] <= t) i++; return CAM_KEYS[i][1]; };
      const lightsAt = (t, tp) => {
        const o = {}, sh = shotOf(t);
        if (t > 3.5 && t < 89.5) { o.shadowCenter = (sh === 'table' ? V(-4.2, 9.5, -3.5) : headC.clone().addScaledVector(HY, -1.0)).toArray(); o.shadowSize = sh === 'table' || sh === 'shrug' ? 4.5 : 3.0; }
        const f = faceAt(tp);
        if ((f.jaw || 0) > 0.3 && (f.ah || f.tongue)) { o.fill = 1.6; o.fillPos = lips0.clone().addScaledVector(HZ, 1.1).addScaledVector(HY, -0.2).toArray(); }
        return o;
      };
      Object.assign(root.CNS4_WORLD, { CAM, CAM_KEYS, camAt, exR, exL, armL, glassAtT, faceAt, turnAt, shrugAt, holds, ringAt, propForHand });

      // ------------------------------------------------------------ the frame for time t
      const homeLock = (t) => t <= HOME_HOLD + 1e-6 || t >= D - HOME_HOLD - 1e-6;
      const shoot = (c) => {
        const cam = S.camera; cam.position.set(...c.pos);
        cam.up.set(0, 1, 0); if (c.up) cam.up.set(...c.up).normalize();
        cam.lookAt(...c.target);
        if (c.fov && c.fov !== cam.fov) { cam.fov = c.fov; cam.updateProjectionMatrix(); }
        K.focus(cam, c.focus || c.target, c.aperture == null ? 0.05 : c.aperture);
      };
      const update = (t) => {
        const tp = poseT(t), still = homeLock(t);
        // patient: shrug, head, (legs at rest), arms, face, breathing (README order)
        P.setShrug(shrugAt(tp));
        P.setHead({ turn: turnAt(tp) });
        HOME.applyArm(P, 'R', ST.arm.rest.R);
        HOME.applyArm(P, 'L', armL(tp));
        P.setFace(still ? {} : faceAt(tp));
        P.breathe(still ? 0 : breathT(tp));
        setGlass(glassAtT(tp), level(tp));
        // examiner
        const r = exR(tp), l = exL(tp);
        applyEx('R', r); applyEx('L', l);
        const h = holds(tp);
        fork.group.visible = h === 'fork'; torch.group.visible = h === 'torch';
        if (h === 'fork') { setProp(fork, propForHand(FORK_GRIP, r)); const a = ringAt(tp); fork.setVibrate(a * (Math.round(tp * POSES) % 2 ? 1 : -1)); }
        if (h === 'torch') setProp(torch, propForHand(TORCH_GRIP, r));
        torch.setOn(h === 'torch' && torchOn(tp));
        if (window.DEBUG_STATE) window.DEBUG_STATE(tp);
        shoot(window.CAM_OVERRIDE || camAt(t));
        L.set(still ? 0 : tp, lightsAt(t, tp));
        if (still) L.lamp.intensity = SET.LAMP.power;
      };
      const overlay = (ctx, t, W, Hh) => {
        const on = window.CAPTIONS != null ? !!window.CAPTIONS : style.captions;
        if (on) CAPTION.at(ctx, t, CAPTIONS, W, Hh);
        if (window.REVIEW_OVERLAY) window.REVIEW_OVERLAY(ctx, t, W, Hh);
      };
      return { update, overlay };
    },

    // ================================================================ sound: real events only, from the same table T
    sound(k) {
      // the quiet room under everything, faded in over the first 0.5 s and out over the last 0.5 s (no clicks at the joins)
      k.noise(0, { dur: D, color: 'brown', filter: 'lowpass', f: 300, gain: 0.11, a: 0.5, hold: D - 1.0, bus: 'amb' });
      k.noise(0, { dur: D, color: 'pink', filter: 'highpass', f: 4500, gain: 0.012, a: 0.5, hold: D - 1.0, bus: 'amb' });
      // the 512 Hz fork: a pure tone from each strike, dying away like the prongs' blur (same decay, HUM_DECAY)
      for (const s of STRIKES) k.tone(s, { f: 512, type: 'sine', dur: HUM_DECAY * 9.2, gain: 0.16, a: 0.01, pan: -0.1 });
      // the pen torch's switch, on and off
      for (const t of [T.torchOn, T.torchOff, T.torchOn9, T.torchOff9]) { k.play('click', t, { f: 2300, gain: 0.55, pan: 0.15 }); k.play('tick', t + 0.012, { f: 5200, gain: 0.25, pan: 0.15 }); }
      // the glass set down on the wooden table
      k.play('tock', T.setDown, { f: 900, gain: 0.35, pan: -0.35 });
      k.tone(T.setDown, { f: 2780, dur: 0.35, gain: 0.03, pan: -0.35 }); k.tone(T.setDown, { f: 4150, dur: 0.22, gain: 0.015, pan: -0.35 });
    },
  };
  root.CNS4 = style;
})(typeof window !== 'undefined' ? window : globalThis);
