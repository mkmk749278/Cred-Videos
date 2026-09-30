// Render review stills: node scripts/stills.mjs <CompositionId[,Id2...]> <frame,frame,...|auto:N> [outDir]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [id, framesArg = 'auto:8', outDir = 'out/stills'] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const cid of id.split(',')) {
const composition = await selectComposition({serveUrl, id: cid, browserExecutable});
const frames = framesArg.startsWith('auto:')
  ? Array.from({length: Number(framesArg.slice(5))}, (_, i) => Math.round(((i + 0.5) / Number(framesArg.slice(5))) * composition.durationInFrames))
  : framesArg.split(',').map(Number);
fs.mkdirSync(outDir, {recursive: true});
for (const frame of frames) {
  const output = path.join(outDir, `${cid}_${String(frame).padStart(5, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, browserExecutable, scale: 0.5});
  console.log(output);
}
}
