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

Options: `npm start -- --samples 32` (faster), `npm run preview` (8 samples, 960x540, into `out/preview/`),
`npm start -- --frames 2250-2430` (a range). To use a particular Chrome, set `CHROME_PATH`.

## Look at it live

Open `index.html` through any local web server (for example `npx serve .`) and use the control bar: play/pause,
scrub, time, sound, captions. It loads three.js 0.187.0 and Fredoka from their CDNs.

## Files

- `index.html`: the player and render page (`?render=1&w=&h=&samples=&captions=0|1`)
- `cns4/cns4-style.js`: this part (content and timing table first, then `build(S)` returning `update(t)`, then `sound(k)`)
- `cns4/contact4.js`: the contact solver (gaps measured on the real meshes)
- `lib/`: the STAGE, TEXT3D and SOUND kits, unchanged
- `shared/`, `series/`, `ref/`: the series kit v5, unchanged
- `styles/soft-clay.js`: the reference style source
- `storyboard/`: the storyboard page and its stills (`node tools/storyboard.mjs`, then `node tools/storyboard-html.mjs`)
- `render.mjs`, `tools/`: the renderers (Chrome is driven by Playwright with no network: the page, three.js and the font are served from this folder)
