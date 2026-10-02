#!/bin/bash
# Chapter previews (960x540) and the settlement-letter sample cut from the final Telugu export.
# Usage: scripts/make_previews_te.sh final.mp4 outdir
set -eu
cd "$(dirname "$0")/.."
FF=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
export LD_LIBRARY_PATH="$(dirname "$FF")"
IN=$1; OUT=$2; mkdir -p "$OUT"
python3 - "$IN" "$OUT" <<'PY' > "$OUT/.cuts.tsv"
import json, sys
m = json.load(open('publish/telugu/beat_manifest.json'))
for sc in m['scenes']:
    print(f"{sc['scene_id']}\t{sc['video_start']}\t{sc['video_end'] - sc['video_start']:.3f}")
    for b in sc['beats']:
        if b.get('beat_id') == 'letter':
            print(f"SettlementLetterSample\t{b['video_start'] - 1.0:.3f}\t{b['video_end'] - b['video_start'] + 2.0:.3f}")
PY
while IFS=$'\t' read -r name ss dur; do
  if [ "$name" = SettlementLetterSample ]; then
    "$FF" -nostdin -y -loglevel error -ss "$ss" -i "$IN" -t "$dur" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT/settlement_letter_sample_1080p.mp4"
  else
    "$FF" -nostdin -y -loglevel error -ss "$ss" -i "$IN" -t "$dur" -vf scale=960:540 -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k "$OUT/preview_${name}.mp4"
  fi
  echo "$name $(du -h "$OUT"/*"${name#Settlement}"* 2>/dev/null | tail -1 | cut -f1)"
done < "$OUT/.cuts.tsv"
