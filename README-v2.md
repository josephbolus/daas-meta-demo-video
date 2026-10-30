# DevOps as a Service — Meta Hackathon Demo Video v2 (Remotion)

**Output:** `daas-meta-demo-v2.mp4` — 2:45 (165 s), 1920×1080, 30 fps,
H.264, captioned, WITH narration. Local review copy — not uploaded.

## What changed vs v1

1. **The main walkthrough is a genuine LIVE-model run.** v1 replayed a
   Mock Judge Mode run. v2 replays a real live Judge Mode Tier 1 run
   executed against the v3 console on 2026-10-29 under the all-frontier
   contest configuration (every role `muse-wonder-1.0`,
   `muse-spark-1.3` configured only as availability fallback, Meta
   Model API through the `custom.meta-model-api` connector). Same
   replay method as v1: the run's saved snapshot is rendered by the
   console's own code at the polling prefixes and screenshotted.
2. **A narration track.** Fourteen per-beat TTS clips, each placed at
   its beat's timestamp (see "Narration" below). v1 was silent.
3. **A "Live run · muse-wonder-1.0" pill** (v3 design language: white
   pill, hairline border, green dot) overlays the walkthrough scenes —
   issue selection through the results card. It is deliberately NOT
   shown on the trust beat: the guardrail is deterministic code and
   makes zero model calls, and the label must not imply otherwise.
4. **Captions updated to the live run's actual figures** (below). The
   closing card is unchanged: the verified full-bench live record
   (12/12 scenarios, +42 net new tests, est. $0.0326 per passed issue,
   every role muse-wonder-1.0).

## The live run — facts

| | |
|---|---|
| Run id | `e76b2c82e7f3` |
| Endpoint | `POST /api/judge/run` `{issue_id: "tier1", mode: "live"}` against `demo_ui.py` on port 8765 |
| Issue | Tier 1 — Bug fix: "Fix off-by-one in pagination helper" |
| Overall | **pass** (PR-ready), first attempt — no retry needed |
| Tests | **24 → 25** (+1) |
| Total elapsed | **34,237 ms (34.2 s)** |
| Est. API cost | **$0.014064** (char-count estimate; the results card displays $0.01) |
| Model calls | 4 (one per role) |
| Models per role | TRIAGE / PLANNER / CODER / REVIEWER — all `muse-wonder-1.0` |
| Stage elapsed (cumulative) | guardrail 54 ms · triage 15,457 ms · plan 20,877 ms · code 28,686 ms · tests 28,801 ms · review 34,236 ms |
| What the coder did | Edited `app/pagination.py` (the off-by-one slice fix) and added `tests/test_pagination_regression.py` — exactly the 2 files the plan named in advance; regression gate and issue-target gate both verified; reviewer approved |

Records (in this folder):

- `captures/snapshot-tier1-live.json` — the run's terminal snapshot,
  exactly as `GET /api/run/e76b2c82e7f3` returned it
  (`demo_ui.run_snapshot()` output). This is what `capture.mjs`
  replays.
- `captures/live-run-facts.json` — the extracted facts above.
- `run-live-tier1.py` — the driver that ran it (retry policy: only
  transient-provider signatures — HTTP 429/5xx, timeouts — retried,
  max 3 attempts; a genuine pipeline outcome is never re-rolled).

The trust beat is unchanged in kind: a live `POST /api/guardrail`
submission of "Delete the legacy database and drop old tables.",
recaptured in the same session; verdict and approval handoff are the
console's real output.

## Narration

- Script: `narration-script-v2.md` (adapted from the v1 script; every
  spoken number matches the live run — "twenty-four to twenty-five",
  "thirty-four point two seconds" — or the verified bench record in
  the close).
- Synthesis: `/opt/hatch/bin/tts speak` (the spoken-audio skill's
  tool), default production voice, one call per beat → `audio/beat-01.mp3`
  … `beat-14.mp3`, copied to `public/audio/` for Remotion.
- Sync: per-beat, not a free-running take. Each clip's duration was
  measured with ffprobe; every clip ends inside its beat window
  (worst case: beat 07 ends 1.4 s before its window closes; beat 14
  ends at 161.4 s of the 165 s runtime). In `src/Demo.tsx` the clips
  are `<Sequence from={sec(beatStart)}><Audio …/></Sequence>`.

## Layout deltas vs v1

```
captures/snapshot-tier1-live.json   the live run's snapshot (new)
captures/live-run-facts.json        the live run's facts (new)
run-live-tier1.py                   live-run driver (new)
narration-script-v2.md              spoken script (new)
audio/ + public/audio/              14 TTS beat clips (new)
src/Demo.tsx                        live captures, LiveBadge, live captions, Audio track
daas-meta-demo-v2.mp4               the rendered deliverable
```

`captures/snapshot-tier1-mock.json` is retained from v1 for reference
only — nothing in v2 renders from it.

## Render / verify

```bash
npm ci
npx remotion render src/index.ts MetaDemo daas-meta-demo-v2.mp4
ffprobe -hide_banner daas-meta-demo-v2.mp4   # expect 1920x1080, 30 fps, ~165 s, h264 + AAC audio
for t in 4 15 25 35 46 57 67 78 91 103 116 127 139 155; do
  ffmpeg -ss $t -i daas-meta-demo-v2.mp4 -frames:v 1 thumbs/thumb-$t.png
done
```

To recapture: start the console with the all-frontier env
(`DAAS_MODEL_TRIAGE=… PLANNER=… CODER=… REVIEWER=muse-wonder-1.0
DAAS_FALLBACK_MODEL=muse-spark-1.3 python3 demo_ui.py --port 8765`
from `hackathon-agent-scaffold/`), run `python3 run-live-tier1.py`,
then `node capture.mjs` and copy the PNGs from `captures/` to
`public/`. `capture.mjs`'s `CHROME` constant is the build machine's
Playwright chromium path, as in v1.

## Claims discipline

Every number on screen or spoken is either read off the real live
capture (tests 24 → 25, 34.2 s, the card's $0.01 est. cost) or a
verified record figure (closing bench stats; PRs #16/#17/#18). The
single-run cost in the machine record ($0.014064) is a char-count
estimate — the results card labels it "EST. API COST" and the v2
caption quotes the card's own $0.01 figure.
