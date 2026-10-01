# Production playbook

How to take a spec to a published, mastered video with this repo — fast, and at the quality bar the user expects. Distilled from the first full production (credit-card-debt rights, 13 modules, ~16:49).

## 0. Kickoff (ask once, then go)

Confirm with the user, in one question round:
- Cut length (e.g. 10-min spec vs 30-min spec) and module list.
- Voice: offline TTS now, user's own recording later? (pipeline supports both).
- Output: project + full MP4 @ 30 fps; delivery via Gofile link.
- Claim policy: keep the script, phrase unconfirmed claims with "may / typically / reportedly".

## 1. Script (narration/script.json)

- Simple friendly English, second person, short sentences, one idea per sentence.
- Every module after the first starts with a **bridge** sentence that recaps and hands over ("So the law is on your side… but what if you owe many banks?"), and has a `recap` line for the title card ("✓ …").
- Module 1 ends with a hook into module 2. The last module ends with a call to action + share request.
- Write numbers so they can be **shown and checked** on screen. Do the arithmetic before recording.
- Regenerate `narration/READING_SCRIPT.md` (`make_reading_script.py`) whenever the script changes — the user may record their own voice from it.

## 2. Voice + timing

- `generate_vo.py` (Kokoro-82M, voice `af_heart`, speed 1.1) → `public/audio/vo/mNN.mp3` + `src/data/timing.json` (word-level). Pronunciations live in the `SPOKEN` map (CIBIL→"sibil" etc.).
- Own voice later: `narration/process_voice.py` (denoise → whisper alignment → retake removal → EQ/compress → −16 LUFS) produces the same files; see README.
- Verify any regenerated line by transcribing it back with faster-whisper.

## 3. Visual design rules

- **Every beat is cue-driven** (`cueFrame(I, 'phrase')`). No static holds > ~6 s without motion; check with `scripts/find_static_holds.py`.
- Things appear **when they are said**; ticks land when the point **finishes** (`sentenceEnd`/`paragraphEnd`), with a tactile SFX.
- Prefer concrete imagery (3D credit cards, documents, phones, vaults) over bare numbers.
- One focal point per moment; fill the frame — no half-empty screens for long stretches.
- Keep a continuity thread: journey dots, "SO FAR" recap, "UP NEXT" chip.
- Text never overlaps 3D objects, other panels, or the HUD; leave the subtitle band clear.

## 4. Review loop (per module)

1. `node scripts/stills.mjs SceneNN auto:16 out/prereview` → tile → look at every frame (see `docs/REVIEW_CHECKLIST.md`).
2. Fix, re-render only the affected stills at the exact cue frames, look again.
3. Render the module (`scripts/render_modules.sh SceneNN`), then `scripts/review_chunk.py` sheets every 3 s, plus full-size frames around every transition you changed.
4. Check audio: `loudnorm` summary on the chunk (no clipping; master later).
5. Approve → `master_audio.py` → share the module (≤ 30 MB, else preview re-encode).

## 5. Render strategy

- Single container: `setsid nohup scripts/render_modules.sh Scene01 … &` + a harness watcher per module. Resumable: finished chunks are skipped; restarts lose only the module in progress.
- Never edit `public/` while rendering. Keep `src/` compiling (the next module bundles whatever is on disk).
- Restarts happen. On a "container restarted" notice: `ls out/chunks`, delete `.partial` files, relaunch the queue with the remaining ids, re-arm the watcher.

### Parallel render (use for any full or multi-module re-render)

A module takes 35–55 min; a fresh session needs ~10 min of setup. With N sessions the wall time is ≈ setup + ceil(13/N) × 45 min.

1. Commit and push; note the exact commit SHA.
2. For each worker, `create_session` with this repo, `source_revision=<SHA>`, and the prompt in `docs/worker_prompt.md` filled with its module list (balance by duration; the 3D-heavy modules are 1, 2, 3, 4, 5).
3. Workers render, verify, and upload each chunk to Gofile (`scripts/upload_gofile.sh`), replying with the links. (Alternative: push chunks to a `renders/<SHA>` branch — each chunk < 100 MB.)
4. The coordinator downloads chunks into `out/chunks/`, reviews each as usual, then `scripts/stitch.sh`.
5. Remind the user parallel sessions consume plan usage proportionally.

## 6. Finish

- `scripts/stitch.sh` → `out/credit_card_debt_know_your_rights.mp4` (−14 LUFS / −1.5 dBTP).
- Verify: duration, streams, loudness summary, spot frames at each module boundary.
- `scripts/make_publish_kit.py` → `publish/` (captions.srt, chapters.txt, youtube_description.md); thumbnail via the `Thumbnail` composition.
- Upload with `scripts/upload_gofile.sh`, check the md5 in the response, share the link. Remind the user Gofile can expire inactive files.

## 7. Character (optional layer)

`src/character/` — rigged 2D "borrower": moods (brows, lids, squint, gaze), 11 mouth shapes incl. visemes, IK arms with smooth pose blending, hands that hold phone/card/letter/bill, head turn/nod, word-timed lip-sync (`Performance.tsx` shows how). Compositions: `CharacterSheet`, `CharacterHero`, `CharacterPerformance`.
To place him in a scene: render `<Borrower arms={blendArms(...)} spec={blendMood(...)} …/>` keyed off `cueFrame`s, and lip-sync from `timing.json` words like `Performance.tsx`. Adding him changes most modules → plan a parallel render.
