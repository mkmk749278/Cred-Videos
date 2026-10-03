# Production playbook

How to take a topic to a published, verified video with this repo: great quality, in the least wall-clock time. This is distilled from the credit-card-debt production:
- an English v1/v2 with a synthetic voice;
- a Telugu edition in the creator's own voice, with 40 animated demonstrations;
- an English edition in the creator's own voice;
- 30 s reels.

Read this before starting a new video or a big change. Read `docs/REVIEW_CHECKLIST.md` before approving any render.

---

## 1. Where the time actually goes, and what saves it

Measured on this project, a 28–31 min film at 1920×1080 / 30 fps:

| Step | Single container | With this playbook |
|---|---|---|
| Full render | 9–10 h (≈ 0.4–1 s per frame; 3D frames ≈ 1 s) | **≈ 1.5–2 h** wall, 8–9 parallel workers |
| Re-edition of a finished film in a new voice (English-from-Telugu) | days | **≈ 3.5 h**: whisper 20 min, alignment 1 h, stills review 1 h, render 1.5 h, stitch+verify 20 min |
| A 30 s reel from finished assets | — | **≈ 1 h** |
| One review still | — | 10–20 s; a 15-still sheet ≈ 2 min |
| One wasted render round (an error found after rendering) | 40–90 min per module | avoided by the pre-render gate (§5) |

The biggest time sinks, in order:
1. **Fixing content after rendering.** Six scenes had to be re-rendered (~2 h) because the stage visible between demos still showed English beats that contradicted the narration. Gate: audit every second of the stage before the first render (§5.2).
2. **Silent stitch bugs.** Timebase mismatch made the picture look frozen. AAC padding drifted the subtitles 0.6 s. Both are fixed in `stitch.sh`; always run `check_av.py` and `check_vo_sync.py` (§7).
3. **Infrastructure trips.**
   - The disk filled with Remotion bundles.
   - A watcher hit the default 30 min background timeout.
   - A script was edited while it was running.
   - `pgrep -f` matched its own shell.

   Each cost 10–30 min. They are listed in §9 so they don't happen again.
4. **Serial rendering.** Never render more than one module serially when the user is waiting. Fan out (§6).

The rule that makes everything faster: **decide on stills, render once, verify by machine, review by eye.**

---

## 2. Kickoff (ask once, then go)

One question round with the user, then work without stopping. The user delegates creative calls.
- **Topic, audience, language(s), target length.**
- **Voice.** Synthetic now (Kokoro, offline), or the creator's own recording? Own recordings come as one long take plus a transcript, which is fine (§4.2).
- **Deliverables.** Full MP4, subtitles, chapters, description, reels, and source/ledger/report if wanted.
- **Claim policy.** Hedge unconfirmed claims ("may / typically / reportedly"). Use fictional banks and people. Mask numbers. Label every example figure "Illustration". No invented rates, fees or guarantees.
- **Delivery.** Gofile folder (`02 …` under the account root for a new video). Never upload to YouTube.

---

## 3. Script: write it for the screen

`narration/script.json` is the single source of truth: 13 modules, each with `bridge`, `kicker` and `recap`.
- **Voice.** Simple, friendly, second person, one idea per sentence. Every module opens with a bridge from the previous one.
- **Write for the screen.** For every sentence, know what object or action will be on screen. If a sentence has no picture, cut it or give it one.
- **Numbers.** Do the arithmetic before recording; on-screen totals must reconcile with the voice.
- **Rules from the source law.** Write them with their qualifications. Keep a source column for the asset ledger as you write; it is cheap now and expensive later.
- **Reading script.** Regenerate it with `make_reading_script.py` whenever the script changes; the creator may record from it.

---

## 4. Voice and timing

### 4.1 Synthetic voice
`python3 narration/generate_vo.py --models <dir> [--only m04]` (Kokoro-82M, `af_heart`, speed 1.1). It writes `public/audio/vo/*.mp3` and `src/data/timing.json` (word level). Fix pronunciations in the `SPOKEN` map. Re-check any regenerated line by transcribing it back.

### 4.2 The creator's own recording (any language)
The pattern that worked twice, Telugu and then English:
1. **Get the audio and an English transcript.**
   - Gofile download: `node scripts/gofile_wt.js <token>` gives the website token; the direct link plus cookie fetch the file.
   - Check the md5.
   - Whisper is good for English and poor for Telugu. For Telugu, use the creator's translation.
