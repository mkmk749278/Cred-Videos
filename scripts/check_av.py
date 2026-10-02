"""Fail if a stitched video's frame timestamps jump anywhere except a tiny hold at chunk boundaries.
Usage: check_av.py joined.mp4 chunk1.mp4 chunk2.mp4 ..."""
import os, subprocess, sys
F = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'node_modules/@remotion/compositor-linux-x64-gnu')
env = dict(os.environ, LD_LIBRARY_PATH=F)
def probe(path, entries):
    return subprocess.run([f'{F}/ffprobe', '-v', 'error', '-select_streams', 'v:0'] + entries + ['-of', 'csv=p=0', path],
                          capture_output=True, text=True, env=env, check=True).stdout.split()
joined, chunks = sys.argv[1], sys.argv[2:]
pts = sorted(float(x.strip(',')) for x in probe(joined, ['-show_entries', 'packet=pts_time']) if x.strip(','))
bounds, n = set(), 0
for c in chunks:
    n += int(probe(c + ('.mp4' if not c.endswith('.mp4') else ''), ['-count_packets', '-show_entries', 'stream=nb_read_packets'])[0].strip(','))
    bounds.add(n)
assert len(pts) == n, f'frame count {len(pts)} != chunks {n}'
bad = [i for i in range(1, len(pts)) if abs(pts[i] - pts[i - 1] - 1 / 30) > 0.002 and not (i in bounds and pts[i] - pts[i - 1] < 0.15)]
if bad:
    sys.exit(f'timestamp jumps at frames {bad[:10]} (of {len(bad)})')
print(f'check_av: {n} frames, timestamps continuous (holds only at {len(bounds) - 1} chunk boundaries)')
