/**
 * Narration of this render (`REMOTION_LANG`):
 * - `en`  (default) the original synthetic English voice-over over the English stage (public/audio/vo).
 * - `te`  Telugu edition: the creator's Telugu narration (public/audio/vo_te, src/data/timing_te.json)
 *         with the animated demonstrations / panels of src/data/inserts_te.json.
 * - `enh` English edition with the creator's own English narration (public/audio/vo_enh,
 *         src/data/timing_enh.json, src/data/inserts_enh.json) and the same demonstrations.
 * - `hi`  Hinglish edition: the creator's Hinglish narration (public/audio/vo_hi, src/data/timing_hi.json,
 *         src/data/inserts_hi.json), same demonstrations, English on-screen wording as in `enh`.
 * Built by narration/process_narration.py.
 */
export type Lang = 'en' | 'te' | 'enh' | 'hi';
const env = process.env.REMOTION_LANG;
export const LANG: Lang = env === 'te' ? 'te' : env === 'enh' ? 'enh' : env === 'hi' ? 'hi' : 'en';
/** the demonstration edition (creator's narration + inserts) — true for te and enh */
export const DEMO = LANG !== 'en';
/** Telugu lines (header/caption/panel translations) are shown only in the Telugu edition */
export const SHOW_TE = LANG === 'te';
export const VO_DIR = LANG === 'te' ? 'audio/vo_te' : LANG === 'enh' ? 'audio/vo_enh' : LANG === 'hi' ? 'audio/vo_hi' : 'audio/vo';

/** pick on-screen wording: the Telugu-edition text, or the creator's own English phrasing (English and Hinglish editions
 * read the same script, so the Hinglish edition shows the English wording) */
export const tx = (te: string, enh: string) => (LANG === 'enh' || LANG === 'hi' ? enh : te);
