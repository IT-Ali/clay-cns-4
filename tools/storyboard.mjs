// node tools/storyboard.mjs [samples=16] [w=960] [h=540] [--only name,name]
// Renders the storyboard stills one after another on ONE canvas with S.seek(time), from the animation's own data
// (cameras, states and contacts in cns4/cns4-style.js), and writes storyboard/storyboard.html (images embedded).
import { launch, openPage, ROOT } from './pw.mjs';
import fs from 'node:fs'; import path from 'node:path';

const args = process.argv.slice(2), only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const [N = 16, Wd = 960, Ht = 540] = args.filter((a) => !a.startsWith('--')).map(Number);
const OUT = path.join(ROOT, 'storyboard'); fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });

// the beat panels: the key frame of each beat, with the camera of the animation at that time
const BEATS = [
  { id: 'b01', n: 1, t: 4.6, span: '0.0 - 5.0 s', text: 'Cranial nerves VIII-XII', change: 'Starts on the CNS home shot, held still for 1 s (no caption, breathing and lamp flicker off). He breathes quietly (about 14 a minute) from then on.', camera: 'From the CNS home shot, one slow push-in toward his head and shoulders.', sound: 'Quiet room bed, fading in over the first 0.5 s.' },
  { id: 'b02', n: 2, t: 9.9, span: '5.0 - 19.0 s', text: 'Rinne: fork on the mastoid, then beside the ear - louder in the air: positive, both ears', change: 'Hold 5.8-7.3 s (still, no caption: the examiner explains). The right hand brings the 512 Hz fork in from his pocket, strikes it on the heel of the left glove (8.1 s, the prongs blur), and presses the foot of the stem on his RIGHT mastoid. He says it has stopped (silent visemes, 10.3 s); at once the prongs go 2 cm from the right ear canal, in line with it: he still hears it (12.0 s). Struck again (13.4 s); the hand goes over the top of his head (never in front of his face) to the LEFT mastoid, then beside the left ear, a little faster.', camera: 'From above and behind his right ear for the mastoid, gliding to his right side at ear level for the air test; then over to his left side at ear level for the left ear.', sound: '512 Hz pure hum from each strike (8.1 and 13.4 s), fading over a few seconds with the prongs.' },
  { id: 'b03', n: 3, t: 22.4, span: '19.0 - 27.0 s', text: 'Weber: fork on the forehead - heard in the middle', change: 'The fork is struck again (20.5 s) and the foot of the stem pressed on the middle of his forehead (21.2-24.6 s). He says "in the middle" (silent visemes, 22.6 s). The fork goes back out of frame, the hands to rest.', camera: 'From the front, a little to his left, so the stem is seen from the side and the forearm runs away from the lens.', sound: '512 Hz hum from the strike at 20.5 s.' },
  { id: 'b04', n: 4, t: 32.5, span: '27.0 - 37.0 s', text: "Say 'Ah': the palate rises equally, the uvula stays central", change: "Hold 27.8-29.3 s (still, no caption: 'say Ah'). The pen torch comes in from in front and below and clicks on (30.0 s); he opens wide, then says 'Ah' (30.9 s): the soft palate rises equally and the uvula stays in the midline until 34.8 s. Torch off (35.35 s) and away. No tongue depressor (the tongue lies low enough).", camera: 'Looking into his mouth from in front and a little below.', sound: 'Torch switch on and off.' },
  { id: 'b05', n: 5, t: 39.6, span: '37.0 - 41.0 s', text: 'A normal, explosive cough', change: 'Hold 37.6-39.1 s (still, no caption). He coughs (39.3-39.9 s): a small jolt of the head with the mouth opening, silent.', camera: 'Face and upper chest from the front, on his right.', sound: 'None (the cough is added later with the speech).' },
  { id: 'b06', n: 6, t: 46.2, span: '41.0 - 51.0 s', text: 'Sips of water: no cough, no choking, voice unchanged (instead of the gag)', change: "Hold 41.6-43.1 s. HE reaches with his LEFT hand to the glass on the bedside table (on his left), lifts it to his lips, takes a sip and swallows (the larynx rises and falls, 46.4 s), a second sip and swallow (48.0 s), no cough; he speaks normally (silent visemes, 49.3 s) and puts the glass back on the table (50.8 s).", camera: 'From his right side at neck level (lips, glass, front of the neck); it lifts to a high view of the table for the reach and the return.', sound: 'The glass set down on the wooden table (50.8 s).' },
  { id: 'b07', n: 7, t: 55.8, span: '51.0 - 59.0 s', text: 'Shrug against my hands: strong and equal (trapezius)', change: 'Hold 51.8-53.3 s. Both gloved palms settle flat on the tops of his shoulders, pressing down; he shrugs both shoulders up 3 cm against them, equally (54.5-56.9 s), then relaxes; the hands go back.', camera: 'From the front and above, both shoulders and both hands in frame.', sound: 'None.' },
  { id: 'b08', n: 8, t: 63.5, span: '59.0 - 69.0 s', text: 'Turn the head against my hand, each side: strong (sternocleidomastoid)', change: 'Hold 59.8-61.3 s. The right palm against the right side of his chin and jaw; he turns his head to the RIGHT against it (the LEFT sternocleidomastoid stands out). Then the left palm on the left side of his chin; he turns to the LEFT (the RIGHT sternocleidomastoid stands out).', camera: 'From the front, the neck in frame.', sound: 'None.' },
  { id: 'b09', n: 9, t: 72.8, span: '69.0 - 75.0 s', text: 'Tongue at rest in the mouth: no wasting, no fasciculation', change: 'Hold 69.6-71.1 s. The torch comes in and clicks on; he opens his mouth: the tongue lies relaxed and still on the floor of the mouth (not protruded). Mouth closes, torch off and away.', camera: 'Close-up into the mouth from in front, lit by the torch.', sound: 'Torch switch on and off.' },
  { id: 'b10', n: 10, t: 79.0, span: '75.0 - 81.0 s', text: 'Tongue out: straight in the midline', change: 'THE KEY BEAT. Hold 75.6-77.1 s (still, no caption). He puts his tongue straight out (77.3 s): it stays in the midline, no deviation, until 80.1 s.', camera: 'Close-up from the front.', sound: 'None.' },
  { id: 'b11', n: 11, t: 84.6, span: '81.0 - 89.0 s', text: 'Tongue into each cheek against my finger: strong', change: "Hold 81.4-82.9 s. He pushes his tongue into his RIGHT cheek (a round bulge); the pad of the examiner's right index finger presses on the outside of it: it holds firm. Then the LEFT cheek, with the examiner's left index finger.", camera: 'From the front and his right, gliding to the front and his left for the left cheek.', sound: 'None.' },
  { id: 'b12', n: 12, t: 91.5, span: '89.0 - 92.0 s', text: '(no caption)', change: 'The hands are back at rest; the camera pulls back to the CNS home shot, held still for the last second (breathing and flicker off): the same frame as the first.', camera: 'Pull back to the CNS home shot.', sound: 'The room bed fades out over the last 0.5 s.' },
];
const REVIEW = [
  { id: 'a-plan', group: 'a) Plan', note: 'His RIGHT and LEFT against the screen; the examiner on his right.' },
  { id: 'b-mastR', group: 'b) Rinne and Weber', note: 'Foot of the stem on the right mastoid: gap of the foot to the skin.' },
  { id: 'b-airR', group: 'b) Rinne and Weber', note: 'Prongs about 2 cm from the ear canal opening, the two prongs one behind the other along the canal axis.' },
  { id: 'b-fore', group: 'b) Rinne and Weber', note: 'Foot of the stem on the middle of the forehead: gap to the skin.' },
  { id: 'c-rest', group: 'c) Inside the mouth', note: "Mouth open before 'Ah': palate and uvula at rest, midline line." },
  { id: 'c-risen', group: 'c) Inside the mouth', note: "'Ah': palate risen, uvula central." },
  { id: 'd-shrug', group: 'd) Shrug and head turn', note: 'Palms and fingers on both shoulders (shrugged): gaps to the skin.' },
  { id: 'd-jaw', group: 'd) Shrug and head turn', note: 'Palm and fingers on the right side of the chin and jaw: gaps.' },
  { id: 'e-out', group: 'e) Tongue', note: 'Tongue out in the midline.' },
  { id: 'e-cheekR', group: 'e) Tongue', note: "Right cheek bulge with the examiner's index pad: gap." },
  { id: 'e-cheekL', group: 'e) Tongue', note: "Left cheek bulge with the examiner's index pad: gap." },
  { id: 'f-before', group: 'f) Swallow', note: 'Side view of the neck: larynx at rest.' },
  { id: 'f-during', group: 'f) Swallow', note: 'Side view of the neck: larynx risen.' },
];

