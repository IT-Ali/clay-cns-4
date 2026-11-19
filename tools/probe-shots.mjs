// node tools/probe-shots.mjs <probe> <outDir> w h samples '<json list of [name, js]>' : one build, several stills
import { launch, openPage } from './pw.mjs';
import fs from 'node:fs'; import path from 'node:path';
const [,, probe, out, w = 640, h = 360, n = 2, list = '[]'] = process.argv;
fs.mkdirSync(out, { recursive: true });
const T0 = Date.now(), b = await launch({ gpu: false });
const page = await openPage(b, `/index.html?render=1&w=${w}&h=${h}&samples=${n}&captions=0${probe !== 'none' ? '&probe=' + probe : ''}`, { width: +w, height: +h });
await page.waitForFunction(() => window.READY || window.FAIL, null, { timeout: 0 });
const fail = await page.evaluate(() => window.FAIL); if (fail) { console.log('FAIL', fail); process.exit(1); }
console.log('built', ((Date.now() - T0) / 1000).toFixed(0), 's');
for (const [name, js, t] of JSON.parse(list)) {
  const r = await page.evaluate(js); if (r !== undefined && r !== null) console.log(name, r);
  const d = await page.evaluate((tt) => { window.seek(tt); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, t || 10);
  fs.writeFileSync(path.join(out, name + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
}
console.log('done', ((Date.now() - T0) / 1000).toFixed(0), 's'); await b.close();
