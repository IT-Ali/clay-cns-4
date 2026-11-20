// node tools/story-vs-anim.mjs [samples=16] : storyboard/story_vs_anim.png
// For beats 2, 4, 7, 8 and 10: the storyboard panel | the animation frame at the panel's own time, rendered again now
// through window.seek (the pixel difference proves both come from the same cameras and poses) | the animation frame at
// the middle of the beat's hold.
import { launch, openPage, ROOT } from './pw.mjs';
import fs from 'node:fs'; import path from 'node:path';
const N = +(process.argv[2] || 16), W = 960, H = 540, SHOW = [2, 4, 7, 8, 10];
const SB = path.join(ROOT, 'storyboard'), panels = JSON.parse(fs.readFileSync(path.join(SB, 'panels.json'), 'utf8')).BEATS;
const T0 = Date.now(), b = await launch({ gpu: process.argv.includes('--gpu') });   // software WebGL unless --gpu
const page = await openPage(b, `/index.html?render=1&w=${W}&h=${H}&samples=${N}&captions=1`, { width: W, height: H });
await page.waitForFunction(() => window.READY || window.FAIL, null, { timeout: 0 });
console.log('built', ((Date.now() - T0) / 1000).toFixed(0), 's');
const rows = [];
for (const n of SHOW) {
  const p = panels.find((q) => q.n === n), img = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(SB, 'img', p.id + '.jpg')).toString('base64');
  const r = await page.evaluate(async ({ n, t, img }) => {
    const beat = window.CNS4.content.BEATS.find((q) => q.n === n), tHold = (beat.hold[0] + beat.hold[1]) / 2, cv = document.getElementById('c');
    window.CAPTIONS = true; window.seek(t); const same = cv.toDataURL('image/png');
    window.seek(tHold); const hold = cv.toDataURL('image/png');
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [a, s2] = await Promise.all([load(img), load(same)]), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d');
    x.drawImage(a, 0, 0); const A = x.getImageData(0, 0, c.width, c.height).data; x.drawImage(s2, 0, 0); const B = x.getImageData(0, 0, c.width, c.height).data;
    let sum = 0, big = 0; for (let i = 0; i < A.length; i += 4) { const d = (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3; sum += d; if (d > 12) big++; }
    return { same, hold, tHold, mean: sum / (A.length / 4), bigPct: 100 * big / (A.length / 4) };
  }, { n, t: p.t, img });
  rows.push({ n, p, img, ...r });
  console.log(`beat ${n}: panel t=${p.t}, mid-hold t=${r.tHold.toFixed(2)}, panel vs animation: mean difference ${r.mean.toFixed(2)} levels, ${r.bigPct.toFixed(2)}% pixels > 12 levels`);
}
const png = await page.evaluate(async (rows) => {
  const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  const cw = 640, ch = 360, head = 60, lab = 34, out = document.createElement('canvas'); out.width = cw * 3; out.height = head + rows.length * (ch + lab);
  const o = out.getContext('2d'); o.fillStyle = '#0d3a3d'; o.fillRect(0, 0, out.width, out.height);
  o.fillStyle = '#f8eedb'; o.font = '600 26px "Fredoka", sans-serif'; o.textBaseline = 'middle';
  ['Storyboard panel', 'Animation, same time (same data)', 'Animation, middle of the hold'].forEach((s, i) => { o.textAlign = 'center'; o.fillText(s, cw * i + cw / 2, head / 2); });
  for (const [k, r] of rows.entries()) {
    const y = head + k * (ch + lab); const ims = await Promise.all([load(r.img), load(r.same), load(r.hold)]);
    ims.forEach((im, i) => o.drawImage(im, cw * i, y, cw, ch));
    o.font = '500 18px "Fredoka", sans-serif'; o.textAlign = 'left'; o.fillStyle = '#f8eedb';
    o.fillText(`Beat ${r.n} · panel at ${r.p.t.toFixed(1)} s · animation at ${r.p.t.toFixed(1)} s: mean difference ${r.mean.toFixed(2)} of 255 (${r.bigPct.toFixed(2)}% pixels over 12) · mid-hold at ${r.tHold.toFixed(2)} s`, 12, y + ch + lab / 2);
  }
  return out.toDataURL('image/png');
}, rows.map(({ n, p, img, same, hold, tHold, mean, bigPct }) => ({ n, p, img, same, hold, tHold, mean, bigPct })));
fs.writeFileSync(path.join(SB, 'story_vs_anim.png'), Buffer.from(png.split(',')[1], 'base64'));
fs.writeFileSync(path.join(SB, 'story_vs_anim.json'), JSON.stringify(rows.map(({ n, p, tHold, mean, bigPct }) => ({ beat: n, panelT: p.t, midHold: tHold, meanDiff: +mean.toFixed(3), pctOver12: +bigPct.toFixed(3) })), null, 1));
await b.close(); console.log('story_vs_anim.png done', ((Date.now() - T0) / 1000).toFixed(0), 's');
