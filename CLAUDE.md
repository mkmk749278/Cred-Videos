# CLAUDE.md — Cred-Videos

Remotion (React/TS) pipeline for narrated awareness videos for Indian viewers (simple English). 13 modules, 1920×1080 @ 30 fps, offline TTS, procedural SFX/music, 2D motion graphics + software-rendered 3D (three.js), optional rigged 2D character.

Read `docs/PLAYBOOK.md` before starting a new video or a big change; `docs/REVIEW_CHECKLIST.md` before approving any render.

## Ground rules (the user's standing preferences)

- **Quality bar is "beyond expectations".** Self-review every module frame-by-frame before sharing. Never send something you haven't looked at.
- **Narration voice:** simple, friendly English, talking directly to the viewer ("you"), like a real person explaining. Each module opens with a bridge line linking to the previous one.
- **Unconfirmed claims** are phrased with "may / typically / reportedly / usually". Bank settlement figures are "reported borrower experiences, not guarantees". Keep the disclaimer.
- **Numbers on screen must match the voice** (e.g. M4 caught: voice said ₹1.65 L in 6 months, screen math gave ₹1,39,176 → fixed both to agree).
- **Work module by module**, review each, stitch only at the end. Share each approved module as it lands.
- **Deliver everything to the user's Gofile account** (one place, across sessions). Token: ask the user / env `GOFILE_TOKEN` — **never commit it**. Upload with `GOFILE_TOKEN=… GOFILE_MANIFEST=<tsv> scripts/upload_gofile.sh <file> <folderId>` and check the md5 line. Listing folder contents via the API needs premium, so **keep the manifest** (file ids) to delete/replace files later; deleting a whole folder by id works.
  Project folder `01 Credit Card Debt - Know Your Rights` (share link https://gofile.io/d/owUINyYh): `v1 baseline` 18158828-daf8-45fd-8600-4a9d31092f6f · `modules (approved, mastered)` 62c67cd4-28bd-4c43-b7de-3e11816cbf4f · `character tests` 044e632c-2e0e-4928-898c-5a2a3eb07b9e · `v2 final` 582a231d-af87-4889-9e98-bc12cc60c750 · `Telugu final (v2)` 1113e3a1-892f-49b4-ae52-75946c32f312 (https://gofile.io/d/0dMyIMou; also holds the timing-fixed copy) · `Telugu demonstrations (v3)` 17450000-367c-4243-8e57-a0ff5bc04423 (https://gofile.io/d/jtx4McS2). `English final (creator narration)` f14269ff-a279-48cb-8bb9-9ac33c7bc312 (https://gofile.io/d/HKJ3X7V7) · `Reels (Instagram + YouTube Shorts)` 64bf4442-b944-4fd5-a191-95a9cdda0453 (https://gofile.io/d/ob3d9j1n) · `Hinglish final (creator narration)` 19ff3d52-c284-4709-b45b-72894bcfb0b6 (https://gofile.io/d/LT3VjdIv; manifest out/hi/gofile_manifest.tsv). Project folder id 60990d38-cb4d-413f-ae3d-ded64de8e9b2; create subfolders with POST api.gofile.io/contents/createFolder {parentFolderId, folderName}. New videos: create a sibling folder `02 …` under the account root.
  Chat upload limit is 30 MB. Google Drive is not connected.
- **The user delegates creative calls:** pick music, visuals and fixes yourself, review yourself, deliver the best. Ask only real decisions (scope, story, personal info).
- Commit + push after every meaningful change (a stop hook enforces a clean tree). Never put model names in commits/code.

## Environment facts (cloud container)

- 4 CPU, ~15 GB RAM, no GPU. The container can be **restarted without warning** — everything in `out/` survives on disk, but running processes die. Long jobs must be resumable and detached (`setsid nohup …`).
- Harness background tasks max out at **2 h**; keep one watcher armed at all times or the idle container gets reclaimed. One watcher per module (< 1 h each) is the pattern.
- Chromium: `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. 3D needs `swangle` (set in `remotion.config.ts`).
- Bundled ffmpeg: `node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg` with `LD_LIBRARY_PATH` set to that dir. It has `loudnorm` and libx264, but **no `fps` filter and no f32le output** — extract frames with per-frame `-ss`.
- Kill processes by PID, never `pkill -f <pattern>` (it matches the calling shell → exit 144).
- **Never modify `public/` during a render** — it is served live; deleting/rewriting a file in use fails the render (404).

## Key commands

```bash
npx tsc --noEmit -p .                      # always before any render starts bundling
python3 scripts/check_cues.py              # every cueFrame/sentenceEnd phrase exists in timing.json
python3 narration/generate_vo.py --models <dir> [--only m04]   # TTS + src/data/timing.json
node scripts/stills.mjs <Id[,Id]> <frames|auto:N> <outDir>     # review stills (SCALE=1 for full size)
python3 scripts/review_chunk.py out/chunks/SceneNN.mp4 3       # contact sheets every 3 s → out/review/
scripts/render_modules.sh Scene01 Scene02 …                    # resumable per-module renders → out/chunks/
scripts/stitch.sh                                              # concat chunks + loudness master (-14 LUFS)
python3 scripts/master_audio.py in.mp4 out.mp4                 # master a single module for sharing
python3 scripts/make_publish_kit.py                            # captions.srt, chapters, description
scripts/upload_gofile.sh <file>                                # public download link
python3 scripts/make_reel_audio.py <en|te>                     # 30 s reel narration cut + captions (PLAYBOOK §9)
npx remotion render Reel --env-file=out/lang_<lang>.env       # 1080×1920 reel; master with master_audio.py
```

## Telugu edition (user's own narration)

- `REMOTION_LANG=te` switches everything: `src/lib/lang.ts`, `src/data/timing_te.json`, `public/audio/vo_te/`, Telugu recaps/kickers (`recap_te`, `kicker_te` in script.json), insert panels (`src/components/TeluguInserts.tsx`). Renders: `REMOTION_LANG=te scripts/render_modules.sh …` → `out/chunks_te/`; `REMOTION_LANG=te scripts/stitch.sh`.
- Source: `narration/telugu/full.mp3` + the user's English translation `english_transcript.md` (use it — Whisper Telugu is poor). Hand-made `map.json` (module start/end + English-phrase → Telugu-second anchors) and `inserts.json` (panels, full.mp3 seconds) → `python3 narration/process_telugu.py [--no-audio]` builds audio, timing, inserts, remap. Publish kit: `scripts/make_publish_kit_te.py`.
- Wherever the Telugu narration is more cautious than the English visuals, a panel must cover the English beat (screen never contradicts voice). Check scene **tails** too: the last panel must run past the module end or English beats flash before the cut.

## English edition (user's own English narration)

- `REMOTION_LANG=enh`: same demonstrations as the Telugu edition, the creator's English voice (`public/audio/vo_enh`, `timing_enh.json`, `inserts_enh.json`), Telugu lines hidden (`SHOW_TE`), narration-specific quotes via `tx(te, enh)` in `src/lib/lang.ts`.
- Build: `out/en/whisper.json` (faster-whisper word timestamps of `narration/english/full.mp3`) → `python3 narration/english/build_from_te.py` (sentence-aligns to the Telugu timeline; phrase fixes in `narration/english/overrides.json`) → `python3 narration/process_telugu.py --lang enh` → `python3 scripts/check_demos.py enh` → `python3 scripts/make_publish_kit_enh.py`.
- Render/stitch: `REMOTION_LANG=enh scripts/render_modules.sh …` → `out/chunks_enh/`; `REMOTION_LANG=enh scripts/stitch.sh`; verify `VO_LANG=enh python3 scripts/check_vo_sync.py out/credit_card_debt_know_your_rights_english.mp4`.

## Hinglish edition (user's own Hinglish narration)

- `REMOTION_LANG=hi`: same demonstrations, the creator's Hinglish voice (`public/audio/vo_hi`, `timing_hi.json`, `inserts_hi.json`), English on-screen wording as in `enh` (`tx` returns the English phrasing). The Hinglish script is a translation of the English-edition script, so it aligns to the **English edition**, not Telugu.
- Source: `narration/hinglish/full.mp3` + the creator's translation `english_translation.md` (71 cues). Build: `out/hi/translate.json` (faster-whisper medium, `task=translate`, word timestamps; ~30 min on 4 CPU) → `python3 narration/hinglish/build_from_enh.py` (English sentences come from `publish/english/captions_en.srt` mapped back to English full.mp3 seconds; module cuts + fixes in `narration/hinglish/overrides.json`, cut points snapped to silences) → `python3 narration/process_telugu.py --lang hi` → `python3 scripts/check_demos.py hi` → `python3 scripts/make_publish_kit_hi.py` (English subtitles from the translation, timed to the audio).
- Render/stitch: `REMOTION_LANG=hi scripts/render_modules.sh …` → `out/chunks_hi/`; `REMOTION_LANG=hi scripts/stitch.sh`; verify `VO_LANG=hi python3 scripts/check_vo_sync.py out/credit_card_debt_know_your_rights_hinglish.mp4`.
- v2 (review fixes): Hinglish chapter names (`title_hi`/`kicker_hi` in script.json), channel wordmark (`src/components/Brand.tsx`, `BRAND` = hi only), `Lens` (spoken document line enlarged) + `hi:` caption takeaways in the register/email/letter/report demos (`src/demos/kit.tsx`). Uploaded as `credit_card_debt_know_your_rights_hinglish_v2.mp4` in the Hinglish folder.

## Code map

- `narration/script.json` — single source of truth for VO text (13 modules, `bridge` + `recap`).
- `src/lib/timing.ts` — scene length from audio; cue helpers: `cueFrame(I, phrase)`, `cueEnd`, `sentenceEnd`, `paragraphEnd`, `contentStart(I)`. **Tie every visual beat to a spoken phrase**, never to hard-coded frames.
- `src/components/SceneShell.tsx` — backdrop (beat-pulsed grid), title card with "SO FAR" recap + journey dots, HUD, word-by-word subtitles, music ducking.
- `src/components/primitives.tsx` — `Reveal`, `Glass`, `KLine` (highlighter line), `SpokenTile` (tile + tick/cross badge with SFX), `Pulse`, `NextChip`, `Stamp`, `Check`, `Layer` (depth transition) …
- `src/three/` — 3D pieces; `kit.tsx` `Scene3D` (DPR 0.6 default — pass `dpr={1}` for small canvases with text).
- `src/character/` — rigged 2D borrower: `Borrower.tsx` (face, moods, visemes), `Arms.tsx` (2-bone IK arms, hands, held props), `Performance.tsx` (keyframed acting + word-timed lip-sync).

## Lessons that cost hours (don't repeat)

1. **Plan renders around CPU:** 3D frames ≈ 1 s each, 2D ≈ 0.15 s. A full render ≈ 9–10 h on one container. For full re-renders, **fan out across parallel sessions** (PLAYBOOK §6: `scripts/fanout_plan.py` writes the worker prompts, `fanout_watch.sh` / `fanout_ingest.sh` collect the chunks).
2. Review stills **before** rendering a module, not after — catching overlaps on a still costs seconds, on a chunk costs 40 min.
3. Stacked text lines in the same spot must not cross-fade (`out` fade is 10 frames → start the next line at `+10`).
4. Anything moving (a figure walking, a banner) must be checked against every panel it crosses.
5. Edits to `src/` while a render queue runs are picked up when the **next** module bundles — keep the tree compiling at all times.
6. Chat file limit 30 MB → re-encode a preview (`-crf 24`) or use Gofile.
7. **Always verify true peak after mastering.** ffmpeg `loudnorm` linear mode does not limit (v1 came out at +3.6 dBTP). `scripts/master_audio.py` now limits in Python and checks 4×-oversampled true peak ≤ −1.5 dBTP.
8. pedalboard `Limiter` adds make-up gain — re-normalise after it.
9. **Parallel render hand-off: use git, not tokens.** Putting the Gofile token in worker prompts gets blocked by the safety classifier (and leaks it). Workers push their chunk to `render/SceneNN` (≈20–30 MB each, fine for GitHub); the coordinator `git fetch origin render/SceneNN && git show FETCH_HEAD:out/chunks/SceneNN.mp4 > …`. Branch deletes are refused by the proxy — ask the user to delete `render/*` afterwards.
10. Gofile folder listing works through the website token: `node scripts/gofile_wt.js <token>` prints the X-Website-Token + UA to use against `api.gofile.io/contents/<code>` (only for folders the account owns or the user shares). Direct download: `https://<server>.gofile.io/download/web/<id>/<name>` with cookie `accountToken=<token>`.
12. Long modules: `fanout_plan.py` splits them into range jobs `Comp@a-b:Comp_a` / `_b` (each half carries its own audio); `stitch.sh` joins `_a`/`_b` automatically. Small fixes to a finished chunk: render only the changed frames and splice with `scripts/splice_mid.py` (frame count must stay identical) — the bundled ffmpeg has no `setpts`/`trim`.
14. **Never concat chunks with different video timebases** (Remotion writes 1/90000, a plain ffmpeg re-encode 1/15360): `-c copy` concat mis-scales timestamps → frozen picture, audio out of sync, while total duration still looks right. `stitch.sh` now normalises every chunk and `scripts/check_av.py` verifies every frame timestamp — trust that, not durations.
15. **AAC padding drift:** each Remotion chunk's audio runs ~40–60 ms past its video. `concat -c copy` then offsets every next chunk by the padded length → picture holds at boundaries and subtitles/chapters drift (~0.6 s over 14 chunks). `stitch.sh` now concats video-only and joins audio trimmed per chunk (`scripts/join_audio.py`); verify with `scripts/check_vo_sync.py final.mp4` (lag must stay constant, ≈+40 ms decoder baseline). Never wait on a process with `pgrep -f <pattern>` inside a loop — it matches its own shell.
16. **Remotion leaves a ~110 MB webpack bundle in `/tmp` per render/still call** — 200 of them filled the disk and Chrome died with "out of memory or disk space". `render_modules.sh` now prunes them; after many `stills.mjs` runs, `ls -dt /tmp/remotion-webpack-bundle-* | tail -n +2 | xargs rm -rf`.
13. Re-timing cues to another narration can collapse animation ranges → use `src/lib/safeInterpolate.ts` (all scenes import it).
17. **Never pass `--env-file=<(…)`** (process substitution) to Remotion: it silently falls back to the default edition (both reels came out English). Write `out/lang_<lang>.env` and pass that path.
18. **Insert hand-offs:** demos and panels share `fadeWindow` (TeluguInserts.tsx) — back-to-back inserts clear before the next comes in; never give an insert its own fixed fade. To fix many small frame ranges in finished chunks: `scripts/handoff_ranges.py` → `scripts/render_ranges.sh` (one bundle) → `scripts/splice_multi.py` (one re-encode per chunk).
19. Fresh containers lack the stitch's Python deps: `pip install av pyloudnorm pedalboard scipy soundfile pillow numpy` before `stitch.sh`.
11. The plan's 5-hour usage limit is account-wide; a very long coordinator context burns most of it. Keep the coordinator lean; idle workers whose turn fails on the limit lose their container (and any un-uploaded render).
