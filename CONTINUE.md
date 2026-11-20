# CONTINUE: CNS part 4 (cranial nerves VIII-XII)

## Status
- Round 1 (storyboard): published at https://claude.ai/artifact/1bsGnak93vFkfbNNcSLwu1 (same URL is republished each round).
- Round 2 (storyboard review 1 fixes): mouth interior (cns4/mouth.js), tongue-out front camera + midline panel, cheek
  bulge + finger, Rinne/Weber stem grip (searched hand placement), shrug from his right/front with fingers back,
  natural jaw hands both sides (+ panel d-jawL), cough mouth.
- Round 3 (storyboard review 2 fixes): cough mouth slightly open, tongue inside; curved palatoglossal and
  palatopharyngeal arches; even teeth rows; tongue out 2-3 cm; round 2 cm cheek bulge (replaces the kit's) + 2x
  before/after crops; own larynx prominence in the swallow beat; shrug palms on the trapezius ridge + rest/shrug pair;
  Rinne thumb-and-index grip, fingers away from the ear (searched, ear clearance 8 mm) + b-airL2; small torch for 'Ah';
  SCM crops. All 34 panels re-rendered; waiting for the user's review (story_vs_anim and previews only after approval).
- Round 4 (storyboard round 3 APPROVED + 3 fixes, then the build):
  1. cough: the mouth interior is narrower (nothing shows through the cheek; checked every open-mouth beat from its camera);
  2. Rinne left: the examiner walks round to his LEFT side (SLEEVE_DIR switched while `left` is set in the R hand
     states), forearm from his left, below/behind the ear, nothing over the face, back to his right for Weber;
  3. shrug: front camera at shoulder level during the shrug (`shrugLevel`), measured rise 2.8 cm each side, printed in d-shrug2.
  Also: palm contacts now swing the thumb back out if the last palm settle put it into the skin (shrug thumb was -0.07 mm).
  Build: story_vs_anim.png (beats 2, 4, 7, 8, 10), low-sample previews (software, 1 sample, 640x360) in `previews/`,
  first/last frame identity check, render.mjs + README for the PC. STOP for the user's review after this round.

## Left to do
- Wait for the user's review of the previews. Final MP4s are rendered on the user's PC with `npm start` (no GPU here).

## Commands (this cloud machine has no GPU: software WebGL, slow)
- build + a few frames: `node tools/frames.mjs <outDir> 960 540 1 <t1> <t2> ...`
- one still with a page script: `node tools/shot.mjs out.png "<js>" 800 450 2 <t>`
- storyboard stills (resumable; skips existing images): `sh tools/sb-loop.sh` or `node tools/storyboard.mjs 16 960 540 [--only=id,id]`
- storyboard page: `node tools/storyboard-html.mjs` (reads storyboard/notes.json for checks and assumptions)
- previews: `node render.mjs --preview --software --samples 1 --w 640 --h 360 [--beat N]` (resumable; out/preview/),
  then copy the MP4s to `previews/`
- story_vs_anim: `node tools/story-vs-anim.mjs 16`
- page build takes about 2.5 min in software WebGL (the contact solver); one 960x540 sample about 10 s.

## Notes
- Contact rule: every contact solved to 0.5 mm, reported in storyboard/contacts.json (limit 1.5 mm, never negative).
- The end hold plays the start hold backwards (style.seekTime) so the last frame equals the first (grain is per frame).
- Glass: the PATIENT reaches it with his LEFT hand (the table is on his left, 1.2 m from the examiner): flagged for the user.

## mouth.js (what it replaces, so it can go into the kit later)
`cns4/mouth.js` (`MOUTH.install(P)` once after `PATIENT.build(S, { neuro: true })`; then `M4.face(f)` instead of `P.setFace(f)`):
- Hides, every frame, the kit's mouth-interior pieces (never edits them): the v4 replacement mouth group in
  shared/patient.js (`mouthG`: the dark `dish`, `upTeeth`/`loTeeth` rows, `tongueDown`, `tongueOut`) and the v5 "Ah"
  group in shared/patient-neuro.js (`ahG`: `cav`, `palate`, `throat`, `pillars`, `uvG` with `uvula` and `softPal`, `ahTongue`).
- Opens the face itself whenever the mouth is open (any jaw > 0.02 or tongue out), not only for "Ah": its own
  index buffers for the `cranium` (triangles straddling the lip line, |x| < 0.2, z > 0.3) and the hair cap (as the kit's hHole).
- Its own interior, head-local, in group `mouth4`: cavity + throat (dark, slightly emissive), hard-palate dome, soft palate
  curtain with an arch edge, two pillars each side, a lathe uvula (rises 2.8 mm and shortens 14% with `ah`, symmetric),
  rounded teeth rows on the jaw curve (upper fixed; lower + floor + tongue in a group turned about the kit's jaw axis
  JP = (0, -0.12, -0.08), JK = 0.22 rad per unit of jaw), the tongue (loft, midline groove) resting on the floor with its
  tip behind the lower incisors, sliding out over the lower teeth and lip with `tongue` 0..1.
- Tongue in cheek: subtracts the kit's bulge (its formula, on the rest shape) and adds a round one (about 2 cm) centred at
  head-local |x| 0.42, y -0.49 (between the mouth corner and the ear, at mouth level), recomputed only when the face
  changes; `M4.bulge(side)` gives its middle (the finger pad goes there).
- Arches: front (palatoglossal) and back (palatopharyngeal) arch tubes along one smooth curve each, from the soft palate
  edge down to the side of the tongue; the soft palate membrane fills to the front arch. Teeth: 7 per side per row,
  equal arc-length steps along the jaw curve, each turned to the curve.
- Larynx: `M4.head(h)` replaces `P.setHead(h)`; with `f.larynx` (0..1) a subtle prominence (4.5 mm) on the front of
  the neck at torso y 5.85, rising 2 cm with `f.swallow` (the kit's own swallow bump is then switched off). Only in the
  swallow beat, so the home shot is the kit's exactly. `M4.larynx()` gives its world point.
- Kit constants it copies: MOUTH_Y = -0.5, mouthY(x) = -0.5 + 0.22 x^2, the visemes' jaw values, the jaw rules of setFace.
- Probe for quick looks: `index.html?probe=mouth` (cns4/probe-mouth.js) and `node tools/probe-shots.mjs mouth <dir> 640 360 2 '<json>'`.