2. **Map it** (`narration/<lang>/map.json`): module start/end plus English-phrase → second anchors.
   - First edition: anchors are hand-made from the transcript.
   - Later editions: `narration/english/build_from_te.py` does it automatically. It transcribes with word timestamps, sentence-aligns (DP) to an existing edition, and carries every module boundary, insert window and demo beat through.
   - Phrase-level fixes go in `overrides.json`. Use them where the wording or order differs.
3. **Process:** `python3 narration/process_telugu.py --lang te|enh [--no-audio]`.
   - Cuts the modules (pauses > 1 s shortened to 1 s) and masters the voice.
   - Writes `timing_<lang>.json` and `inserts_<lang>.json`.
   - Keeps `full_mastered.npy` in `out/<lang>/`; rebuild it if it is deleted.
4. **Check that the beat lands on the words.** `out/en/beatcheck.py` prints, for every demo beat, the words spoken at that moment. Read it once top to bottom; it catches more than any automatic check.

---

## 5. Visuals: build once, decide on stills

### 5.1 Design rules (what made the videos good)
- **Demonstrate, don't list.**
  - A text-card sequence becomes an object doing something: a statement whose lines light up as they are spoken, a calendar whose cursor sweeps to day 90, a ledger row moving while "Still owed ₹62,400" stays.
  - The toolkit is `src/demos/kit.tsx`: `useBeats`, `useCamera`, `Paper`, `Hi`, `Pill`, `Caption`, `PhoneBody`, `Folder`, `Arrow`, `Toggle`, `IllusTag`.
- **Every visual beat is tied to a spoken phrase.** Use `cueFrame` for the stage and `beats` for demos; never hard-coded frames. Anything that appears does so when it is said; ticks land when the point finishes.
- **One focal object; fill the frame.**
  - No static foreground for more than ~10 s. If the narration lingers, add motion tied to its words; this is how the 17.7 s and 15.1 s holds were broken up.
- **Readable at phone size.**
  - Sizes: main labels 64–88 px, secondary 38–48 px, notes ≥ 28 px.
  - Margins ≥ 80 px.
  - Test the 640×360 downscale.
- **Truthful.**
  - Fictional Bank A/B/C, masked cards (•••• 4821), `.example` domains.
  - An "Illustration / Sample" tag on every example; it must stay on top during camera zooms.
  - Totals reconcile. Narration-specific quotes use the speaker's own words (`tx(te, enh)`).
- **The screen never contradicts the voice.** Wherever the narration is more cautious than an old visual, a demo or panel covers it. That includes scene **tails** and the 3–5 s while a title card fades.

### 5.2 Pre-render gate (do not render a module until all of these pass)
1. `npx tsc --noEmit -p .`, `python3 scripts/check_cues.py`, `python3 scripts/check_demos.py [enh]` (0 problems).
2. **Demo stills.** For every demo, take stills just after its start, at its midpoint and just before its end (`out/<lang>/demo_stills.sh SceneNN mNN t1 t2 …`). Look at each sheet: overlaps, clipped text, the caption band, the title-card fade.
3. **Stage-gap audit.** List every second where no demo or panel covers the stage. Take one still every 2.5 s through all of them, and read each against the narration at that moment. Anything that contradicts or overstates the voice, or shows real brands, invented rates or unlabelled scores, gets a demo **now**.
4. **Beat check.** Read the `beatcheck.py` output for the changed modules.

Stills cost seconds; a wrong render costs an hour. Clean `/tmp/remotion-webpack-bundle-*` after many still calls (§9).

### 5.3 Language editions
- `REMOTION_LANG` selects the edition. `en` is the synthetic English. `te` and `enh` are the creator's Telugu and English, with the shared demonstrations.
- `SHOW_TE` hides Telugu lines in non-Telugu editions.
- Order-dependent visuals must not assume one narration's order: captions pick the most recently reached line, and the EMI examples pick the last one spoken.
- A new edition costs about 3.5 h. Do not re-design for it; re-time.

---

## 6. Multi-session rendering (the big time saver)

A module takes 35–90 min to render; a fresh cloud session needs ~10–15 min of setup (`npm ci`, bundle). With N workers the wall time is ≈ 15 min + the longest worker's job list. 8–9 workers bring a 30 min film to ≈ 1.5–2 h.

