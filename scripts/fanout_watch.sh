#!/bin/bash
# Block until a worker pushes a new chunk branch (<prefix>/*) or the local render log gets a new DONE/FAILED line.
# Run it as a harness background task (timeout ≤ 2 h) and re-arm it after every wake-up, so the container is
# never idle. Usage: scripts/fanout_watch.sh <prefix> <lang: en|te|enh|hi>
cd "$(dirname "$0")/.."
P=$1; L=${2:-en}
LOG=out/render_modules.log; [ "$L" != en ] && LOG=out/render_modules_$L.log
l0=$(grep -cE "^(DONE|FAILED|ALLDONE)" "$LOG" 2>/dev/null)
b0=$(git ls-remote --heads origin "$P/*" 2>/dev/null | wc -l)
for i in $(seq 1 340); do
  sleep 20
  l=$(grep -cE "^(DONE|FAILED|ALLDONE)" "$LOG" 2>/dev/null)
  b=$b0; [ $((i % 6)) -eq 0 ] && b=$(git ls-remote --heads origin "$P/*" 2>/dev/null | wc -l)
  if [ "$l" != "$l0" ] || [ "$b" != "$b0" ]; then
    grep -E "^(DONE|FAILED|ALLDONE)" "$LOG" 2>/dev/null | tail -3; git ls-remote --heads origin "$P/*" | sed 's#.*refs/heads/##'; exit 0
  fi
done
echo TIMEOUT
