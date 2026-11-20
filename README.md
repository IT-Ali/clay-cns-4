# CNS examination, part 4 of 11: cranial nerves VIII to XII (Soft Clay)

A 92-second three.js motion graphic in the series' Soft Clay style. It covers Rinne, Weber, voice and palate, cough,
a water swallow, shoulder shrug, head turning, and the tongue at rest, out, and in each cheek. It starts and ends
on the CNS home shot. Nothing in `shared/` is changed.

## Render the MP4s on your PC (Windows, Node + Chrome, a graphics card)

```bash
npm install
```

```bash
npm start
```

This renders every frame at the series quality (`SET.RENDER`: 64 samples, 1920x1080, 30 fps) and writes:

- `out/cns4_captions.mp4` and `out/cns4_clean.mp4`: the whole part, with sound
- `out/beats/cns4_beatNN_<name>_captions.mp4` / `_clean.mp4`: every beat on its own

Frames are saved in `out/frames/` as they are made. If a render stops, run `npm start` again and it carries on from
the frames already on disk. Each frame is rendered once; the captioned frame is the same picture with the caption
plaque drawn on top. The sound comes from the same score as the player, normalised to about -15 LUFS.

Options:

- `npm start -- --beat 10` renders that beat's frames first and makes its two MP4s as soon as they are all there
  (run `npm start` afterwards for the rest; frames already done are kept)
- `npm start -- --frames 2250-2430` renders a range of frames
- `npm start -- --samples 32` is faster and a little grainier
- `npm start -- --remake` remakes the MP4s from the frames on disk
- `npm run preview` renders at 8 samples, 960x540, into `out/preview/`
- `--software` uses software WebGL (no graphics card, very slow)
- to use a particular Chrome, set `CHROME_PATH`

The first and last frames are the same CNS home shot, pixel for pixel: the last second plays the first second backwards.
Building the scene takes a minute or two before the first frame (the contact solver places every hand).

## The low-sample previews in this folder

`previews/` holds the previews rendered on a machine with no graphics card (software WebGL, 1 sample, 640x360):
`cns4_captions.mp4`, `cns4_clean.mp4` and every beat on its own in `previews/beats/`. They show timing, staging and
contacts only; the light, depth of field and grain are only right in the full render (`npm start`).

## Look at it live

Open `index.html` through any local web server (for example `npx serve .`) and use the control bar: play/pause,
scrub, time, sound, captions. It loads three.js 0.187.0 and Fredoka from their CDNs.

## Files

- `index.html`: the player and render page (`?render=1&w=&h=&samples=&captions=0|1`)
- `cns4/cns4-style.js`: this part (content and timing table first, then `build(S)` returning `update(t)`, then `sound(k)`)
- `cns4/contact4.js`: the contact solver (gaps measured on the real meshes)
- `cns4/mouth.js`: this part's mouth interior, tongue, cheek bulge and larynx (in place of the kit's pieces, which are hidden, not edited)
- `lib/`: the STAGE, TEXT3D and SOUND kits, unchanged
- `shared/`, `series/`, `ref/`: the series kit v5, unchanged
- `styles/soft-clay.js`: the reference style source
- `storyboard/`: the storyboard page and its stills (`node tools/storyboard.mjs`, then `node tools/storyboard-html.mjs`), and
  `story_vs_anim.png` (each checked beat's panel next to the animation: `node tools/story-vs-anim.mjs`)
- `render.mjs`, `tools/`: the renderers (Chrome is driven by Playwright with no network: the page, three.js and the font are served from this folder)