### 6.1 When to fan out
- Any render of more than one module, or any full re-render: always.
- Small fixes inside a finished chunk: don't re-render the module. Render only the changed frames and splice them in with `scripts/splice_mid.py chunk.mp4 mid.mp4 a b`, which re-encodes head/mid/tail, keeps the chunk's audio and asserts the frame count. Then check the boundary frames against the original.
- Creative work (designing demos, reviewing) stays in the coordinator, which has the context. Workers only render.

### 6.2 Steps
1. **Freeze the source.** Make sure the pre-render gate passed, then commit and push. Note `SHA=$(git rev-parse HEAD)`.
2. **Plan.**

   `python3 scripts/fanout_plan.py --lang <en|te|enh> --sha $SHA --prefix render-<tag><n> --workers 9 --local ColdOpen,Scene06`

   - Reads every composition's frame count.
   - Splits compositions longer than `--split` (default 5000) frames into halves. These are range jobs like `Scene07@0-3674:Scene07_a`; `render_modules.sh` runs them, and `stitch.sh` joins `_a`/`_b` automatically.
   - Balances workers longest-first.
   - Writes `out/fanout/<prefix>/worker_NN.txt` (the exact prompt) and `plan.json`.
3. **Launch.** One `create_session` per prompt: this repo, `source_revision` = the working branch, `title` "<edition> render: <jobs>".
   - Workers push each chunk to `<prefix>/<Id>`. Use git for the hand-off, never Gofile tokens in prompts: the safety classifier blocks that, and it leaks the token.
4. **Render locally too.** Run `REMOTION_LANG=… setsid nohup scripts/render_modules.sh $(cat out/fanout/<prefix>/local.txt) &`.
5. **Watch.** Run `scripts/fanout_watch.sh <prefix> <lang>` as a background task with `timeout: 7000000`, and re-arm it after every wake-up. It wakes on a new branch or a local DONE.
6. **Ingest and review.** `scripts/fanout_ingest.sh <prefix> <lang> [stale ids…]` fetches new chunks and makes 5 s review sheets. Look at every sheet as it lands, not at the end.
7. **Fixes after launch.**
   - Commit, then render the affected modules under a **new prefix** (`render-te5` after `render-te4`). Never reuse a prefix for different content.
   - Pass the stale ids to `fanout_ingest.sh` as skip ids, so old chunks are not pulled in.
   - **Archive** any worker still rendering stale content.
8. **When everything is in:** archive all workers (`archive_session`), then stitch (§7). Ask the user to delete the `render-*` branches; the git proxy refuses branch deletes.

### 6.3 Usage and cost
- Each worker uses ~70k tokens of context (≈ $0.3–1). The 5-hour plan limit is account-wide.
- Keep the coordinator lean. Images are the expensive part: use 5 s sheets for chunks, and 2–3 s sheets only around changes.
- Idle workers whose turn fails on the usage limit lose their container, and any chunk not yet pushed. This is why each chunk is pushed as soon as it is done.

---

## 7. Stitch, master, verify (machine checks first, then eyes)

`REMOTION_LANG=<lang> scripts/stitch.sh`:
- normalises every chunk's video timebase (1/90000) and concatenates the video only;
- joins each chunk's audio trimmed to its exact video length (`join_audio.py`, which removes the AAC padding drift);
- checks every frame timestamp (`check_av.py`);
- masters with `master_audio.py` to −14 LUFS, with true peak ≤ −1.5 dBTP verified.

`CHUNKS_DIR=` and `STITCH_OUT=` override the input and output.

Then:

| Check | Command | Pass |
|---|---|---|
| Frame timing | (inside stitch) `check_av.py` | continuous, 0 boundary holds |
| Voice sync per chapter | `VO_LANG=<lang> python3 scripts/check_vo_sync.py final.mp4 [reference.mp4]` | constant lag ≈ +40–50 ms (decoder baseline), corr ≥ 0.95, duration = timeline |
| Frozen picture | `python3 scripts/find_frozen.py final.mp4 8` | every run of 8 s or more explained, longest ≲ 13 s |
| Loudness | stitch log | −14.00 LUFS, TP ≤ −1.5 dBTP |
| Full-film look | `python3 scripts/review_chunk.py final.mp4 30` | look at every sheet |
| Subtitles | publish kit (§8) | no overlaps, last cue < duration |

Wait for the mastered file to be complete before probing it. Poll the log for `mastered:`, not for the file's existence.

---

