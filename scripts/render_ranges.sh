#!/bin/bash
# Render many frame ranges from one bundle (patch renders for splicing; see scripts/handoff_ranges.py).
# Usage: REMOTION_LANG=hi scripts/render_ranges.sh out/patch/ranges.json out/patch
# Writes <outDir>/<chunk>_<a>_<b>.mp4 (comp frames a..b, video only); skips existing files. Log: <outDir>/log.txt
cd "$(dirname "$0")/.."
LIST=$1; OUT=$2; L=${REMOTION_LANG:-en}; LOG=$OUT/log.txt
mkdir -p out "$OUT"; echo "REMOTION_LANG=$L" > out/lang_$L.env
[ -d "$OUT/bundle" ] || npx remotion bundle src/index.ts --out-dir="$OUT/bundle" >> "$LOG" 2>&1
python3 -c "import json,sys; [print(j['comp'], j['chunk'], j['a'], j['b']) for j in json.load(open(sys.argv[1]))]" "$LIST" |
while read comp chunk a b; do
  f="$OUT/${chunk}_${a}_${b}.mp4"; [ -f "$f" ] && continue
  if npx remotion render "$OUT/bundle" "$comp" "$OUT/.part.mp4" --frames=$a-$b --muted --concurrency=4 --gl=swangle \
       --env-file=out/lang_$L.env --browser-executable="$REMOTION_BROWSER" >> "$LOG" 2>&1 < /dev/null; then
    mv "$OUT/.part.mp4" "$f"; echo "DONE $chunk $a $b" >> "$LOG"
  else echo "FAILED $chunk $a $b" >> "$LOG"; fi
done
echo ALLDONE >> "$LOG"
