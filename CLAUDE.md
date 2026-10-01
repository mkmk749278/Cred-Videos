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
  Project folder `01 Credit Card Debt - Know Your Rights` (share link https://gofile.io/d/owUINyYh): `v1 baseline` 18158828-daf8-45fd-8600-4a9d31092f6f · `modules (approved, mastered)` 62c67cd4-28bd-4c43-b7de-3e11816cbf4f · `character tests` 044e632c-2e0e-4928-898c-5a2a3eb07b9e · `v2 final` 582a231d-af87-4889-9e98-bc12cc60c750 · `Telugu final (v2)` 1113e3a1-892f-49b4-ae52-75946c32f312 (https://gofile.io/d/0dMyIMou). New videos: create a sibling folder `02 …` under the account root.
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
```

## Telugu edition (user's own narration)

- `REMOTION_LANG=te` switches everything: `src/lib/lang.ts`, `src/data/timing_te.json`, `public/audio/vo_te/`, Telugu recaps/kickers (`recap_te`, `kicker_te` in script.json), insert panels (`src/components/TeluguInserts.tsx`). Renders: `REMOTION_LANG=te scripts/render_modules.sh …` → `out/chunks_te/`; `REMOTION_LANG=te scripts/stitch.sh`.
- Source: `narration/telugu/full.mp3` + the user's English translation `english_transcript.md` (use it — Whisper Telugu is poor). Hand-made `map.json` (module start/end + English-phrase → Telugu-second anchors) and `inserts.json` (panels, full.mp3 seconds) → `python3 narration/process_telugu.py [--no-audio]` builds audio, timing, inserts, remap. Publish kit: `scripts/make_publish_kit_te.py`.
- Wherever the Telugu narration is more cautious than the English visuals, a panel must cover the English beat (screen never contradicts voice). Check scene **tails** too: the last panel must run past the module end or English beats flash before the cut.

## Code map

- `narration/script.json` — single source of truth for VO text (13 modules, `bridge` + `recap`).
- `src/lib/timing.ts` — scene length from audio; cue helpers: `cueFrame(I, phrase)`, `cueEnd`, `sentenceEnd`, `paragraphEnd`, `contentStart(I)`. **Tie every visual beat to a spoken phrase**, never to hard-coded frames.
- `src/components/SceneShell.tsx` — backdrop (beat-pulsed grid), title card with "SO FAR" recap + journey dots, HUD, word-by-word subtitles, music ducking.
- `src/components/primitives.tsx` — `Reveal`, `Glass`, `KLine` (highlighter line), `SpokenTile` (tile + tick/cross badge with SFX), `Pulse`, `NextChip`, `Stamp`, `Check`, `Layer` (depth transition) …
- `src/three/` — 3D pieces; `kit.tsx` `Scene3D` (DPR 0.6 default — pass `dpr={1}` for small canvases with text).
- `src/character/` — rigged 2D borrower: `Borrower.tsx` (face, moods, visemes), `Arms.tsx` (2-bone IK arms, hands, held props), `Performance.tsx` (keyframed acting + word-timed lip-sync).

## Lessons that cost hours (don't repeat)

1. **Plan renders around CPU:** 3D frames ≈ 1 s each, 2D ≈ 0.15 s. A full render ≈ 9–10 h on one container. For full re-renders, **fan out across parallel sessions** (see PLAYBOOK §Parallel render).
2. Review stills **before** rendering a module, not after — catching overlaps on a still costs seconds, on a chunk costs 40 min.
3. Stacked text lines in the same spot must not cross-fade (`out` fade is 10 frames → start the next line at `+10`).
4. Anything moving (a figure walking, a banner) must be checked against every panel it crosses.
5. Edits to `src/` while a render queue runs are picked up when the **next** module bundles — keep the tree compiling at all times.
6. Chat file limit 30 MB → re-encode a preview (`-crf 24`) or use Gofile.
7. **Always verify true peak after mastering.** ffmpeg `loudnorm` linear mode does not limit (v1 came out at +3.6 dBTP). `scripts/master_audio.py` now limits in Python and checks 4×-oversampled true peak ≤ −1.5 dBTP.
8. pedalboard `Limiter` adds make-up gain — re-normalise after it.
9. **Parallel render hand-off: use git, not tokens.** Putting the Gofile token in worker prompts gets blocked by the safety classifier (and leaks it). Workers push their chunk to `render/SceneNN` (≈20–30 MB each, fine for GitHub); the coordinator `git fetch origin render/SceneNN && git show FETCH_HEAD:out/chunks/SceneNN.mp4 > …`. Branch deletes are refused by the proxy — ask the user to delete `render/*` afterwards.
10. Gofile folder listing works through the website token: `node scripts/gofile_wt.js <token>` prints the X-Website-Token + UA to use against `api.gofile.io/contents/<code>` (only for folders the account owns or the user shares). Direct download: `https://<server>.gofile.io/download/web/<id>/<name>` with cookie `accountToken=<token>`.
12. Long modules: split one composition across two workers with `--frames=a-b`, render its audio once (`REMOTION_AUDIO_ONLY=1 … --codec=wav`), join video with the concat demuxer and mux the wav. Small fixes to a finished chunk: render only the changed frames and splice (re-encode head with `-frames:v`, concat demuxer, keep the chunk's audio) — the bundled ffmpeg has no `setpts`/`trim`.
13. Re-timing cues to another narration can collapse animation ranges → use `src/lib/safeInterpolate.ts` (all scenes import it).
11. The plan's 5-hour usage limit is account-wide; a very long coordinator context burns most of it. Keep the coordinator lean; idle workers whose turn fails on the limit lose their container (and any un-uploaded render).
