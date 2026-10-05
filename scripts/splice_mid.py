#!/usr/bin/env python3
"""Replace frames a..b of a rendered chunk with a re-render of just those frames; keep the chunk's audio.

The bundled ffmpeg has no setpts/trim, so: re-encode head (-frames:v a), the new middle and the tail
(accurate output-side -ss) with identical settings, join with the concat demuxer, mux the original audio,
and assert the frame count is unchanged.
Usage: python3 scripts/splice_mid.py out/chunks_te/Scene11.mp4 mid.mp4 a b
"""
import os
import shutil
import subprocess
import sys

src, mid, a, b = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
FPS = int(os.environ.get('FPS', 30))  # chunk frame rate (the doorstep short is 60)
F = 'node_modules/@remotion/compositor-linux-x64-gnu'
env = dict(os.environ, LD_LIBRARY_PATH=F)
ff = [f'{F}/ffmpeg', '-y', '-loglevel', 'error']
enc = ['-video_track_timescale', '90000', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-an']
d = src + '.splice'
os.makedirs(d, exist_ok=True)


def frames(p):
    return int(subprocess.run([f'{F}/ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                               'stream=nb_read_packets', '-of', 'csv=p=0', p], capture_output=True, text=True, env=env).stdout.strip().rstrip(','))


n0 = frames(src)
assert frames(mid) == b - a + 1, ('mid frames', frames(mid), b - a + 1)
subprocess.run(ff + ['-i', src, '-frames:v', str(a)] + enc + [f'{d}/0.mp4'], check=True, env=env)
subprocess.run(ff + ['-i', mid] + enc + [f'{d}/1.mp4'], check=True, env=env)
subprocess.run(ff + ['-i', src, '-ss', f'{(b + 1) / FPS:.6f}'] + enc + [f'{d}/2.mp4'], check=True, env=env)
open(f'{d}/list.txt', 'w').write("file '0.mp4'\nfile '1.mp4'\nfile '2.mp4'\n")
subprocess.run(ff + ['-f', 'concat', '-safe', '0', '-i', f'{d}/list.txt', '-i', src, '-map', '0:v', '-map', '1:a',
                     '-c', 'copy', f'{d}/out.mp4'], check=True, env=env)
n1 = frames(f'{d}/out.mp4')
print('parts', [frames(f'{d}/{i}.mp4') for i in range(3)], 'total', n1, 'orig', n0)
assert n0 == n1, (n0, n1)
os.replace(src, src.replace('.mp4', '.pre_splice.mp4'))
os.replace(f'{d}/out.mp4', src)
shutil.rmtree(d)
print('spliced', src, n1, 'frames')
