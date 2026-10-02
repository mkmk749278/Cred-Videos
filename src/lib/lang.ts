/**
 * Narration of this render (`REMOTION_LANG`):
 * - `en`  (default) the original synthetic English voice-over over the English stage (public/audio/vo).
 * - `te`  Telugu edition: the creator's Telugu narration (public/audio/vo_te, src/data/timing_te.json)
 *         with the animated demonstrations / panels of src/data/inserts_te.json.
 * - `enh` English edition with the creator's own English narration (public/audio/vo_enh,
 *         src/data/timing_enh.json, src/data/inserts_enh.json) and the same demonstrations.
 * Built by narration/process_narration.py.
 */
export type Lang = 'en' | 'te' | 'enh';
const env = process.env.REMOTION_LANG;
export const LANG: Lang = env === 'te' ? 'te' : env === 'enh' ? 'enh' : 'en';
/** the demonstration edition (creator's narration + inserts) — true for te and enh */
export const DEMO = LANG !== 'en';
/** Telugu lines (header/caption/panel translations) are shown only in the Telugu edition */
export const SHOW_TE = LANG === 'te';
export const VO_DIR = LANG === 'te' ? 'audio/vo_te' : LANG === 'enh' ? 'audio/vo_enh' : 'audio/vo';
