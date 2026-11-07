/* Render the promo video.
   node video/tools/render.js preview 3 15 33   → PNG stills at those seconds (video/out/still-*.png)
   node video/tools/render.js video              → video/out/frames.mp4 (no audio, 30 fps) */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const HTML = 'file://' + path.join(__dirname, '..', 'promo.html'), OUT = path.join(__dirname, '..', 'out');
(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(HTML); await p.evaluate(() => window.ready);
  const canvas = p.locator('#v');
  if (mode === 'preview') {
    for (const s of rest) { await p.evaluate(t => renderAt(t), Number(s)); await canvas.screenshot({ path: path.join(OUT, `still-${s}.png`) }); }
  } else {
    const fps = 30, dur = await p.evaluate(() => window.DURATION), n = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', path.join(OUT, 'frames.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => renderAt(t), i / fps);
      const buf = await canvas.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
