#!/usr/bin/env python3
"""Render frames of short01.blend (resumable; skips frames already on disk).

    python3 short01/render.py <outdir> <frames: a-b | a,b,c> [--pct 100] [--samples 64]
"""
import bpy, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
out, spec = args[0], args[1]
pct = int(args[args.index('--pct') + 1]) if '--pct' in args else 100
samples = int(args[args.index('--samples') + 1]) if '--samples' in args else None
frames = []
for part in spec.split(','):
    if '-' in part:
        a, b = map(int, part.split('-'))
        frames += list(range(a, b + 1))
    else:
        frames.append(int(part))
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, 'build', 'short01.blend'))
sc = bpy.context.scene
sc.render.resolution_percentage = pct
if samples:
    sc.cycles.samples = samples
sc.cycles.threads = 0
sc.render.use_persistent_data = True
cams = json.load(open(os.path.join(HERE, 'build', 'cams.json')))
os.makedirs(out, exist_ok=True)
for f in frames:
    path = os.path.join(out, f'f{f:04d}.jpg')
    if os.path.exists(path):
        continue
    sc.frame_set(f)
    for f0, f1, name in cams:
        if f0 <= f < f1:
            sc.camera = bpy.data.objects[name]
    sc.render.filepath = path + '.tmp.jpg'
    t = time.time()
    bpy.ops.render.render(write_still=True)
    os.replace(path + '.tmp.jpg', path)
    print(f'frame {f} {time.time() - t:.1f}s', flush=True)
