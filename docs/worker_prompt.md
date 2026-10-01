# Worker session prompt (parallel render)

Fill in `<SHA>` and `<MODULES>` and pass this as the `prompt` of `create_session` (repo checked out at `<SHA>`).

---

You are a render worker for the Cred-Videos Remotion project. Do not change any source files.

1. `git checkout <SHA>` (verify `git rev-parse HEAD`). Then `npm ci`.
2. `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
3. `npx tsc --noEmit -p .` must pass.
4. Render your modules, one at a time, detached and resumable:
   `setsid nohup scripts/render_modules.sh <MODULES> > /dev/null 2>&1 &`
   Keep a harness background watcher armed on `out/render_modules.log` (wait for `DONE`/`FAILED`; < 2 h per watcher) so the container is never idle. If the container restarts, delete `out/chunks/.*.partial.mp4` and relaunch with the remaining modules.
5. For each finished chunk: check it with `python3 scripts/review_chunk.py out/chunks/<Id>.mp4 3` (look at the sheets), then upload: `scripts/upload_gofile.sh out/chunks/<Id>.mp4` and note the returned link + md5.
6. When all are done, reply with one line per module: `<Id> <gofile link> <md5> <duration s>`. Do not stitch, do not master, do not commit.
