# DevOps as a Service — Timed Narration Script v2 (LIVE run)

For the v2 Meta hackathon demo video (2:45, 165 seconds). The main
walkthrough is a genuine LIVE Judge Mode run — run `e76b2c82e7f3`,
Tier 1, all four agent roles on muse-wonder-1.0, overall PASS, tests
24 → 25, 34.2 s total elapsed, est. API cost $0.014064 (the results
card displays $0.01). Record: `captures/live-run-facts.json`; snapshot:
`captures/snapshot-tier1-live.json`.

This file is the text that was synthesized for the v2 render (TTS,
per-beat clips in `public/audio/`), one clip per timestamped beat,
placed at its timestamp — not one free-running take.

**Pacing:** every window works out to roughly 100–140 words per
minute, a calm conversational pace. Start each line at its timestamp.

**Pronunciations:** "muse-wonder-1.0" is read as *Muse Wonder one
point zero*. Pull requests #16, #17, #18 are read as *sixteen,
seventeen, eighteen*.

---

**0:00–0:09 — Title**
For a five-engineer team, every small fix costs a senior engineer an
hour — and waits weeks in the backlog.

**0:09–0:20 — The console**
This is DevOps as a Service. File a GitHub issue, and AI agents turn
it into a reviewed, tested pull request.

**0:20–0:30 — One issue in (live run starts)**
Here's one backlog issue. I'll start a live run, then step back. No
human touches the workflow from this point on.

**0:30–0:41 — Guardrail first**
Before any model is called, a deterministic guardrail checks whether
the request is safe, appropriate, and inside the service's scope for
automated work.

**0:41–0:52 — Triage and plan**
Triage defines what "fixed" means. Then the planner commits to a
precise scope, naming the exact files before any code is written.

**0:52–1:02 — Code**
The coder works on a separate branch, changes only the planned files,
and adds a regression test for the reported problem.

**1:02–1:12 — The test gate**
Now the hard gate: the test suite must grow, and pass. Here it moves
from twenty-four to twenty-five tests — all green.

**1:12–1:25 — Review**
The reviewer does not simply trust the plan. It reruns the tests and
inspects the actual diff, checking that the change is correct and
nothing unrelated slipped in.

**1:25–1:37 — The payoff**
One issue went in, and one reviewed, tested pull request came out —
in thirty-four point two seconds, end to end.

**1:37–1:50 — It was live**
That run was live. Every agent on Muse Wonder one point zero. The
same pattern opened pull requests sixteen, seventeen, and eighteen.

**1:50–2:02 — Try to break it**
Now let's try to break it. I'll file a destructive request: delete
the legacy database, and drop the old tables.

**2:02–2:13 — Blocked**
The guardrail blocks it before any model call. Zero model calls. No
files changed. And no pull request is opened.

**2:13–2:25 — The human handoff**
Instead, the agents stop and hand the decision to a human. That
boundary is what makes the automation safe enough for a business to
trust.

**2:25–2:45 — Close**
Across the live benchmark, all twelve DevOps scenarios passed, adding
forty-two tests, at an estimated three point three cents per passed
issue — with every agent role running Muse Wonder one point zero.
DevOps as a Service: your backlog, handled — with receipts.

---

## Notes

- The walkthrough run on screen is LIVE (its results card shows the
  real elapsed time and the char-count-estimated API cost, labeled as
  an estimate on the card itself). The trust beat remains a live
  `/api/guardrail` submission — deterministic code, zero model calls,
  exactly as the narration says.
- The closing figures are the verified full-bench live record
  (12/12 scenarios, +42 tests, $0.0326 per passed issue), not this
  single run's figures — the script and captions keep the two apart.
- Audio generated with `/opt/hatch/bin/tts` (default production
  voice), one `speak` call per beat; clip durations were measured
  with ffprobe and each clip is placed at its beat's timestamp in
  `src/Demo.tsx` via Remotion `Sequence` + `Audio`.
