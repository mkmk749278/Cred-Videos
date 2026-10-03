#!/usr/bin/env python3
"""Plan a parallel (multi-session) render: balance the film's compositions across N cloud workers.

Reads each composition's frame count (npx remotion compositions, for the given edition), splits any
composition longer than --split frames into halves (rendered with --frames, joined by stitch.sh), and
assigns jobs longest-first to the least-loaded worker. Writes, under out/fanout/<prefix>/:
  plan.json, worker_NN.txt (the exact create_session prompt for each worker), local.txt (jobs to run here)
Usage:
  python3 scripts/fanout_plan.py --lang enh --sha <commit> --prefix render-en2 --workers 9 [--split 4000] [--local ColdOpen,Scene06]
Then: create one session per worker_NN.txt (source_revision = the working branch), run local.txt jobs here,
and watch/ingest with scripts/fanout_watch.sh + scripts/fanout_ingest.sh. See docs/PLAYBOOK.md §6.
"""
import argparse
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRANCH = 'ccr-c1d4fa8a-p80wyo'
CHUNKS = {'en': 'out/chunks', 'te': 'out/chunks_te', 'enh': 'out/chunks_enh'}

PROMPT = """You are a render worker for the Cred-Videos Remotion project ({label}). Work autonomously; nobody will answer questions. Do not change or commit any source files. Your jobs: {jobs}

1. git fetch origin {branch} && git checkout {sha} (verify with git rev-parse HEAD). Then npm ci.
2. export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
3. npx tsc --noEmit -p . must pass.
4. {envprefix}setsid nohup scripts/render_modules.sh {jobs} > /dev/null 2>&1 < /dev/null &
   Output goes to {chunks}/, log to {log}. Roughly 0.4-1 s per frame.
   Keep a harness background watcher armed at all times (Bash run_in_background with an until-loop on the log, timeout under 2 h; re-arm when it ends) waiting for a new DONE / FAILED / ALLDONE line, so the container is never idle. Never use pkill -f; kill by PID only.
   If the container restarts: delete {chunks}/.*.partial.mp4 and relaunch the same command (finished jobs are skipped).
   On FAILED: read the log, fix only environment problems (never edit src/), relaunch.
5. After each job finishes (its output name is the part after ':' for range jobs, else the job itself), hand it off through git (no uploads, no tokens):
   git checkout -B {prefix}/<Id> && git add -f {chunks}/<Id>.mp4 && git commit -m "Render chunk <Id>" && git push -u origin {prefix}/<Id>
   (retry the push up to 4 times on network errors), then git checkout {sha} before the next job.
6. When every job is pushed, reply with one line per chunk: <Id> <md5sum>.
No stitching, mastering or PRs."""


def frames_per_comp(lang):
    envf = os.path.join(ROOT, f'out/lang_{lang}.env')
    os.makedirs(os.path.dirname(envf), exist_ok=True)
    open(envf, 'w').write(f'REMOTION_LANG={lang}\n')
    env = dict(os.environ, REMOTION_BROWSER=os.environ.get('REMOTION_BROWSER', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'))
    out = subprocess.run(['npx', 'remotion', 'compositions', f'--env-file={envf}'], cwd=ROOT, capture_output=True, text=True, env=env, timeout=600).stdout
    fr = {}
    for line in out.splitlines():
        m = re.match(r'^(ColdOpen|Scene\d\d)\s+\d+\s+\d+x\d+\s+(\d+)', line.strip())
        if m:
            fr[m.group(1)] = int(m.group(2))
    return fr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lang', default='en', choices=list(CHUNKS))
    ap.add_argument('--sha', required=True)
    ap.add_argument('--prefix', required=True, help='branch prefix for hand-off, e.g. render-en2 (new prefix per render round)')
    ap.add_argument('--workers', type=int, default=8)
    ap.add_argument('--split', type=int, default=5000, help='split compositions longer than this many frames into halves')
    ap.add_argument('--local', default='ColdOpen', help='comma list rendered in the coordinator session')
    a = ap.parse_args()
    fr = frames_per_comp(a.lang)
    if not fr:
        raise SystemExit('no compositions found (does the project compile? npx tsc --noEmit -p .)')
    local = [x for x in a.local.split(',') if x]
    jobs = []  # (frames, job string, output id)
    for comp, n in sorted(fr.items()):
        if comp in local:
            continue
        if n > a.split:
            h = n // 2
            jobs += [(h, f'{comp}@0-{h - 1}:{comp}_a', f'{comp}_a'), (n - h, f'{comp}@{h}-{n - 1}:{comp}_b', f'{comp}_b')]
        else:
            jobs.append((n, comp, comp))
    load = [[0, []] for _ in range(a.workers)]
    for n, job, oid in sorted(jobs, reverse=True):
        w = min(load, key=lambda x: x[0])
        w[0] += n
        w[1].append((job, oid, n))
    load = [w for w in load if w[1]]
    d = os.path.join(ROOT, 'out/fanout', a.prefix)
    os.makedirs(d, exist_ok=True)
    label = {'en': 'English edition, synthetic voice', 'te': 'Telugu edition with animated demonstrations', 'enh': "English edition with the creator's own narration"}[a.lang]
    envprefix = '' if a.lang == 'en' else f'REMOTION_LANG={a.lang} '
    log = 'out/render_modules.log' if a.lang == 'en' else f'out/render_modules_{a.lang}.log'
    plan = {'lang': a.lang, 'sha': a.sha, 'prefix': a.prefix, 'local': local, 'workers': []}
    for i, (tot, items) in enumerate(load, 1):
        js = ' '.join(j for j, _, _ in items)
        open(os.path.join(d, f'worker_{i:02d}.txt'), 'w').write(PROMPT.format(label=label, jobs=js, branch=BRANCH, sha=a.sha, envprefix=envprefix, chunks=CHUNKS[a.lang], log=log, prefix=a.prefix))
        plan['workers'].append({'n': i, 'jobs': js, 'outputs': [o for _, o, _ in items], 'frames': tot, 'est_min': round(tot * 0.8 / 60 + 12)})
        print(f'worker {i:02d}: {tot:6d} frames ≈ {tot * 0.8 / 60 + 12:4.0f} min  {js}')
    open(os.path.join(d, 'local.txt'), 'w').write(' '.join(local) + '\n')
    plan['outputs'] = sorted([o for w in plan['workers'] for o in w['outputs']] + local)
    json.dump(plan, open(os.path.join(d, 'plan.json'), 'w'), indent=1)
    print(f'local: {" ".join(local)} ({sum(fr.get(x, 0) for x in local)} frames)\nwrote {d}/worker_NN.txt, plan.json, local.txt')


if __name__ == '__main__':
    main()
