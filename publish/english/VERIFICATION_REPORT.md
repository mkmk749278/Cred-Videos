# Verification report: English edition (the creator's own narration)

**Export:** `Credit Card Debt - Know Your Rights (English).mp4`

| | |
|---|---|
| Video | 1920×1080, 30 fps, H.264 |
| Audio | AAC 48 kHz stereo |
| Duration | 27:40.93 (1660.93 s) |
| Frames | 49,828 |

## Source audio

- **File:** `CREDIT_CARD_ENGLISH_COMBINED.mp3`, downloaded from Gofile `CXF2fsvz`.
- **Checksum:** md5 9e1e141f… matches Gofile's own record.
- **Length:** 27:08.55.
- **Changes:** none to the voice itself (no new text-to-speech, no stretching). The recording is cut at chapter boundaries, and pauses inside a chapter longer than 1.0 s are shortened to 1.0 s. That is the same treatment as the approved Telugu edition.

## How the picture was synced to the voice

1. **Word timing.** The English audio was transcribed with word-level timestamps (faster-whisper medium), giving 483 sentences.
2. **Sentence matching.** These were matched in order to the Telugu edition's English transcript, with 342 confident sentence pairs. Every chapter boundary, insert window and demo beat of the Telugu edition was then carried onto the English timeline.
3. **Chapter starts.** All 14 boundaries land exactly on the creator's sentences ("Your phone rings.", "First, one thing must be clear.", … "Now let us put everything into eight simple steps.").
4. **Phrase pinning.** About 70 demo beats in 20 demos were pinned to the exact English phrase (`narration/english/overrides.json`). This was needed where the English wording or order differs from the Telugu.
5. **Quoted wording.** On-screen quotes use the creator's English wording, for example "My income has come down.", "I just want some peace.", "This is what I can arrange now. I can't promise more…" and "Don't worry, we'll handle it."
6. **Telugu lines hidden.** All Telugu translation lines are hidden in this edition.
7. **Cold open.** The roadmap follows the creator's six questions. The unspoken "stay till the end" teaser is removed.

## Checks on the final file

| Check | Result |
|---|---|
| Frame timestamps (`check_av.py`) | 49,828 frames continuous; 0 holds at the 14 chunk joins |
| Voice sync per chapter (`check_vo_sync.py`, against the narration cut from the source recording) | Constant +40–50 ms (decoder baseline, about one frame) in all 14 sections, correlation 0.96–0.99, no drift. Duration equals the timeline exactly. |
| Loudness | −14.00 LUFS integrated, true peak −3.75 dBTP |
| Demo timing (`check_demos.py enh`) | 40 demos, 0 problems |
| Subtitles | 564 cues, text verbatim from the creator's transcript. 4,530 / 4,628 words timed directly from the audio. No overlaps; the last cue ends at 27:39.4. |
| Frozen foreground (`find_frozen.py`) | 14 runs of 8–12 s (listed in `frozen_report.txt`); each is a demo's final state held while the narration finishes the point |
| Visual review | Stills of every demo (start, middle, end) and of every stretch where the English stage shows; contact sheets of all 15 rendered chunks every 5 s; a full-film sheet every 30 s |

## Limits

- The regulatory statements are those of the Telugu demonstrations edition; its `ASSET_LEDGER.md` lists the sources. Re-check them against the current documents before release.
- For about 3–5 s at a few chapter openings, the English stage is visible while the title card fades. It makes no claims that contradict the narration.
- Nothing was uploaded to YouTube.
