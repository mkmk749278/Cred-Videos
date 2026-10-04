# Verification report: Hinglish edition (the creator's own narration)

**Export:** `Credit Card Debt - Know Your Rights (Hinglish).mp4` (md5 `8ec2e36809c8bf1d88d31f57bb90eb03`)

| | |
|---|---|
| Video | 1920×1080, 30 fps, H.264 |
| Audio | AAC 48 kHz stereo |
| Duration | 33:26.17 (2006.17 s) |
| Frames | 60,185 |

## Source audio

- **File:** `BE_PRACTICAL_HINGLISH_FULL_AUDIO.mp3`, downloaded from Gofile `CSSFsuHK`.
- **Checksum:** md5 27260eef… matches Gofile's own record.
- **Length:** 32:51.85.
- **Changes:** none to the voice itself (no new text-to-speech, no stretching). The recording is cut at chapter boundaries, and pauses inside a chapter longer than 1.0 s are shortened to 1.0 s, as in the Telugu and English editions.

## How the picture was synced to the voice

1. **What the Hinglish says.** The audio was translated to English with faster-whisper (medium, `task=translate`, word timestamps), giving 569 sentences. The creator's own translation (71 cues, `narration/hinglish/english_translation.md`) confirms the content: it is the English edition's script in Hinglish, in the same order.
2. **Sentence matching.** The Hinglish sentences were matched in order to the English edition's captions (564 lines, mapped back to the English recording's seconds): 482 matched pairs, 445 with strong word overlap. Every chapter boundary, insert window and demo beat of the approved English edition was then carried onto the Hinglish timeline (`narration/hinglish/build_from_enh.py`).
3. **Chapter cuts.** All 14 cuts sit in real silences of the recording. The four ambiguous ones (chapters 2, 6, 12 and 13) were checked against a Hindi transcription of those seconds.
4. **Beat check.** All 426 demo beats were compared with the words spoken at that moment. Low word overlaps were paraphrases of the same point within about a second.
5. **Phrase-level fixes** (`narration/hinglish/overrides.json`), where the Hinglish pacing or wording differs:
   - Ch 11: the receipts demo holds through "…closure should be properly recorded"; Lok Adalat starts on "Now, let's talk about the Lok Adalat" (was 8 s of empty header).
   - Ch 12: "750 in 18 months" adds "…or all clean in 24 months" and "No one can promise this for everyone" on their words (was a 15.4 s hold).
   - Ch 12: "Talk to one person you trust" follows the Hinglish wording ("You don't have to handle it all alone"); its last line now shows (it was timed after the chapter ended).
   - Ch 13: the last two recap panels crossfade directly, so the English stage list (which mentions write-off timing) never shows through.
6. **On-screen wording.** English, with the creator's English-edition quotes (the Hinglish script uses the same sentences). Telugu lines are hidden. The cold-open roadmap appears on each of the six questions as the Hinglish hook asks them; the unspoken "stay till the end" teaser is hidden.

## Checks on the final file

| Check | Result |
|---|---|
| Frame timestamps (`check_av.py`) | 60,185 frames continuous; 0 holds at the 18 chunk joins |
| Voice sync per chapter (`check_vo_sync.py`, against the narration cut from the source recording) | Constant +40–50 ms (decoder baseline, about one frame) in all 14 sections, correlation 0.95–0.99, no drift. Duration equals the timeline exactly. |
| Loudness | −14.00 LUFS integrated, true peak −3.25 dBTP |
| Demo timing (`check_demos.py hi`) | 40 demos, 0 problems |
| Subtitles (`captions_en.srt`) | 615 English cues from the creator's translation, timed to the Hinglish audio by sentence alignment (537 of 556 sentences with good overlap). No overlaps; the last cue ends before the film does. They are a translation, not a transcript of the Hinglish words. |
| Frozen foreground (`find_frozen.py`) | 49 runs of 8–13.5 s (`frozen_report.txt`); each is a demo's final state held while the slower Hinglish narration finishes the point. Longest 13.5 s (ch 6, the hardship email). |
| Visual review | Stills of the cold open and every stretch of 8 s or more where the English stage shows; contact sheets of all 19 rendered chunks every 5 s; a full-film sheet every 30 s; the spliced fixes checked frame by frame |

## v2 (review fixes, 4 Oct 2026)

- Changes: Hinglish chapter names on title cards, HUD and chapters; BE PRACTICAL with Kishore wordmark (opening, title cards, HUD, closing); complaint graphic says "no reply in time — usually 30 days; longer applicable timelines may apply"; enlarged spoken document lines with Hinglish takeaways in the register, hardship email, settlement letter and credit-report demos; clean hand-off at all 40 back-to-back insert transitions (incl. 29:20).
- `check_av`: 60185 frames, timestamps continuous (0 boundary holds of 18 boundaries).
- `check_vo_sync`: lag +40…+50 ms in every module (decoder baseline), correlation ≥ 0.96.
- Master: −14.00 LUFS, −3.25 dBTP true peak.
