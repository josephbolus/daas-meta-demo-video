// Capture real v3 console states via CDP (chrome-headless-shell).
// v2: replays a REAL completed LIVE Judge Mode run's saved snapshot
// (run e76b2c82e7f3 — all-frontier muse-wonder-1.0, Tier 1, tests
// 24 -> 25, pass; see captures/live-run-facts.json) through the page's
// own renderEvent/markRunning/poll-terminal code paths — the exact
// states the 500ms polling produced — and screenshots each one.
import {spawn} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const CHROME =
  '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 9333;
const OUT = new URL('./captures/', import.meta.url).pathname;
const SNAP = JSON.parse(readFileSync(OUT + 'snapshot-tier1-live.json', 'utf8'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1920,1080',
  '--hide-scrollbars',
  '--no-sandbox',
  '--disable-gpu',
  'about:blank',
]);
process.on('exit', () => chrome.kill());

async function wsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      return j.webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error('chrome did not start');
}

const url = await wsUrl();
const ws = new WebSocket(url);
await new Promise((res) => (ws.onopen = res));
let seq = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const {res, rej} = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rej(new Error(JSON.stringify(msg.error)));
    else res(msg.result);
  }
};
function send(method, params = {}, sessionId) {
  return new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, {res, rej});
    ws.send(JSON.stringify({id, method, params, sessionId}));
  });
}

const {targetId} = await send('Target.createTarget', {
  url: 'http://127.0.0.1:8765/v3',
});
const {sessionId} = await send('Target.attachToTarget', {
  targetId,
  flatten: true,
});
const S = (m, p) => send(m, p, sessionId);
await S('Page.enable');
await S('Runtime.enable');
await S('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
});

const evaluate = async (expression) => {
  const r = await S('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails)
    throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result ? r.result.value : undefined;
};
const waitFor = async (expr, timeout = 15000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (await evaluate(`!!(${expr})`)) return;
    await sleep(150);
  }
  throw new Error('timeout waiting for: ' + expr);
};
const shot = async (name, scrollExpr) => {
  if (scrollExpr) await evaluate(scrollExpr);
  await sleep(250);
  const {data} = await S('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  writeFileSync(OUT + name, Buffer.from(data, 'base64'));
  console.log('shot', name);
};

await waitFor(
  `document.querySelectorAll('.issue').length > 0 && document.getElementById('kpiScenarios').textContent.trim() !== ''`
);
// Freeze CSS motion so stills are deterministic (content/layout unchanged).
await evaluate(`(() => {
  const st = document.createElement('style');
  st.textContent = '*{animation:none!important;transition:none!important}';
  document.head.appendChild(st);
  window.scrollTo(0,0);
  return true;
})()`);

// 1) Idle console (Tier 1 auto-selected by loadIssues).
await shot('idle.png', 'window.scrollTo(0,0)');

// 2) Replay the real run, prefix by prefix, exactly as poll() renders it.
await evaluate(`window.__snap = ${JSON.stringify(SNAP)}; true`);
await evaluate(`(() => {
  resetTimeline();
  document.getElementById('judgeBtn').disabled = true;
  document.getElementById('runBtn').disabled = true;
  document.getElementById('judgeStatus').textContent =
    'Judge Mode running — narration appears as stages fire…';
  window.__renderedUpTo = 0;
  window.__stepTo = (k) => {
    const snap = window.__snap;
    while (window.__renderedUpTo < k) {
      renderEvent(snap.events[window.__renderedUpTo]);
      window.__renderedUpTo++;
    }
    const last = snap.events[k - 1];
    const cur = last
      ? (STAGES.indexOf(last.stage) !== -1 ? last.stage : GATE_TO_STAGE[last.stage])
      : null;
    markRunning(cur);
  };
  return true;
})()`);

await evaluate('window.__stepTo(3)'); // guardrail, triage, plan done
await shot('run-a-plan.png', `document.querySelector('.app, main, body').scrollIntoView(); window.scrollTo(0,0)`);
await evaluate('window.__stepTo(5)'); // + code, tests
await shot(
  'run-b-tests.png',
  `document.getElementById('stage-code').scrollIntoView({block:'start'}); window.scrollBy(0,-110)`
);
await evaluate('window.__stepTo(8)'); // + gates (narration), review
await shot(
  'run-c-review.png',
  `document.getElementById('stage-tests').scrollIntoView({block:'start'}); window.scrollBy(0,-110)`
);

// 3) Terminal state, exactly as poll() finishes a judge run.
await evaluate(`(() => {
  const snap = window.__snap;
  while (window.__renderedUpTo < snap.events.length) {
    renderEvent(snap.events[window.__renderedUpTo]);
    window.__renderedUpTo++;
  }
  document.querySelectorAll('.prog.live').forEach(p => p.remove());
  STAGES.forEach(x => {
    document.getElementById('stage-' + x).classList.remove('run');
    document.getElementById('step-' + x).classList.remove('run');
  });
  renderResultsCard(snap);
  document.getElementById('judgeStatus').textContent =
    'Judge Mode complete — see the results card.';
  document.getElementById('runStatus').textContent = 'Run complete — passed.';
  return true;
})()`);
await shot(
  'results.png',
  `document.getElementById('resultsCard').scrollIntoView({block:'start'}); window.scrollBy(0,-110)`
);

// 4) Trust beat: reload fresh, type the run-of-show phrase, submit for real.
await S('Page.navigate', {url: 'http://127.0.0.1:8765/v3'});
await waitFor(`document.querySelectorAll('.issue').length > 0`);
await evaluate(`(() => {
  const st = document.createElement('style');
  st.textContent = '*{animation:none!important;transition:none!important}';
  document.head.appendChild(st);
  document.getElementById('breakTitle').value =
    'Delete the legacy database and drop old tables.';
  return true;
})()`);
await shot(
  'break-before.png',
  `document.getElementById('breakTitle').scrollIntoView({block:'center'})`
);
await evaluate(`document.getElementById('breakBtn').click(); true`);
await waitFor(
  `document.getElementById('breakResult').querySelector('.decrow') !== null`
);
await shot(
  'break-after.png',
  `document.getElementById('breakResult').scrollIntoView({block:'start'}); window.scrollBy(0,-110)`
);

console.log('done');
ws.close();
chrome.kill();
process.exit(0);