const T0 = Date.now(), b = await launch({ gpu: false });
const page = await openPage(b, `/index.html?render=1&w=${Wd}&h=${Ht}&samples=${N}`, { width: Wd, height: Ht });
await page.waitForFunction(() => window.READY || window.FAIL, null, { timeout: 0 });
const fail = await page.evaluate(() => window.FAIL); if (fail) { console.log('FAIL', fail); process.exit(1); }
await page.addScriptTag({ path: path.join(ROOT, 'tools/review-page.js') });
console.log('built', ((Date.now() - T0) / 1000).toFixed(0), 's');
const grab = async (file, fn) => { const d = await page.evaluate(fn); fs.writeFileSync(path.join(OUT, 'img', file), Buffer.from(d.split(',')[1], 'base64')); console.log('  ', file, ((Date.now() - T0) / 1000).toFixed(0), 's'); };
for (const p of BEATS) {
  if (only.length && !only.includes(p.id)) continue;
  await grab(p.id + '.jpg', `(() => { window.CAPTIONS = true; REVIEW.beat(); window.seek(${p.t}); return document.getElementById('c').toDataURL('image/jpeg', 0.9); })()`);
}
for (const p of REVIEW) {
  if (only.length && !only.includes(p.id)) continue;
  await grab(p.id + '.jpg', `(() => { window.CAPTIONS = false; const t = REVIEW.panel('${p.id}'); window.seek(t); const d = document.getElementById('c').toDataURL('image/jpeg', 0.9); REVIEW.beat(); return d; })()`);
}
const report = await page.evaluate(() => REVIEW.report());
fs.writeFileSync(path.join(OUT, 'contacts.json'), JSON.stringify(report, null, 1));
fs.writeFileSync(path.join(OUT, 'panels.json'), JSON.stringify({ BEATS, REVIEW, samples: N, size: [Wd, Ht] }, null, 1));
await b.close();
console.log('done', ((Date.now() - T0) / 1000).toFixed(0), 's');
