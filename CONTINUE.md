# CONTINUE: CNS part 4 (cranial nerves VIII-XII)

## Status
- Round 1 (storyboard): DONE, published at https://claude.ai/artifact/1bsGnak93vFkfbNNcSLwu1 ; waiting for the user's OK or changes.
- The whole animation already runs end to end in `cns4/cns4-style.js` (it is the storyboard's scene: cameras CAM,
  states ST, contacts CONTACTS). After approval: polish beats, then story_vs_anim.png, previews, final checks.

## Left to do (after storyboard approval)
1. Apply the user's storyboard changes.
2. story_vs_anim.png: animation frame at the middle of each hold vs its panel, beats 2, 4, 7, 8, 10 (tools/frames.mjs).
3. Low-sample previews here (software WebGL): beat 10 first, then the full part and each beat
   (`node render.mjs --preview --software`), check first and last frames are pixel-identical.
4. Stop for review. Final MP4s are rendered on the user's PC with `npm start` (no GPU here).

## Commands (this cloud machine has no GPU: software WebGL, slow)
- build + a few frames: `node tools/frames.mjs <outDir> 960 540 1 <t1> <t2> ...`
- one still with a page script: `node tools/shot.mjs out.png "<js>" 800 450 2 <t>`
- storyboard stills (resumable; skips existing images): `sh tools/sb-loop.sh` or `node tools/storyboard.mjs 16 960 540 [--only=id,id]`
- storyboard page: `node tools/storyboard-html.mjs` (reads storyboard/notes.json for checks and assumptions)
- page build takes about 2.5 min in software WebGL (the contact solver); one 960x540 sample about 10 s.

## Notes
- Contact rule: every contact solved to 0.5 mm, reported in storyboard/contacts.json (limit 1.5 mm, never negative).
- The end hold plays the start hold backwards (style.seekTime) so the last frame equals the first (grain is per frame).
- Glass: the PATIENT reaches it with his LEFT hand (the table is on his left, 1.2 m from the examiner): flagged for the user.
