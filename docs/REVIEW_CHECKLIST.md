# Review checklist (every module, before sharing)

Look at contact sheets every 3 s **and** full-size frames around each transition.

## Content
- [ ] Every number on screen matches the narration (do the arithmetic).
- [ ] Unconfirmed claims are hedged ("may / typically / reportedly"); disclaimer present where needed.
- [ ] Bridge line + "SO FAR" recap make sense after the previous module.

## Layout
- [ ] No text overlaps 3D objects, panels, the HUD, or the subtitle band.
- [ ] No two text lines cross-fade in the same spot (next line starts ≥ 10 frames after the previous `out`).
- [ ] Moving elements (people, banners, pointers) never pass over other panels.
- [ ] Nothing clipped at the stage edges (stacks, cards, phones, hands).
- [ ] No half-empty frame for more than a few seconds.

## Motion and timing
- [ ] Each visual appears on its spoken cue; ticks land at the end of the point.
- [ ] No static hold > ~6 s (run `scripts/find_static_holds.py`).
- [ ] Transitions are clean on full-size frames (no ghost boxes, flashes, glitches).

## Image quality
- [ ] Small text on 3D surfaces is crisp (use `dpr={1}` on small `Scene3D` canvases).
- [ ] Colours/brightness consistent with neighbouring modules.

## Audio
- [ ] `loudnorm` summary: no true-peak above −1 dBTP before mastering; voice clearly above music.
- [ ] Any regenerated line transcribed back correctly (faster-whisper).
