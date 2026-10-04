# Telugu Short 01 — production notes

**Minimum due కట్టినా interest ఎందుకు పడుతుంది?** · BE PRACTICAL with Kishore · rendered 4 October 2026

## Deliverables

| File | What |
|---|---|
| `SHORT_01_TELUGU_FINAL.mp4` | 1080 × 1920, 30 fps CFR, **1281 frames / 42.70 s**, H.264 High, yuv420p, ~15.8 Mbps, AAC 48 kHz stereo 256 kbps, fast-start |
| `SHORT_01_COVER.png` | Cover: "MINIMUM PAID… INTEREST?" over a fresh render of this Short's payment slip and interest line (frame 2) |
| `SHORT_01_TELUGU_FULL.srt` | Full Telugu captions, 12 cues, timed to the measured speech onsets/offsets of the supplied MP3 |
| Editable project | `short01/` in this repo (see "Rebuild") |

The 4K (2160 × 3840) master was not made. The scene would need a 4× longer render, and upscaling the 1080p master adds no real detail.

## Audio

- Narration: the supplied ElevenLabs MP3, unchanged. It starts at frame 0 and keeps every pause, word and its speed (SHA-256 9186b193…75da47 verified). The source's quiet tail is kept, and the last visual holds to 42.70 s.
- Mix: voice, plus room tone at −46 dB and a faint warm pad at −33 dB. Foley is placed on the visual cues: paper slides, receipt printer, terminal beeps, highlighter strokes and a phone tick. The foley ducks under the voice.
- Mastering (`short01/master.py`):
  - Loudness and peak: **−14.04 LUFS integrated, −1.71 dBTP** (4× oversampled, measured after the AAC encode).
  - The limiter is a transparent lookahead limiter. At most 2.8 dB of gain reduction, on a few speech peaks only.
  - Accuracy: the final audio correlates 0.997 with the original voice, with 0 ms offset. No clipping and no trimmed words.
- The handoff suggested about −16 LUFS for the mono voice. The final is mastered to the YouTube reference loudness (−14 LUFS, measured as stereo). The voice comes out about 3 dB above its source level, with the peaks limited.

## Timing against the recording

The scene cuts follow `SHORT_01_SCENE_TIMINGS.json` exactly. Measured silence gaps in the MP3 confirm the sentence onsets at 5.81, 13.47, 17.05, 21.34, 25.53, 27.71, 30.87, 35.29 and 38.73 s.

One cue differs from the JSON. **"మీరు shopping…" actually starts at 9.75 s, not 9.22 s**; "pay చేస్తే" ends at 9.40 s. The checkout shot therefore opens about 0.5 s before those words, which works as a motivated lead-in. The 7 May highlight still starts on "రోజు నుంచే", around frame 335.

Key visual events (frames):
- Payment-received slip in focus: 8–60.
- Rack focus to "Interest charged… CHARGED", with a pen stopping beside it: 80–112.
- Total ₹50,000 → minimum ₹1,000, then the slip slides in: 176–240.
- ₹50,000 sale approved, and the receipt prints "07 MAY 2026": 283–322.
- The 7 May mark starts: 335. Highlighter rows run through May: 410–500.
- The 1 June slip lands: 511–530. The ₹49,000 card appears: 545–561.
- "Late payment charge 0.00": 715. Amber mark on the interest line: 766–800.
- ₹2,400 sale, receipt "04 JUN 2026": 912–944. Second mark from 4 June: 993.
- The phone wakes: 1112. The full-video invitation starts: 1166.

## Captions

- **Burned in:** only the handoff's short takeaway captions, one at a time, at 64 px in Inter plus Noto Sans Telugu (Chromium/HarfBuzz shaping). The opening hook is visible on frame 0.
- **"EXAMPLE · fictional amounts & dates" tag:** top-left, shown whenever amounts are on screen.
- **Placement:** all overlays sit inside x 90–880 and y 160–1450.
- **Full SRT:** the wording is the handoff's reference transcript. The timestamps are corrected to the audio's measured pauses. The wording still needs one listening check by Kishore before publishing, because the Telugu transcript came from automatic recognition.

## The financial example (consistent everywhere)

| Item | Value |
|---|---|
| Purchase | 7 May, ₹50,000, Example Electronics |
| Statement | 12 May: total due ₹50,000.00, minimum due ₹1,000.00, due date 1 June |
| Payment | ₹1,000 received 1 June ("Payment received · Successful", green) |
| Balance | ₹50,000 − ₹1,000 = ₹49,000 before interest and other additions |
| New purchase | 4 June, ₹2,400, Sri Lakshmi General Stores |
| Later statement | 12 June. Payment received 1,000.00 CR; late payment charge **0.00**; interest charged **"CHARGED"** |

- There is no APR, no computed interest amount and no grand total anywhere.
- The bank is the fictional "EXAMPLE BANK", and the card is •••• 4821.

## Picture: how it was made

- **Tools:** Blender 4.2 (bpy), Cycles path tracing (CPU, 16 samples with OpenImageDenoise), AgX colour.
- **Camera:** real camera depth of field. Rack focus is the actual focus distance animating. Lenses are 30–58 mm.
- **Lighting:** a warm low window sun plus HDRI interior light.
- **Text:** every printed or on-screen word is typeset deterministically (`short01/make_textures.py`, PIL with HarfBuzz/raqm) and mapped onto paper, thermal-receipt, terminal and phone geometry. Nothing is generated lettering.
- **Hands:** no hands are shown. No credible licensed hand rig was available, so the handoff's fallback is used: pen, highlighter, receipt-printer and paper actions, with the tool bodies leaving the frame as if held.
- **Original footage:** nothing is taken from the long video. The phone cover is newly made.

## Asset sources and licences

| Asset | Source | Licence |
|---|---|---|
| HDRIs: lythwood_room, phone_shop, comfy_cafe | Poly Haven | CC0 |
| Textures: wood_table_001, granite_tile, oak_veneer_01 | Poly Haven | CC0 |
| Models: potted_plant_01, office_notepads, round_spectacles | Poly Haven | CC0 |
| Fonts: Inter, Noto Sans, Noto Sans Mono, Noto Sans Telugu, Caveat | Google Fonts | SIL OFL 1.1 |
| Card, terminal, pens, phone, papers, calendar | Modelled procedurally in `short01/scene.py` | original |
| Narration | Supplied ElevenLabs export (Bunty, v4) | user-supplied |
| SFX and music bed | Synthesised in `short01/make_audio.py` | original |

## Related Video (YouTube Studio)

Set the Short's **Related video** to https://youtu.be/lZKBTCqDlsA. This needs advanced features, and the target must be public or unlisted. The burned-in "Full Telugu video ↓" is only a visual pointer.

Suggested title: **Minimum due కట్టినా interest ఎందుకు పడుతుంది?**

## Rebuild

```bash
pip install bpy==4.2.0 numpy pillow fonttools brotli av soundfile scipy pyloudnorm
python3 short01/fetch_assets.py && python3 short01/make_textures.py && python3 short01/scene.py   # -> short01/build/short01.blend
python3 short01/render.py short01/frames 0-1280 --samples 16    # ~47 s/frame on 4 CPUs; split ranges across sessions (short01/worker.sh)
short01/assemble.sh                                             # composite (Remotion `Short01`), master, cover
```
