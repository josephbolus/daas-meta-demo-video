#!/usr/bin/env python3
"""Run ONE live Judge Mode Tier 1 run against the already-running v3
console on port 8765 (server started separately with the all-frontier
env: DAAS_MODEL_<ROLE>=muse-wonder-1.0 for TRIAGE/PLANNER/CODER/REVIEWER
and DAAS_FALLBACK_MODEL=muse-spark-1.3) and save the terminal snapshot —
the exact JSON GET /api/run/<id> returns, i.e. demo_ui.run_snapshot() —
to captures/snapshot-tier1-live.json, plus the run's facts to
captures/live-run-facts.json.

Retry policy (per the v2 brief): a failed attempt is retried only when
its error carries a transient-provider signature (HTTP 429/5xx,
timeout, temporarily unavailable), up to 3 attempts total. A genuine
pipeline outcome (reviewer request_changes, gate block, ...) is NOT
retried — it is reported as measured.
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
CAP = HERE / "captures"
BASE = "http://127.0.0.1:8765"
TRANSIENT = re.compile(
    r"429|500|502|503|504|timeout|timed out|temporar|overloaded|"
    r"rate.?limit|connection (reset|refused|aborted)", re.I)


def http(path, payload=None):
    if payload is None:
        with urllib.request.urlopen(BASE + path, timeout=60) as r:
            return json.loads(r.read())
    req = urllib.request.Request(
        BASE + path, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def one_attempt(n):
    started = http("/api/judge/run", {"issue_id": "tier1", "mode": "live"})
    run_id = started["run_id"]
    print(f"attempt {n}: run_id={run_id}", flush=True)
    snap = {}
    deadline = time.time() + 900
    while time.time() < deadline:
        snap = http(f"/api/run/{run_id}")
        if snap["status"] != "running":
            break
        time.sleep(0.5)
    else:
        raise TimeoutError("live run did not finish in 900s")
    card = snap["results_card"]
    cost = card.get("cost") or {}
    facts = {
        "run_id": run_id,
        "attempt": n,
        "status": snap["status"],
        "mode": snap["mode"],
        "judge_mode": snap["judge_mode"],
        "overall": card["overall"],
        "tests_before": card["tests_before"],
        "tests_after": card["tests_after"],
        "tests_delta": card["tests_delta"],
        "total_elapsed_ms": card["total_elapsed_ms"],
        "cost_total_usd_est": cost.get("total_usd_est"),
        "cost_calls": cost.get("calls"),
        "cost_method": cost.get("method"),
        "cost_per_role_models": {
            role: slot.get("models")
            for role, slot in (cost.get("per_role") or {}).items()},
        "stages": [{"stage": s["stage"], "status": s["status"],
                    "elapsed_ms": s["elapsed_ms"]}
                   for s in card["stages"]],
        "error": snap.get("error"),
    }
    return snap, facts


def main():
    last = None
    for n in (1, 2, 3):
        try:
            snap, facts = one_attempt(n)
        except Exception as e:  # transport-level failure starting/polling
            print(f"attempt {n}: transport error: {e}", flush=True)
            if TRANSIENT.search(str(e)) and n < 3:
                time.sleep(5)
                continue
            raise
        last = (snap, facts)
        print(json.dumps(facts, indent=2), flush=True)
        if facts["overall"] == "pass":
            break
        err = str(facts.get("error") or "")
        stage_fail = " ".join(
            f"{s['stage']}:{s['status']}" for s in facts["stages"])
        if n < 3 and TRANSIENT.search(err + " " + stage_fail):
            print("transient-provider signature — retrying", flush=True)
            time.sleep(5)
            continue
        break
    snap, facts = last
    (CAP / "snapshot-tier1-live.json").write_text(
        json.dumps(snap, indent=2) + "\n", encoding="utf-8")
    (CAP / "live-run-facts.json").write_text(
        json.dumps(facts, indent=2) + "\n", encoding="utf-8")
    print("OVERALL:", facts["overall"])
    return 0 if facts["overall"] == "pass" else 2


if __name__ == "__main__":
    sys.exit(main())
