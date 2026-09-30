# Credit Card Debt in India — Know Your Rights

A narrated, motion-graphics awareness video: 13 modules, about 15 minutes, 1920×1080 at 30 fps. It is built with [Remotion](https://www.remotion.dev/) (React), and everything is generated in code:

- **Voiceover:** offline neural TTS (Kokoro-82M, ONNX) with word-level timings.
- **Subtitles:** word by word; the spoken word glows and upcoming words un-blur as they are said.
- **Visual cues:** tied to the *spoken phrase* (`cueFrame(module, "Golden Rule")`), so editing the script keeps the animation in sync.
- **SFX and music beds:** synthesized procedurally in Python (clicks, stamps, whooshes, gavel, vault, drones). No third-party audio.

> Awareness content only — not legal or financial advice. Claims that could not be confirmed are phrased as "may", "typically" or "reportedly". Bank settlement ranges are reported borrower experiences, not guarantees.

## Modules

| # | Module | Scene file |
|---|--------|-----------|
| 1 | The Core Premise — de-stigmatization, minimum-due funnel, golden rule | `Scene01_CorePremise.tsx` |
| 2 | Legal Reality — civil breach vs. criminal law, SC precedents, police | `Scene02_CivilVsCriminal.tsx` |
| 3 | Portfolio Architecture — no aggregation, tier ledger, cost-to-sue scale | `Scene03_Portfolio.tsx` |
| 4 | Phantom Accounting — fee bricks, RBI compromise laser | `Scene04_PhantomFees.tsx` |
| 5 | Asset Defense — Sec 171 set-off claw, clean anchor bank shield | `Scene05_AssetDefense.tsx` |
| 6 | The Legal Shield — CRM "absconding" flag, PNO email, case ID | `Scene06_PnoShield.tsx` |
| 7 | Recovery Counter-Tactics — WhatsApp location, ghost visits, links, doorstep | `Scene07_RecoveryCounter.tsx` |
| 8 | Telecom Defense — predictive dialer, wildcard blocks, 90-day cycle | `Scene08_TelecomDefense.tsx` |
| 9 | Delinquency Lifecycle — SMA-0 → NPA → write-off vault | `Scene09_Delinquency.tsx` |
| 10 | Lender Profiles — 8 dossier cards (reported patterns) | `Scene10_LenderProfiles.tsx` |
| 11 | OTS & Lok Adalat — gavel, sanction-letter checks, NEFT only | `Scene11_LokAdalatOts.tsx` |
| 12 | CIBIL Rehabilitation — gauge, FD-backed card, 24 on-time months | `Scene12_CibilRebuild.tsx` |
| 13 | Emergency Action Protocol — 8-step checklist + finale | `Scene13_EmergencyAction.tsx` |

## Project layout

```
narration/script.json        single source of truth for the VO text (edit here)
narration/generate_vo.py     TTS -> public/audio/vo/*.mp3 + src/data/timing.json
narration/generate_audio.py  procedural SFX + music -> public/audio/{sfx,music}
src/lib/timing.ts            scene durations from narration, cueFrame()/cueEnd()
src/components/              SceneShell (backdrop, HUD, title card, subtitles, audio), primitives, icons
src/scenes/                  one file per module
scripts/stills.mjs           render review stills; scripts/sheet.py makes contact sheets
```

## Usage

```bash
npm install
npm start                     # Remotion Studio preview
npm run build                 # render out/credit_card_debt_know_your_rights.mp4
```

Each module is also its own composition (`Scene01` … `Scene13`, plus `Intro`):

```bash
npx remotion render Scene07 out/scene07.mp4
```

In a container that already has Chromium, set `REMOTION_BROWSER=/path/to/headless_shell` so Remotion doesn't download one.

### Changing the narration

1. Edit `narration/script.json`. Keep any phrase a scene uses as a cue; a missing cue throws with a clear error.
2. Regenerate the voice (needs `pip install kokoro-onnx soundfile numpy` plus the model files from
   `huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX`: `onnx/model.onnx` and `voices/<voice>.bin`):

   ```bash
   python3 narration/generate_vo.py --models /path/to/kokoro   # or --only m04,m07
   ```

3. Re-render. Scene lengths and all animation cues follow the new timing automatically.

### Using your own voice

1. Read from **`narration/READING_SCRIPT.md`**. It is word for word what the subtitles show, with recording tips and pronunciation notes. Record one file per module.
2. Put the files in `narration/raw/` as `m01.wav` … `m13.wav` (wav/flac/mp3/m4a all work). Leave 3 s of silence at the start of each file.
3. Process:

   ```bash
   pip install pedalboard noisereduce pyloudnorm faster-whisper soundfile numpy
   python3 narration/process_voice.py --preview   # listen to narration/processed/*.mp3 first
   python3 narration/process_voice.py             # write public/audio/vo + src/data/timing.json
   ```

   What the processing does:
   - Spectral noise reduction, using the 3 s of room tone as the noise profile.
   - Transcription and alignment against the script, so subtitles and every animation cue follow your real pacing.
   - Automatic removal of false starts, retakes and "um/uh" fillers, and shortening of pauses longer than 1.1 s. `--no-cut` turns this off.
   - Voice chain: high-pass, de-mud, warmth low-shelf, presence, air, de-esser, two-stage compression, −16 LUFS loudness, RMS downward expander, limiter.

   Each module gets a report in `narration/processed/mNN_report.txt` listing every cut, so you can check nothing wanted was removed.
4. Re-render with `npm run build`.
