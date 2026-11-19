// cns4/probe-mouth.js: a light test scene for the mouth (index.html?probe=mouth): the CNS home set and patient only.
// window.FACE = {...} sets his face; window.CAM_OVERRIDE a camera. Not used by the video.
(function (root) {
  const THREE = root.THREE, K = root.K, V = (x, y, z) => new THREE.Vector3(x, y, z);
  root.CNS4 = { id: 'probe-mouth', duration: 92, fonts: ['600 56px "Fredoka"'], render: Object.assign({}, root.SET.RENDER), content: { BEATS: [], CAPTIONS: [] },
    build(S) {
      const SET = root.SET, BED = root.BED, PATIENT = root.PATIENT, SHEET = root.SHEET, HOME = root.HOME;
      const L = SET.build(S), bed = BED.build(S), table = BED.table(S), P = PATIENT.build(S, { neuro: true }), SH = SHEET.build(S, P, { from: 'foot' });
      bed.placePillow(P.headBack(), 7.15); HOME.apply(P, null, SH, 'cns');
      const M4 = root.MOUTH.install(P);
      const head = P.head; P.group.updateMatrixWorld(true);
      const HZ = V(0, 0, 1).transformDirection(head.matrixWorld), HY = V(0, 1, 0).transformDirection(head.matrixWorld), lips = P.anchor('lips');
      const cam = (d, dy, dz, ap) => ({ pos: lips.clone().addScaledVector(HZ, d).addScaledVector(HY, dy).add(V(0, 0, dz)).toArray(), target: lips.clone().addScaledVector(HZ, -0.2).toArray(), up: HY.toArray(), fov: 28, focus: lips.toArray(), aperture: ap || 0.002 });
      root.PROBE = { P, M4, cam, lips, HZ, HY, head };
      return { update(t) {
        P.setHead(window.HEAD || {}); M4.face(Object.assign({ pupilR: 3.5, pupilL: 3.5 }, window.FACE || {})); P.breathe(0);
        const c = window.CAM_OVERRIDE || cam(2.6, -0.2, 0);
        S.camera.position.set(...c.pos); S.camera.up.set(...(c.up || [0, 1, 0])); S.camera.lookAt(...c.target); K.focus(S.camera, c.focus, c.aperture);
        L.set(0, { fill: window.FILL == null ? 1.6 : window.FILL, fillPos: lips.clone().addScaledVector(HZ, 1.1).addScaledVector(HY, -0.2).toArray(), shadowCenter: lips.toArray(), shadowSize: 2 });
      } };
    } };
})(window);
