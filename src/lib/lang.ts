/**
 * Narration language of this render. `REMOTION_LANG=te` renders the Telugu edition: Telugu voice-over
 * (public/audio/vo_te), Telugu subtitles, and cue timings re-mapped to the Telugu narration
 * (src/data/timing_te.json, built by scripts/align_telugu.py).
 */
export const LANG: 'en' | 'te' = process.env.REMOTION_LANG === 'te' ? 'te' : 'en';
export const VO_DIR = LANG === 'te' ? 'audio/vo_te' : 'audio/vo';
