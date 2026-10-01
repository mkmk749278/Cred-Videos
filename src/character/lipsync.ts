import {interpolate} from '../lib/safeInterpolate';
import type {Mouth} from './Borrower';

export type W = {w: string; s: number; e: number};

/** rough letter -> viseme sequence for one word (merged repeats) */
export const visemes = (word: string): Mouth[] => {
  const out: Mouth[] = [];
  for (const ch of word.toLowerCase().replace(/[^a-z]/g, '')) {
    const v: Mouth | null = 'a'.includes(ch) ? 'A' : 'eiy'.includes(ch) ? 'E' : 'ouw'.includes(ch) ? 'O' : 'mbp'.includes(ch) ? 'M' : 'fv'.includes(ch) ? 'E' : null;
    if (v && out[out.length - 1] !== v) out.push(v);
  }
  return out.length ? out : ['A'];
};

/**
 * Mouth shape at narration time `sec` (seconds into the module audio), plus how strongly a stressed
 * word is being hit (0..1, for nods / brow lifts / camera punches). `talking` is false in pauses.
 */
export const speechAt = (words: W[], sec: number, stress: string[] = []): {mouth: Mouth | undefined; talking: boolean; stress: number} => {
  let hit = 0;
  if (stress.length) {
    for (const x of words) {
      if (x.s > sec + 0.4) break;
      if (x.e < sec - 0.5) continue;
      if (stress.some((s) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(s))) {
        hit = Math.max(hit, interpolate(sec, [x.s - 0.05, x.s + 0.1, x.e + 0.25], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
      }
    }
  }
  // binary search the active word
  let lo = 0;
  let hi = words.length - 1;
  let w: W | undefined;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sec < words[mid].s) hi = mid - 1;
    else if (sec >= words[mid].e) lo = mid + 1;
    else {
      w = words[mid];
      break;
    }
  }
  if (!w) {
    // short gaps between words inside a phrase: keep the lips slightly parted rather than snapping shut
    const prev = words[Math.max(0, lo - 1)];
    const next = words[lo];
    if (prev && next && sec - prev.e < 0.12 && next.s - sec < 0.12) return {mouth: 'M', talking: true, stress: hit};
    return {mouth: undefined, talking: false, stress: hit};
  }
  const seq = visemes(w.w);
  const p = (sec - w.s) / Math.max(0.05, w.e - w.s);
  return {mouth: seq[Math.min(seq.length - 1, Math.floor(p * seq.length))], talking: true, stress: hit};
};
