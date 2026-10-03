#!/bin/bash
# Fetch every chunk a worker has pushed to <prefix>/<Id> that is not yet local, and make its review sheets
# (out/review/<Id>_N.jpg, one frame every 5 s). Look at every sheet before stitching.
# Usage: scripts/fanout_ingest.sh <prefix> <lang: en|te|enh|hi> [Id to skip ...]   (skip = stale chunks being re-rendered)
cd "$(dirname "$0")/.."
P=$1; L=${2:-en}; shift 2
CH=out/chunks; [ "$L" != en ] && CH=out/chunks_$L
mkdir -p "$CH"
for id in $(git ls-remote --heads origin "$P/*" | sed "s#.*refs/heads/$P/##"); do
  [ -f "$CH/$id.mp4" ] && continue
  case " $* " in *" $id "*) continue;; esac
  for i in 1 2 3 4; do git fetch -q origin "$P/$id" && break; sleep $((2**i)); done
  if git show "FETCH_HEAD:$CH/$id.mp4" > "$CH/.$id.fetch" 2>/dev/null && [ -s "$CH/.$id.fetch" ]; then
    mv "$CH/.$id.fetch" "$CH/$id.mp4"
    python3 scripts/review_chunk.py "$CH/$id.mp4" 5 | tail -1
  else
    rm -f "$CH/.$id.fetch"; echo "FETCHFAIL $id"
  fi
done
echo "local: $(ls "$CH" | grep -c '\.mp4$') chunks in $CH"
