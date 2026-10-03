# Worker session prompt (parallel render)

Don't write worker prompts by hand. Generate them:

```bash
SHA=$(git rev-parse HEAD)   # after commit + push, with the pre-render gate passed
python3 scripts/fanout_plan.py --lang <en|te|enh> --sha $SHA --prefix render-<tag><n> --workers 9 --local ColdOpen
# → out/fanout/<prefix>/worker_NN.txt  (pass each file's text as the `prompt` of create_session,
#    source_url = this repo, source_revision = the working branch)
```

Each generated prompt makes the worker:
1. check out the exact `<SHA>`, `npm ci`, and confirm `tsc` passes;
2. run its job list with `scripts/render_modules.sh`, detached and resumable. A job is a composition (`Scene04`) or a frame range of one (`Scene07@0-3674:Scene07_a`);
3. keep a background watcher armed, so the container never idles;
4. push each finished chunk to `<prefix>/<Id>`. The hand-off goes through git: no Gofile uploads, no tokens in prompts;
5. reply `<Id> <md5>` per chunk. It does not stitch, master, commit to the working branch or open PRs.

The coordinator then follows `docs/PLAYBOOK.md` §6:
- `scripts/fanout_watch.sh` (background, re-armed);
- `scripts/fanout_ingest.sh`, reviewing every sheet;
- archive the workers;
- `scripts/stitch.sh`.
