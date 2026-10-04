#!/bin/bash
# pull frames from all render-s01/* branches into short01/frames; print missing count
cd "$(dirname "$0")/.."
for ref in $(git ls-remote origin 'refs/heads/render-s01/*' | awk '{print $2}'); do
  git fetch -q origin "$ref" || continue
  for f in $(git ls-tree --name-only FETCH_HEAD short01/frames/); do [ -s "$f" ] || git show "FETCH_HEAD:$f" > "$f"; done
done
python3 -c "
import os;m=[i for i in range(1281) if not os.path.exists(f'short01/frames/f{i:04d}.jpg')]
print('missing',len(m), (m[:3],m[-3:]) if m else '')"
