# Verification report: Telugu edition with animated demonstrations

**Export:** `Credit Card Debt - Know Your Rights (Telugu, demonstrations).mp4`

| Property | Value |
|---|---|
| Video | 1920×1080, 30 fps, H.264 |
| Audio | AAC 48 kHz stereo |
| Duration | 31:11.20 (1871.20 s) |
| Frames | 56,136 |

The previously approved export remains available unchanged in the Gofile folder `Telugu final (v2)`. A drift-free copy of it now sits alongside the original, as described in §2.

## 1. What was implemented

There are 40 animated demonstrations, plus object icons on the cold-open roadmap. They replace the text-card sequences across all 13 chapters, and they cover every place where the English stage contradicted or overstated the Telugu narration. The brief's A–P items map to the demos below; `beat_manifest.json` lists every demonstration's objects, actions, labels, qualifications and cue text.

| Brief | Demonstration(s) |
|---|---|
| A | Cold-open phone with calls/messages; roadmap lines with statement / bank / shield / phone / letter / report icons |
| B | Card rotation loop (balance remains); household budget tray: ₹40,000 − essentials = ₹7,000 (illustration) |
| C | Three legal lanes; notice → court → order; threatening message into a VERIFY tray, notice checked and filed |
| D | Scattered cards and bills become a register (fictional Bank A/B/C, masked numbers); "settling one bank ≠ the others" |
| E | Statement lines highlighted as spoken (reconciled total ₹1,02,956); ₹1,00,000 × 3% ≈ ₹3,000, labelled as an illustration |
| F | Minimum-on-time vs full-payment tracks; disputed ₹600 fee: written breakdown → dispute ref → under review → waiver only if approved; checklist before any proposal |
| G | Same-bank frame, sample Clause 14, conditional "may adjust" arrow; then "Understand your bank's set-off terms. Plan essential expenses." |
| H | Silence vs one written message; hardship email to `grievance@bank-a.example`; ₹20,000-tomorrow ✕ vs ₹7,000/month ✓; records folder ("a record, not a shield") |
| I | Calling-hours bar with a call sweeping the 8 am–7 pm window; caller verification; "agent visited" message check; location request; link check; doorstep ID/letter (112 only for immediate danger); evidence filing; complaint path to the RBI Ombudsman |
| J | Example phone settings with one verified channel open; the 60-day myth (agency changes, calls dip and rise, the debt remains) |
| K | Calendar from the original due date: > 3 days rule, overdue cursor, NPA = minimum due not fully paid within 90 days; bank ledger vs borrower obligation for write-off |
| L | EMI offer fields vs ₹7,000 available (illustrative EMIs); friend's 25% vs your account factors; two fictional written proposals |
| M | Fictional Bank A settlement letter (₹30,000 in 3 × ₹10,000 instalments): issuer, account, amount, dates, terms, reporting, channel. Also covered: official-app verification, screenshot ✕, "pay ₹5,000 now" warning with the ₹5,000 sliding into the wrong bucket, authorised payment channels, receipts and certificates |
| N | Lok Adalat table: proposal, accept / don't accept, consent, final-and-binding award, no ordinary appeal |
| O | "Is my CIBIL ruined?" (no score number); Settled vs Closed report rows, where the No Dues Certificate does not flip the status; stabilise first; FD-backed card ("not a guarantee"); 10–20% usage example; report error dispute where accurate history stays |
| P | 8-step plan re-using the earlier objects, each lit on its spoken step |

The specific asks from the brief are all in place:
- "CREDITOR-BANK ACCOUNTS: KEEP AT ₹0" is replaced by "Understand your bank's set-off terms. Plan essential expenses."
- The NPA and write-off wording matches the narration.
- "Settled" and "Closed" are kept separate.
- No screen promises a score rise.

## 2. Verification performed

**Frame review.** Every chunk was reviewed on 5-second contact sheets, plus stills at demo entry, midpoint, exit and the tails. Problems found and fixed:
- overlaps with captions and with the chapter title cards;
- clipped labels;
- the sample tag hidden by a camera zoom;
- a ₹35,000 / ₹30,000 inconsistency between screens;
- invented rates (42% APR / 18% GST);
- an unlabelled 780 → 580 score gauge;
- real bank and card names on 3D cards;
- unsupported claims ("phantom charges may be waived", "counters wilful default", "10,000 identical texts — often nobody visited").

**Content audit.** All 282 s where the English stage shows between panels were audited on stills. Everything that contradicted or exceeded the Telugu narration is now covered by a matching demonstration.

**Timing source.** One source of truth, `inserts.json`, feeds `process_telugu.py`, which writes `inserts_te.json`. `scripts/check_demos.py` checks that windows are ordered, have positive durations and don't overlap, and that every beat a demo reads is defined. Result: 40 demos, 0 problems. `check_cues.py` finds every cue.

**Seekability.** Every visual property is a pure function of the frame. Chunks were rendered out of order on 13 machines and spliced, so frames are reproduced independently of playback order.

**Frame timestamps.** `scripts/check_av.py` found 56,136 frames with continuous timestamps and 0 holds at the 14 chunk boundaries.

**Narration (PCM).** `scripts/check_vo_sync.py` compares the export against the locked narration files cut from `full.mp3`:
- The lag is a constant 40–50 ms in all 14 sections; that is the decoder offset, about one frame.
- The correlation is 0.97–0.99.
- Against the approved export, the correlation is 0.98–1.00 per section. The exception is chapter 7, where the approved file is 40 ms early.
- No new text-to-speech, no stretching. The duration equals the timeline.

**Audio master.** −14.00 LUFS integrated, true peak −1.7 dBTP.

**Subtitles and chapters.** `captions_en.srt` (576 cues) and `chapters.txt` (14 chapters) are generated from the same timeline. The chapter times match the brief's chapter table (17:19, 19:55, 20:53, 24:37, 27:50).

**Frozen foreground.** `scripts/find_frozen.py` decodes the whole export, excludes the caption band, and counts a window as moving when ≥ 0.3% of foreground pixels change within 1 s. The two longest holds (17.7 s and 15.1 s) were broken up with new motion and spliced in. The remaining runs of 8 s or more are listed in `frozen_report.txt`. Each is a single explanation beat whose caption still changes: a demo's final state held while the narration finishes the point, or a closing reflection panel.

**Timing fix found during verification.** The approved export carried ~50 ms picture holds at every chunk join. As a result, its subtitles and chapters drifted by up to 0.6 s towards the end. `stitch.sh` now joins gap-free video with audio trimmed per chunk. A drift-free copy of the approved export was uploaded next to the original.

## 3. Limits

- The regulatory statements were checked against the documents named in `ASSET_LEDGER.md` as known at production time. Those documents were not re-downloaded in this session; re-check the current versions before any public release.
- The English subtitles follow the creator's translation. Telugu word boundaries are approximated from the anchors in `map.json`.
- Up to about 3 s of the English stage remains visible at a few chapter openings, while the title card fades. It carries no claims.
- Nothing was uploaded to YouTube.
