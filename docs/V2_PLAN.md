# v2 plan — "Credit card debt: know your rights" (same video, upgraded)

Decided with the user (Oct 1). Finish this video completely before starting the next one.

## Decisions
- **Voice:** keep the English AI voice (Kokoro `af_heart`). User may replace with own voice later.
- **Ravi hosts throughout:** opens the video, reacts in every module, closes it.
- **Full retention edit:** 3-second cold-open hook, ~2-second chapter transitions instead of 5–8 s title cards, continuous slow camera push-ins, punch-zooms on key words, snappier cuts.
- **Extras:** 3–5 vertical Shorts (9:16), new thumbnail with Ravi (2–3 variants), real music (chosen by Claude — see below), v1 uploaded to Gofile as a baseline.
- **Music (decided):** Kevin MacLeod (incompetech, CC BY 4.0 — credit is in the description via make_publish_kit): tension = "Lightless Dawn", analytic = "Sincerely", hope = "Inspired". Processed (HPF 60 Hz, −2 dB low shelf, 2.5:1 glue comp, −13.3 LUFS to match the old beds) → staged in `out/music_stage/`, swap into `public/audio/music/` when no render is running. In v2, offset each module's start so consecutive modules continue the track instead of restarting, and drop/realign the backdrop beat pulse (it was tuned to the synth beds' tempo).
- **Next video teaser:** the user's own case ("how I'm handling my banks") is the NEXT video. This video must build curiosity for it and ask for subscribe/bell. Bank-specific personal choices (e.g. Bank of Baroda) belong in that video, not here.

## Script changes (done in narration/script.json)
- M5: removed "For example, Bank of Baroda." → "One that has nothing it can take from you." (scene: drop the Baroda tag/sub, cue `cBob`).
- M10: added closing line — not every bank is covered; ask viewers to comment their bank.
- M13: ending now reveals "I'm going through this myself" + next-video teaser + subscribe/bell + share.
- New `hook` field: cold open read before the first module.

## Build order
1. Finish v1 (M13 review) → stitch → master → Gofile upload. ✅ when done
2. Regenerate VO for m05, m10, m13 and the hook (`generate_vo.py`), regenerate READING_SCRIPT.md, publish kit.
3. Pacing system: shorten title card (`LEAD`/`contentStart`), chapter transition component, global camera push-in + punch-zoom helper keyed to stress words.
4. Cold open composition (Ravi + phone buzzing + hook VO) replacing the 7 s intro card.
5. Ravi placement per module: a `RaviHost` component (corner or side), driven by cue phrases → pose/mood keys; lip-sync when he "speaks" key lines; reactions otherwise. Draft per-module beat list first, review stills.
6. Music: mix user-supplied tracks via the existing bed/ducking path.
7. Review stills for all 13 modules (docs/REVIEW_CHECKLIST.md) → share samples (cold open + 1 module) for the user's OK.
8. Parallel render across sessions (docs/PLAYBOOK.md §Parallel render) → review each chunk → stitch → master → Gofile.
9. Shorts (9:16) + thumbnails.

## Open questions for the user
- Shorts: which moments? (proposal: "Not a crime" M1/M2, "Phantom fees" M4, "Scare tricks" M7, "Settle safely" M11)
