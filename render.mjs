// render.mjs: renders CNS part 4 to MP4 on a PC with a graphics card (npm start).
//   out/cns4_captions.mp4, out/cns4_clean.mp4               the whole part (92 s, 1920x1080, 30 fps, sound)
//   out/beats/cns4_beatNN_<name>_captions.mp4 / _clean.mp4   every beat on its own
// Each frame is rendered ONCE (clean, at SET.RENDER quality: 64 samples) and saved as a PNG; the captioned frame is the
// same picture with the caption plaque drawn on top (exactly what the stage's overlay does). Frames already on disk are
// skipped, so if a render stops, running npm start again carries on where it stopped.
// Options: --samples N   --w 1920 --h 1080   --preview (8 samples, 960x540, into out/preview/)   --frames a-b   --beat N
//          (renders that beat's frames first and makes its MP4s as soon as they are all there)
//          --software (no GPU: SwiftShader)   CHROME_PATH=... to use a particular Chrome
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { launch, openPage } from './tools/pw.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; }, flag = (k) => argv.includes('--' + k);
const PREVIEW = flag('preview');
const W = +opt('w', PREVIEW ? 960 : 1920), H = +opt('h', PREVIEW ? 540 : 1080), FPS = 30;
const SAMPLES = +opt('samples', PREVIEW ? 8 : 0);           // 0 = the style's own (SET.RENDER: 64)
const OUT = path.join(ROOT, 'out', PREVIEW ? 'preview' : '');
const FR = { clean: path.join(OUT, 'frames', 'clean'), captions: path.join(OUT, 'frames', 'captions') };
for (const d of [OUT, FR.clean, FR.captions, path.join(OUT, 'beats')]) fs.mkdirSync(d, { recursive: true });
let FFMPEG = 'ffmpeg'; try { FFMPEG = require('ffmpeg-static') || 'ffmpeg'; } catch (e) { /* system ffmpeg */ }
const ff = (args) => { const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' ')); };
const pad = (i) => String(i).padStart(6, '0');
const T0 = Date.now(), el = () => ((Date.now() - T0) / 60000).toFixed(1) + ' min';

const browser = await launch({ gpu: !flag('software') });
const page = await openPage(browser, `/index.html?render=1&captions=0&w=${W}&h=${H}${SAMPLES ? '&samples=' + SAMPLES : ''}`, { width: W, height: H });
await page.waitForFunction(() => window.READY || window.FAIL, null, { timeout: 0 });
const fail = await page.evaluate(() => window.FAIL); if (fail) { console.error('build failed:', fail); process.exit(1); }
const info = await page.evaluate(() => ({ D: window.DURATION, beats: window.CNS4.content.BEATS, samples: window.S.samples, gl: (() => { const g = window.S.renderer.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; })() }));
console.log(`built in ${el()} | ${W}x${H}, ${info.samples} samples | GPU: ${info.gl}`);
const NF = Math.round(info.D * FPS);
let [f0, f1] = (opt('frames', '') || `0-${NF - 1}`).split('-').map(Number);
if (opt('beat', '')) { const bt = info.beats.find((b) => b.n === +opt('beat')); f0 = Math.round(bt.t0 * FPS); f1 = Math.round(bt.t1 * FPS) - 1; }

// 1. the frames (skipping those already rendered)
const todo = []; for (let i = f0; i <= Math.min(f1, NF - 1); i++) if (!fs.existsSync(path.join(FR.clean, pad(i) + '.png')) || !fs.existsSync(path.join(FR.captions, pad(i) + '.png'))) todo.push(i);
console.log(`${NF - todo.length} of ${NF} frames already on disk, ${todo.length} to render`);
const write = (file, dataUrl) => { const tmp = file + '.part'; fs.writeFileSync(tmp, Buffer.from(dataUrl.split(',')[1], 'base64')); fs.renameSync(tmp, file); };
let done = 0; const t1 = Date.now();
for (const i of todo) {
  const r = await page.evaluate(async (t) => {
    window.CAPTIONS = false; window.seek(t);
    const c = document.getElementById('c'), clean = c.toDataURL('image/png');
    // the captioned frame: the clean picture with the series caption plaque on top (as the stage overlay draws it)
    const cv = window._cap || (window._cap = document.createElement('canvas')); cv.width = c.width; cv.height = c.height;
    const ctx = cv.getContext('2d'), img = new Image(); img.src = clean; await img.decode();
    ctx.drawImage(img, 0, 0); window.CAPTION.at(ctx, t, window.CNS4.content.CAPTIONS, c.width, c.height);
    return { clean, captions: cv.toDataURL('image/png') };
  }, i / FPS);
  write(path.join(FR.clean, pad(i) + '.png'), r.clean); write(path.join(FR.captions, pad(i) + '.png'), r.captions);
  done++;
  if (done % 10 === 0 || done === todo.length) { const per = (Date.now() - t1) / done / 1000; console.log(`frame ${i + 1}/${NF}  ${per.toFixed(2)} s/frame  about ${((todo.length - done) * per / 60).toFixed(0)} min left`); }
}

// 2. the sound, from the same score as the player, normalised to about -15 LUFS
const wavRaw = path.join(OUT, 'sound_raw.f32'), wav = path.join(OUT, 'sound.wav');
if (!fs.existsSync(wav)) {
  const b64 = await page.evaluate(async () => {
    const r = await window.SOUND.renderOffline((k) => window.CNS4.sound(k), window.DURATION, 48000, { voiceover: false });
    const u8 = new Uint8Array(r.inter.buffer); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s);
  });
  fs.writeFileSync(wavRaw, Buffer.from(b64, 'base64'));
  ff(['-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', wavRaw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,aformat=sample_fmts=s16:channel_layouts=stereo', '-c:a', 'pcm_s16le', wav]);
  fs.unlinkSync(wavRaw);
}
await browser.close();

// 3. the MP4s: the whole part and every beat, both versions
const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'];
const have = (v, a, n) => { for (let i = a; i < a + n; i++) if (!fs.existsSync(path.join(FR[v], pad(i) + '.png'))) return false; return true; };
let made = 0;
for (const v of ['captions', 'clean']) {
  // every beat whose frames are all on disk gets its own MP4 now
  for (const b of info.beats) {
    const s = Math.round(b.t0 * FPS), n = Math.round(b.t1 * FPS) - s, name = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const file = path.join(OUT, 'beats', `cns4_beat${String(b.n).padStart(2, '0')}_${name}_${v}.mp4`);
    if (!have(v, s, n) || (fs.existsSync(file) && !flag('remake'))) continue;
    ff(['-framerate', String(FPS), '-start_number', String(s), '-i', path.join(FR[v], '%06d.png'), '-ss', (s / FPS).toFixed(4), '-t', (n / FPS).toFixed(4), '-i', wav,
      '-map', '0:v', '-map', '1:a', '-frames:v', String(n), ...enc, '-af', 'afade=t=in:d=0.04,afade=t=out:st=' + (n / FPS - 0.04).toFixed(3) + ':d=0.04', file]);
    made++;
  }
  // the whole part once every frame is there
  const full = path.join(OUT, `cns4_${v}.mp4`);
  if (have(v, 0, NF) && (!fs.existsSync(full) || flag('remake'))) { ff(['-framerate', String(FPS), '-i', path.join(FR[v], '%06d.png'), '-i', wav, '-map', '0:v', '-map', '1:a', ...enc, '-shortest', full]); made++; }
}
if (!have('clean', 0, NF)) console.log(`not every frame is rendered yet: run again to carry on (${made} MP4s made this time)`);
console.log(`all done in ${el()}: ${OUT}`);
