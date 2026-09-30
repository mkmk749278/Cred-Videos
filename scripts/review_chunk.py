"""Review sheets for a rendered chunk: frames every N seconds, tiled 4-wide with timestamps.

Usage: python3 scripts/review_chunk.py out/chunks/Scene02.mp4 [step_seconds=3]
Writes out/review/<Id>_<k>.jpg (16 frames per sheet).
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF_DIR = os.path.join(ROOT, 'node_modules/@remotion/compositor-linux-x64-gnu')
ENV = dict(os.environ, LD_LIBRARY_PATH=FF_DIR)


def duration(path):
    out = subprocess.run([os.path.join(FF_DIR, 'ffprobe'), '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', path],
                         capture_output=True, text=True, env=ENV).stdout
    return float(json.loads(out)['format']['duration'])


def main():
    src = sys.argv[1]
    step = float(sys.argv[2]) if len(sys.argv) > 2 else 3
    name = os.path.splitext(os.path.basename(src))[0]
    outdir = os.path.join(ROOT, 'out/review')
    os.makedirs(outdir, exist_ok=True)
    d = duration(src)
    times, t = [], 0.5
    while t < d:
        times.append(t)
        t += step
    tw, th = 480, 270
    frames = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(times):
            p = os.path.join(tmp, f'{i:04d}.jpg')
            subprocess.run([os.path.join(FF_DIR, 'ffmpeg'), '-v', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1', '-s', f'{tw}x{th}', '-y', p],
                           env=ENV, check=True)
            im = Image.open(p).convert('RGB')
            ImageDraw.Draw(im).text((6, 4), f'{t:6.1f}s', fill=(255, 255, 0))
            frames.append(im)
    per = 16
    for k in range(0, len(frames), per):
        group = frames[k:k + per]
        rows = (len(group) + 3) // 4
        sheet = Image.new('RGB', (tw * 4, th * rows))
        for i, im in enumerate(group):
            sheet.paste(im, ((i % 4) * tw, (i // 4) * th))
        sheet.save(os.path.join(outdir, f'{name}_{k // per}.jpg'), quality=82)
    print(f'{name}: {d:.1f}s, {len(frames)} frames, {(len(frames) + per - 1) // per} sheets')


if __name__ == '__main__':
    main()
