# Review checklist (before rendering, and before sharing anything)

## Before rendering a module (the pre-render gate, PLAYBOOK §5.2)
- [ ] `tsc`, `check_cues.py` and `check_demos.py [enh]` all pass with 0 problems.
- [ ] Stills at the start, midpoint and end of every demo you changed.
- [ ] **Stage-gap audit.** Take a still every 2.5 s wherever no demo or panel covers the stage. Nothing there may contradict or overstate the narration. That includes title-card fades and scene tails.
- [ ] `beatcheck.py`: each beat's on-screen line matches the words spoken at that moment.

## Content
- [ ] Every number on screen matches the narration, and the totals reconcile.
- [ ] Unconfirmed claims are hedged, and the disclaimer is present.
- [ ] Rules from law or regulation keep their qualifications. Example: NPA = the minimum due not fully paid within 90 days of the due date.
- [ ] Fictional banks and people, masked numbers, `.example` domains. No real logos or bank-specific percentages.
- [ ] Every example figure has an "Illustration / Sample" tag, and the tag stays visible during zooms.
- [ ] Quotes use the speaker's own words for that edition.
- [ ] The bridge line and the "SO FAR" recap make sense after the previous module.

## Layout
- [ ] No text overlaps panels, the HUD, the caption band or the title card.
- [ ] No two text lines cross-fade in the same spot (the next line starts ≥ 10 frames after the previous `out`).
- [ ] Moving elements never pass over other panels.
- [ ] Nothing is clipped at the edges.
- [ ] Readable at 640×360: labels ≥ 38 px, notes ≥ 28 px.
- [ ] Reels: nothing important below y ≈ 1480 or in the right 150 px, and the hook is visible on frame 0.

## Motion and timing
- [ ] Each visual appears on its spoken cue, and ticks land at the end of the point.
- [ ] Order-dependent visuals follow this narration's order.
- [ ] No frozen foreground ≳ 12 s (`find_frozen.py`); shorter holds carry a changing caption.

## After rendering a chunk
- [ ] Review sheets every 5 s (`review_chunk.py`), plus full-size frames around anything you changed.
- [ ] Spliced chunks: frame count unchanged, and the frames either side of the splice identical to the original.

## Final file
- [ ] `check_av.py`: continuous, 0 boundary holds.
- [ ] `check_vo_sync.py`: constant lag ≈ +40–50 ms in every chapter, duration = timeline.
- [ ] −14 LUFS, true peak ≤ −1.5 dBTP.
- [ ] Full-film sheet every 30 s, looked at.
- [ ] Subtitles: no overlaps, last cue before the end. Chapters match the timeline.
- [ ] Gofile upload md5 `(match)`, and the approved export kept alongside.