## 8. Publish kit and delivery

- **Subtitles and chapters.**
  - `scripts/make_publish_kit.py` (`en`), `make_publish_kit_te.py`, `make_publish_kit_enh.py`.
  - They write `captions_en.srt` (for the creator's voice, the text comes verbatim from their transcript, timed from the audio), `chapters.txt` and the description.
  - The chapter times come from the same timeline as the render.
- **Beat manifest:** `scripts/make_manifest_te.py` (JSON + CSV, validated).
- **Asset ledger and verification report:** `publish/<edition>/`.
- **Settlement-letter sample / chapter previews:** `scripts/make_previews_te.sh final.mp4 outdir` (uses `-nostdin` inside the read loop).
- **Upload.**
  - Command: `GOFILE_TOKEN=… GOFILE_MANIFEST=<tsv> scripts/upload_gofile.sh <file> <folderId>`, and check the `(match)` md5.
  - Create folders with `POST api.gofile.io/contents/createFolder {parentFolderId, folderName}`.
  - No commas in file names (curl `-F`).
  - Keep the approved export alongside every new one.

---

## 9. Reels / Shorts (30 s, 9:16)

`src/reel/Reel.tsx` (composition `Reel`, 1080×1920, 900 frames) and `scripts/make_reel_audio.py`.

1. **Pick the story.** One fear → one useful answer → one action → CTA. Use 4–5 passages of the creator's own narration (no new words), ≈ 24–27 s of voice plus ~3 s CTA.
   - The best hook is the audience's biggest fear, phrased as their own question ("Will the police arrest me?").
   - Keep the narration's qualifications; a boosted ad must not overstate.
2. **Cut the audio.** List the passages (full.mp3 seconds) in `REELS` in `make_reel_audio.py`, then run `python3 scripts/make_reel_audio.py enh|te`.
   - Boundaries snap to the quietest 10 ms. Check edge levels ≤ −50 dB, and transcribe the result back for English.
3. **Adjust the beats.** One per passage (`SEG[k]`), plus headlines and the CTA. Keep the platform safe area:
   - nothing important below y ≈ 1480 or in the right 150 px;
   - the hook fully visible on frame 0 (cover and first impression);
   - captions burned in, because most people watch muted.
4. **Stills.** `out/en/reel_stills.sh enh|te <frames>` draws the platform overlay guides in red.
5. **Render.** `npx remotion render Reel out/reels/reel_<lang>.mp4 --env-file=out/lang_<lang>.env`.
   - Use a real file, not `<(…)`: process substitution silently fell back to the default language.
   - Then `master_audio.py`, the cover PNG (frame 0, `SCALE=1`), and `publish/reels/POSTING.md` (captions, hashtags, boost and Shorts settings).
   - Instagram boost: "More website visits" → the YouTube URL, "Watch more" button. Shorts: link the full video as the "Related video".

---

## 10. Infrastructure rules (each one cost real time)

- **Detach long jobs** (`setsid nohup … &`). The container can restart; `out/` survives, processes don't.
- **Background watchers:** pass `timeout: 7000000` (the default is 30 min) and re-arm them after every wake-up. Keep exactly one watcher armed, or the idle container is reclaimed.
- **Never edit a script while it is running.** bash reads scripts incrementally (a stitch died mid-run this way). Never edit `public/` during a render.
- **Never** `pkill -f` or `pgrep -f <pattern>` in a loop; both match their own shell. Kill by PID, and wait on a log line.
- **Disk.** Every Remotion render or still call leaves a ~110 MB bundle in `/tmp`; 200 of them filled the disk. Run `ls -dt /tmp/remotion-webpack-bundle-* | tail -n +2 | xargs -r rm -rf`; `render_modules.sh` prunes automatically. Delete superseded chunks and duplicates too.
- **The bundled ffmpeg** has no `fps`/`setpts`/`trim` filters and no `rawvideo` muxer. Decode frames with PyAV (`av`) instead; it is installed.
- **Chat file limit is 30 MB.** Use Gofile for anything larger.

---

## 11. Optional layers

- **Character** (`src/character/`): a rigged 2D borrower with moods, visemes, IK arms, held props and word-timed lip-sync. Adding it changes most modules, so plan a fan-out render.
- **3D** (`src/three/`): use `Scene3D`; pass `dpr={1}` for small canvases with text. In the demo editions, 3D is skipped under inserts to save render time.
