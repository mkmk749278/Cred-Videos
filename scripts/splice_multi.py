#!/usr/bin/env python3
"""Replace several frame ranges of a rendered chunk in one pass (one re-encode); keep the chunk's audio.

Patches come from scripts/render_ranges.sh (<dir>/<chunk>_<a>_<b>.mp4, composition frames a..b) and
out/patch/ranges.json (off = the chunk's first composition frame). Asserts the frame count is unchanged and
keeps the original as <chunk>.pre_splice.mp4.
Usage: python3 scripts/splice_multi.py out/chunks_hi out/patch [Chunk ...]   (default: every chunk with patches)
"""
import json
import os
import subprocess
import sys

CH, PD = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])
F = 'node_modules/@remotion/compositor-linux-x64-gnu'
env = dict(os.environ, LD_LIBRARY_PATH=F)
ff = [f'{F}/ffmpeg', '-y', '-loglevel', 'error']
enc = ['-video_track_timescale', '90000', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', '-an']


def frames(p):
    return int(subprocess.run([f'{F}/ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                               'stream=nb_read_packets', '-of', 'csv=p=0', p], capture_output=True, text=True, env=env).stdout.strip().rstrip(','))


jobs = {}
for r in json.load(open(f'{PD}/ranges.json')):
    jobs.setdefault(r['chunk'], []).append(r)
for chunk, rs in sorted(jobs.items()):
    if only and chunk not in only:
        continue
    src = f'{CH}/{chunk}.mp4'
    if os.path.exists(f'{CH}/{chunk}.pre_splice.mp4') or not os.path.exists(src):
        print('skip', chunk); continue
    n0 = frames(src)
    d = f'{CH}/.{chunk}.splice'
    os.makedirs(d, exist_ok=True)
    parts, cur = [], 0
    for k, r in enumerate(sorted(rs, key=lambda r: r['a'])):
        a, b = r['a'] - r['off'], r['b'] - r['off']
        mid = f"{PD}/{chunk}_{r['a']}_{r['b']}.mp4"
        assert frames(mid) == b - a + 1, (mid, frames(mid), b - a + 1)
        if a > cur:
            p = f'{d}/s{k}.mp4'
            subprocess.run(ff + ['-i', src, '-ss', f'{cur / 30:.6f}', '-frames:v', str(a - cur)] + enc + [p], check=True, env=env)
            parts.append(p)
        p = f'{d}/m{k}.mp4'
        subprocess.run(ff + ['-i', mid] + enc + [p], check=True, env=env)
        parts.append(p)
        cur = b + 1
    if cur < n0:
        p = f'{d}/tail.mp4'
        subprocess.run(ff + ['-i', src, '-ss', f'{cur / 30:.6f}'] + enc + [p], check=True, env=env)
        parts.append(p)
    open(f'{d}/list.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
    subprocess.run(ff + ['-f', 'concat', '-safe', '0', '-i', f'{d}/list.txt', '-i', src, '-map', '0:v', '-map', '1:a',
                         '-c', 'copy', f'{d}/out.mp4'], check=True, env=env)
    n1 = frames(f'{d}/out.mp4')
    assert n0 == n1, (chunk, n0, n1, [frames(p) for p in parts])
    os.replace(src, f'{CH}/{chunk}.pre_splice.mp4')
    os.replace(f'{d}/out.mp4', src)
    subprocess.run(['rm', '-rf', d])
    print('spliced', chunk, len(rs), 'ranges', n1, 'frames')
