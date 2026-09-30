import timingData from '../data/timing.json';
import scriptData from '../../narration/script.json';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
/** seconds of title card before narration starts in every scene */
export const LEAD = 2.2;
/** seconds after narration ends before the scene cuts */
export const TAIL = 1.4;

export type Word = {w: string; s: number; e: number};
export type Sentence = {text: string; para: number; start: number; end: number; words: Word[]};
export type ModuleTiming = {id: string; duration: number; sentences: Sentence[]};
export type ModuleMeta = {id: string; number: number; title: string; kicker: string; vo: string[]; bridge?: boolean; recap?: string};

export const timing = timingData as {voice: string; modules: ModuleTiming[]};
export const script = scriptData as {title: string; modules: ModuleMeta[]};

export const sceneFrames = (i: number) => Math.ceil((LEAD + timing.modules[i].duration + TAIL) * FPS);
export const totalFrames = () => timing.modules.reduce((acc, _, i) => acc + sceneFrames(i), 0);
export const sceneStart = (i: number) => {
  let f = 0;
  for (let k = 0; k < i; k++) f += sceneFrames(k);
  return f;
};

/** narration time (s) -> scene frame */
export const toFrame = (sec: number) => Math.round((LEAD + sec) * FPS);

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9%]/g, '');

const allWords = (moduleIndex: number) => timing.modules[moduleIndex].sentences.flatMap((s) => s.words);

const findWord = (moduleIndex: number, phrase: string, nth: number) => {
  const words = allWords(moduleIndex);
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  let seen = 0;
  for (let i = 0; i <= words.length - target.length; i++) {
    if (target.every((t, j) => norm(words[i + j].w) === t)) {
      if (seen === nth) return {words, i, n: target.length};
      seen++;
    }
  }
  throw new Error(`Cue "${phrase}" not found in module ${timing.modules[moduleIndex].id}`);
};

/**
 * Frame (relative to the scene) at which `phrase` starts being spoken.
 * `nth` picks later occurrences. Throws if the phrase is not in the narration so broken cues fail loudly.
 */
export const cueFrame = (moduleIndex: number, phrase: string, nth = 0): number => {
  const {words, i} = findWord(moduleIndex, phrase, nth);
  return toFrame(words[i].s);
};

/** frame at which `phrase` finishes being spoken */
export const cueEnd = (moduleIndex: number, phrase: string, nth = 0): number => {
  const {words, i, n} = findWord(moduleIndex, phrase, nth);
  return toFrame(words[i + n - 1].e);
};

export const narrationEnd = (moduleIndex: number) => toFrame(timing.modules[moduleIndex].duration);

/**
 * Frame where the module's own topic begins. Modules with a `bridge` open with a linking line
 * (recap of the previous module + why this one matters); the title card stays up while it is spoken.
 */
export const contentStart = (moduleIndex: number): number => {
  if (!script.modules[moduleIndex].bridge) return Math.round(LEAD * FPS);
  const first = timing.modules[moduleIndex].sentences.find((s) => s.para === 1);
  return first ? toFrame(first.start) : Math.round(LEAD * FPS);
};

/** Frame at which the sentence containing `phrase` finishes being spoken (for "tick when done" beats). */
export const sentenceEnd = (moduleIndex: number, phrase: string, nth = 0): number => {
  const {words, i} = findWord(moduleIndex, phrase, nth);
  const t = words[i].s;
  const s = timing.modules[moduleIndex].sentences.find((x) => t >= x.start - 1e-6 && t <= x.end + 1e-6);
  return toFrame(s ? s.end : words[i].e);
};

/** Frame at which the paragraph containing `phrase` finishes (for multi-sentence list items). */
export const paragraphEnd = (moduleIndex: number, phrase: string, nth = 0): number => {
  const {words, i} = findWord(moduleIndex, phrase, nth);
  const t = words[i].s;
  const sents = timing.modules[moduleIndex].sentences;
  const s = sents.find((x) => t >= x.start - 1e-6 && t <= x.end + 1e-6);
  if (!s) return toFrame(words[i].e);
  const last = sents.filter((x) => x.para === s.para).pop()!;
  return toFrame(last.end);
};
