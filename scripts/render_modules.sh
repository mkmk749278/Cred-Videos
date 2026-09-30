#!/bin/bash
# Render modules one at a time into out/chunks/<Id>.mp4 (finished ones are skipped). No stitching.
# Usage: scripts/render_modules.sh Scene01 Scene02 ...   (log: out/render_modules.log)
set -u
cd "$(dirname "$0")/.."
LOG=out/render_modules.log
export REMOTION_BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out/chunks
for id in "$@"; do
  [ -f "out/chunks/$id.mp4" ] && continue
  echo "START $id $(date -u +%H:%M:%S)" >> "$LOG"
  if npx remotion render "$id" "out/chunks/.$id.partial.mp4" --concurrency=4 >> "$LOG" 2>&1; then
    mv "out/chunks/.$id.partial.mp4" "out/chunks/$id.mp4"
    echo "DONE $id $(date -u +%H:%M:%S)" >> "$LOG"
  else
    echo "FAILED $id" >> "$LOG"; exit 1
  fi
done
echo "ALLDONE" >> "$LOG"
