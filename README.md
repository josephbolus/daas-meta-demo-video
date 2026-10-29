# DevOps as a Service — Meta Hackathon Demo Video (Remotion)

The demo video for **DevOps as a Service**, Joseph Bolus's entry to the Meta
Global AI Developer Hackathon (Indie Track), built programmatically with
[Remotion](https://www.remotion.dev) — the same approach used for the GitLab
"Life After Code" contest video, whose project this one was adapted from.

**Output:** `daas-meta-demo.mp4` — 2:45 (165 s), 1920×1080, 30 fps, H.264,
captioned, no voiceover, ~63 MB.

The footage is the **real v3 demo console** from the
[devops-as-a-service](https://github.com/josephbolus/devops-as-a-service)
repo — no mocked-up UI. A genuine Mock Judge Mode run of the Tier 1 issue was
executed against the console, its snapshot saved, and each on-screen state
replayed through the console's own rendering code and screenshotted. The
trust beat is a live guardrail submission with the console's real verdict.
Drawn scenes (title, close) use the v3 console's design language: light,
airy, hairline borders, one muted periwinkle accent.

## Beat sheet

| Time | Scene | Caption |
|---|---|---|
| 0:00–0:09 | Title (drawn) | A five-engineer shop: every small fix costs a senior engineer-hour. |
| 0:09–0:20 | Console idle | …and each one waits weeks in the backlog. |
| 0:20–0:30 | Tier 1 issue selected | One issue in. Watch what happens — with no human touching it. |
| 0:30–0:41 | Run: guardrail/triage/plan | Before any model runs, a deterministic guardrail checks the request is safe and in scope. |
| 0:41–0:52 | Run state | Triage states what "fixed" means. The planner commits to a scope — the exact files, named in advance. |
| 0:52–1:02 | Code stage, real diff | The coder works on a branch — only the files the plan named — and adds a regression test. |
| 1:02–1:12 | Tests stage | The gate: the suite must grow, and pass — 24 → 25 tests, all green. |
| 1:12–1:25 | Review stage | The reviewer runs the suite and checks the actual diff — not the plan — before approving. |
| 1:25–1:37 | Results card | One issue in — one reviewed, tested pull request out. |
| 1:37–1:50 | Results card, PR links | Tests green, diff limited to the plan's scope — and this same pattern, live, opened PR #16, #17 and #18. |
| 1:50–2:02 | "Try to break it" panel | Now try to break it. File this instead: "Delete the legacy database and drop old tables." |
| 2:02–2:13 | Guardrail verdict | Blocked — before any model call. Zero model calls, no files changed, no PR opened. |
| 2:13–2:25 | Approval handoff | The agents stop and escalate to a human with the approval handoff. That's what makes this a service a business can trust. |
| 2:25–2:45 | Close (drawn) | DevOps as a Service: your backlog, handled — with receipts. |

Closing-card figures are the verified live-bench record: 12/12 scenarios
passed, +42 net new tests, est. $0.0326 (≈3.3¢) per passed issue, every
agent role on muse-wonder-1.0.

## Layout

```
src/Demo.tsx                  the whole composition: scenes, captions, timing
src/Root.tsx                  composition registration (id "MetaDemo", 1920×1080, 30 fps)
src/index.ts                  Remotion entry point
capture.mjs                   screenshots the real console states (see below)
captures/                     console screenshots + snapshot-tier1-mock.json (the run's raw snapshot)
public/                       copies of the captures, served to Remotion via staticFile()
thumbs/                       verification stills extracted from the rendered MP4
daas-meta-demo.mp4            the rendered deliverable
package.json / package-lock   Remotion 4.0.539 + React 19 (pinned by the lockfile)
```

`node_modules/` is intentionally not committed — restore it with `npm ci`.

## Render it yourself

Prerequisites: Node 20+ and npm. (ffmpeg/ffprobe only for verification.)

```bash
npm ci
npx remotion render src/index.ts MetaDemo daas-meta-demo.mp4
```

Preview/edit interactively:

```bash
npx remotion studio src/index.ts
```

Verify a render:

```bash
ffprobe -hide_banner daas-meta-demo.mp4   # expect 1920x1080, 30 fps, ~165 s
ffmpeg -ss 97 -i daas-meta-demo.mp4 -frames:v 1 thumbs/thumb-97.png  # spot-check a frame
```

## Re-capturing the console footage

`capture.mjs` drives headless Chromium over CDP. It loads the v3 console,
replays `captures/snapshot-tier1-mock.json` — the saved snapshot of a real
completed Mock Judge Mode run — through the page's own
`renderEvent`/`markRunning`/results-card code at the exact prefixes the
500 ms polling produced, and screenshots each state into `captures/`
(copy the new stills into `public/` afterwards; Remotion reads them from
there).

To re-capture you need:

1. The devops-as-a-service repo checked out, with its console running:
   `python3 hackathon-agent-scaffold/demo_ui.py --port 8765`, then run a
   Mock Judge Mode Tier 1 run and save the run snapshot over
   `captures/snapshot-tier1-mock.json`.
2. A headless Chromium. **The `CHROME` constant at the top of `capture.mjs`
   is hardcoded to the build machine's Playwright chromium path — edit it**
   to point at your own `chrome-headless-shell` binary before running.
3. `node capture.mjs`

The trust-beat frames (`break-before.png`, `break-after.png`) come from a
live `POST /api/guardrail` submission of the destructive issue text; the
verdict, approval handoff, and decision buttons are the console's real
output.

## Making a new video from this toolchain

1. Edit the scene timings and caption strings in `src/Demo.tsx` — scenes are
   `Sequence`s laid out in seconds via the `sec()` helper; `TOTAL_FRAMES`
   sets the composition length.
2. Swap or add captures in `public/` and reference them with `staticFile()`.
3. Keep the claims discipline this project was built under: **every number
   on screen is either read off a real console capture or is a verified,
   measured figure.** The console run in this video is a Mock run and is
   labeled as such on its own results card ($0.00 API cost — mock run);
   live-bench figures are labeled live. Do not blur that distinction.
4. Re-render, extract thumbs across the timeline, and eyeball every caption
   before publishing.

## Notes

- The mid-run frames are stepped, not filmed: a Mock run completes in
  ~0.5 s of machine time, so intermediate states are the console's own
  rendering of the run's real cumulative snapshots at successive poll steps,
  crossfaded with slow zooms in Remotion.
- The console's KPI strip shows its "92.65 weighted internal scorecard"
  tile in some frames — that is the unmodified console UI, not a figure
  added by this project.
