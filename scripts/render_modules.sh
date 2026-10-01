#!/bin/bash
# Render modules one at a time into out/chunks/<Id>.mp4 (finished ones are skipped). No stitching.
# Usage: scripts/render_modules.sh Scene01 Scene02 ...   (log: out/render_modules.log)
# Telugu edition: REMOTION_LANG=te scripts/render_modules.sh ...  -> out/chunks_te/, log out/render_modules_te.log
set -u
cd "$(dirname "$0")/.."
LANGV=${REMOTION_LANG:-en}
CH=out/chunks; LOG=out/render_modules.log; ENVF=()
if [ "$LANGV" = te ]; then
  CH=out/chunks_te; LOG=out/render_modules_te.log
  echo "REMOTION_LANG=te" > out/lang_te.env; ENVF=(--env-file=out/lang_te.env)
fi
export REMOTION_BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p "$CH"
for id in "$@"; do
  [ -f "$CH/$id.mp4" ] && continue
  echo "START $id $(date -u +%H:%M:%S)" >> "$LOG"
  if npx remotion render "$id" "$CH/.$id.partial.mp4" --concurrency=4 "${ENVF[@]}" >> "$LOG" 2>&1; then
    mv "$CH/.$id.partial.mp4" "$CH/$id.mp4"
    echo "DONE $id $(date -u +%H:%M:%S)" >> "$LOG"
  else
    echo "FAILED $id" >> "$LOG"; exit 1
  fi
done
echo "ALLDONE" >> "$LOG"
