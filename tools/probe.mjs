import { launch, openPage } from './pw.mjs';
import fs from 'node:fs';
const [,, url = '/index.html?render=1&w=960&h=540&samples=4', out = '', js = ''] = process.argv;
const b = await launch({ gpu: false }); const t0 = Date.now();
const page = await openPage(b, url, { width: 960, height: 540 });
await page.waitForFunction(() => window.READY || window.FAIL, null, { timeout: 0 });
console.log('built in', (Date.now() - t0) / 1000, 's');
if (js) console.log(await page.evaluate(js));
if (out) { const t1 = Date.now(); const d = await page.evaluate(() => { window.seek(0); return document.getElementById('c').toDataURL('image/png'); }); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('frame in', (Date.now() - t1) / 1000, 's'); }
await b.close();
