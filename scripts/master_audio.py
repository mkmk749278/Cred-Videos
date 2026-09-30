"""Two-pass EBU R128 loudness master for the finished video (video stream is copied untouched).

Usage: python3 scripts/master_audio.py <in.mp4> <out.mp4> [target LUFS, default -14 for YouTube]
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF_DIR = os.path.join(ROOT, 'node_modules/@remotion/compositor-linux-x64-gnu')
FFMPEG = os.path.join(FF_DIR, 'ffmpeg')
ENV = dict(os.environ, LD_LIBRARY_PATH=FF_DIR)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
    tp, lra = -1.5, 11
    probe = subprocess.run(
        [FFMPEG, '-hide_banner', '-i', src, '-vn', '-af', f'loudnorm=I={target}:TP={tp}:LRA={lra}:print_format=json', '-f', 'null', '-'],
        capture_output=True, text=True, env=ENV,
    )
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', probe.stderr, re.S)
    if not m:
        sys.exit('loudness analysis failed:\n' + probe.stderr[-2000:])
    meas = json.loads(m.group(0))
    af = (
        f"loudnorm=I={target}:TP={tp}:LRA={lra}:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
        f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}:linear=true"
    )
    subprocess.run(
        [FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-c:v', 'copy', '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', dst],
        check=True, env=ENV,
    )
    print(f"mastered: input {meas['input_i']} LUFS / {meas['input_tp']} dBTP -> target {target} LUFS, TP {tp}")


if __name__ == '__main__':
    main()
