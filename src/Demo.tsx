import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

// DevOps as a Service — Meta Global AI Developer Hackathon demo.
// 1920x1080, 30fps, 165s (2:45), captioned, no voiceover.
// Footage: real captures of the v3 demo console (Mock Judge Mode run of the
// Tier 1 issue + a real guardrail escalation), replayed through the console's
// own rendering code from the run's saved snapshot. Drawn scenes (title,
// close) use the v3 design language. Every number shown is either read off a
// console capture or one of the verified full-bench figures (12/12, +42,
// $0.0326 per passed issue, all roles muse-wonder-1.0).

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

const GROUND = '#ECECE7';
const CARD = '#FFFFFF';
const LINE = '#C8C8BF';
const INK = '#151B28';
const BODY = '#3A4356';
const SECOND = '#49536A';
const LABEL = '#55607A';
const ACCENT = '#4350C8';
const GREEN = '#1F7A3D';
const FONT =
  'Inter, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const TOTAL_FRAMES = sec(165);

// ---------------------------------------------------------------- captions

const Caption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 42,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1560,
          background: 'rgba(255,255,255,0.97)',
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: '16px 34px',
          fontSize: 31,
          lineHeight: 1.35,
          color: INK,
          textAlign: 'center',
          fontWeight: 550,
          boxShadow: '0 6px 24px rgba(21,27,40,0.10)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ------------------------------------------------------------- shot scenes

// A console capture shown full-bleed with a slow zoom toward focus point
// (fx, fy in image pixels). Caption segments: [startSec, endSec, text]
// relative to the scene.
const Shot: React.FC<{
  img: string;
  dur: number;
  z0: number;
  z1: number;
  fx: number;
  fy: number;
  captions: Array<[number, number, string]>;
}> = ({img, dur, z0, z1, fx, fy, captions}) => {
  const frame = useCurrentFrame();
  const total = sec(dur);
  const fade = interpolate(
    frame,
    [0, 9, total - 9, total],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const z = interpolate(frame, [0, total], [z0, z1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tx = 960 / z - fx;
  const ty = 540 / z - fy;
  return (
    <AbsoluteFill style={{background: GROUND, opacity: fade}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img
          src={staticFile(img)}
          style={{
            width: 1920,
            height: 1080,
            transform: `scale(${z}) translate(${tx}px, ${ty}px)`,
          }}
        />
      </div>
      {captions.map(([a, b, text], i) => (
        <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}>
          <Caption>{text}</Caption>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ drawn scenes

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      color: ACCENT,
      fontSize: 21,
      letterSpacing: 4,
      fontWeight: 700,
      textTransform: 'uppercase',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

const FadeWrap: React.FC<{dur: number; children: React.ReactNode}> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const total = sec(dur);
  const opacity = interpolate(
    frame,
    [0, 10, total - 10, total],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const y = interpolate(frame, [0, 14], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background: GROUND, opacity}}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '70px 110px 150px',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${y}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{
  index: number;
  step?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({index, step = 22, children, style}) => {
  const frame = useCurrentFrame();
  const start = index * step;
  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [start, start + 12], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{opacity, transform: `translateY(${y}px)`, ...style}}>
      {children}
    </div>
  );
};

const TitleScene: React.FC = () => (
  <>
    <FadeWrap dur={9}>
      <Kicker>Meta Global AI Developer Hackathon · Indie Track</Kicker>
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: INK,
          textAlign: 'center',
          marginTop: 30,
          lineHeight: 1.06,
          letterSpacing: -1,
        }}
      >
        DevOps as a Service
      </div>
      <div
        style={{
          fontSize: 33,
          color: BODY,
          textAlign: 'center',
          marginTop: 30,
          maxWidth: 1050,
          lineHeight: 1.45,
        }}
      >
        File an issue. The agents open the pull request.
      </div>
      <div
        style={{
          marginTop: 44,
          background: CARD,
          border: `1px solid ${LINE}`,
          borderRadius: 999,
          padding: '11px 26px',
          fontSize: 22,
          color: SECOND,
          fontWeight: 600,
        }}
      >
        github.com/josephbolus/devops-as-a-service
      </div>
    </FadeWrap>
    <Sequence from={sec(1)} durationInFrames={sec(8)}>
      <Caption>
        A five-engineer shop: every small fix costs a senior engineer-hour.
      </Caption>
    </Sequence>
  </>
);

const Stat: React.FC<{value: string; label: string}> = ({value, label}) => (
  <div
    style={{
      background: CARD,
      border: `1px solid ${LINE}`,
      borderRadius: 16,
      padding: '30px 28px',
      width: 385,
      minHeight: 178,
    }}
  >
    <div style={{fontSize: 47, fontWeight: 800, color: INK, lineHeight: 1.1}}>
      {value}
    </div>
    <div
      style={{
        fontSize: 19,
        color: LABEL,
        letterSpacing: 1.6,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginTop: 14,
        lineHeight: 1.4,
      }}
    >
      {label}
    </div>
  </div>
);

const CloseScene: React.FC = () => (
  <FadeWrap dur={20}>
    <Kicker>Eval scorecard — every run is scored</Kicker>
    <div
      style={{
        fontSize: 40,
        fontWeight: 650,
        color: INK,
        textAlign: 'center',
        marginTop: 26,
        lineHeight: 1.35,
        maxWidth: 1250,
      }}
    >
      Tests green, PR opened, nothing unrelated touched — graded stage by
      stage, with the evidence attached.
    </div>
    <div
      style={{
        display: 'flex',
        gap: 22,
        marginTop: 46,
        justifyContent: 'center',
      }}
    >
      <Reveal index={0}>
        <Stat value="12/12" label="DevOps scenarios passed live — full bench" />
      </Reveal>
      <Reveal index={1}>
        <Stat value="+42" label="Net new tests across the bench" />
      </Reveal>
      <Reveal index={2}>
        <Stat
          value="3.3¢"
          label="Est. API cost per passed issue ($0.0326)"
        />
      </Reveal>
      <Reveal index={3}>
        <Stat
          value="muse-wonder-1.0"
          label="Every agent role — Meta frontier model"
        />
      </Reveal>
    </div>
    <div
      style={{
        fontSize: 43,
        fontWeight: 800,
        color: INK,
        textAlign: 'center',
        marginTop: 58,
        lineHeight: 1.25,
      }}
    >
      DevOps as a Service: your backlog, handled —{' '}
      <span style={{color: ACCENT}}>with receipts.</span>
    </div>
    <div
      style={{
        fontSize: 21,
        color: GREEN,
        fontWeight: 700,
        marginTop: 22,
        letterSpacing: 1,
      }}
    >
      ● LIVE PRS OPENED BY THIS PIPELINE: #16 · #17 · #18
    </div>
  </FadeWrap>
);

// ------------------------------------------------------------------- main

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: GROUND, fontFamily: FONT, color: INK}}>
      {/* 0:00-0:09 — title */}
      <Sequence from={sec(0)} durationInFrames={sec(9)}>
        <TitleScene />
      </Sequence>

      {/* 0:09-0:20 — problem: the console, idle (run-of-show beat 1) */}
      <Sequence from={sec(9)} durationInFrames={sec(11)}>
        <Shot
          img="idle.png"
          dur={11}
          z0={1.0}
          z1={1.05}
          fx={960}
          fy={470}
          captions={[[0, 11, '…and each one waits weeks in the backlog.']]}
        />
      </Sequence>

      {/* 0:20-0:30 — file the issue (beat 2) */}
      <Sequence from={sec(20)} durationInFrames={sec(10)}>
        <Shot
          img="idle.png"
          dur={10}
          z0={1.14}
          z1={1.48}
          fx={455}
          fy={700}
          captions={[
            [0, 10, 'One issue in. Watch what happens — with no human touching it.'],
          ]}
        />
      </Sequence>

      {/* 0:30-0:52 — agents work A: guardrail, triage, plan (beat 3) */}
      <Sequence from={sec(30)} durationInFrames={sec(22)}>
        <Shot
          img="run-a-plan.png"
          dur={22}
          z0={1.02}
          z1={1.12}
          fx={1100}
          fy={430}
          captions={[
            [
              0,
              11,
              'Before any model runs, a deterministic guardrail checks the request is safe and in scope.',
            ],
            [
              11,
              22,
              "Triage states what 'fixed' means. The planner commits to a scope — the exact files, named in advance.",
            ],
          ]}
        />
      </Sequence>

      {/* 0:52-1:12 — agents work B: code + tests */}
      <Sequence from={sec(52)} durationInFrames={sec(20)}>
        <Shot
          img="run-b-tests.png"
          dur={20}
          z0={1.05}
          z1={1.17}
          fx={1150}
          fy={420}
          captions={[
            [
              0,
              10,
              'The coder works on a branch — only the files the plan named — and adds a regression test.',
            ],
            [10, 20, 'The gate: the suite must grow, and pass — 24 → 25 tests, all green.'],
          ]}
        />
      </Sequence>

      {/* 1:12-1:25 — agents work C: review */}
      <Sequence from={sec(72)} durationInFrames={sec(13)}>
        <Shot
          img="run-c-review.png"
          dur={13}
          z0={1.05}
          z1={1.14}
          fx={1150}
          fy={430}
          captions={[
            [
              0,
              13,
              'The reviewer runs the suite and checks the actual diff — not the plan — before approving.',
            ],
          ]}
        />
      </Sequence>

      {/* 1:25-1:50 — payoff: the results card (beat 4) */}
      <Sequence from={sec(85)} durationInFrames={sec(25)}>
        <Shot
          img="results.png"
          dur={25}
          z0={1.03}
          z1={1.12}
          fx={1140}
          fy={470}
          captions={[
            [0, 12, 'One issue in — one reviewed, tested pull request out.'],
            [
              12,
              25,
              'Tests green, diff limited to the plan’s scope — and this same pattern, live, opened PR #16, #17 and #18.',
            ],
          ]}
        />
      </Sequence>

      {/* 1:50-2:02 — trust beat, setup (beat 5) */}
      <Sequence from={sec(110)} durationInFrames={sec(12)}>
        <Shot
          img="break-before.png"
          dur={12}
          z0={1.05}
          z1={1.2}
          fx={960}
          fy={800}
          captions={[
            [
              0,
              12,
              "Now try to break it. File this instead: 'Delete the legacy database and drop old tables.'",
            ],
          ]}
        />
      </Sequence>

      {/* 2:02-2:25 — trust beat: blocked + escalated */}
      <Sequence from={sec(122)} durationInFrames={sec(23)}>
        <Shot
          img="break-after.png"
          dur={23}
          z0={1.05}
          z1={1.22}
          fx={1300}
          fy={480}
          captions={[
            [
              0,
              11,
              'Blocked — before any model call. Zero model calls, no files changed, no PR opened.',
            ],
            [
              11,
              23,
              "The agents stop and escalate to a human with the approval handoff. That's what makes this a service a business can trust.",
            ],
          ]}
        />
      </Sequence>

      {/* 2:25-2:45 — close: the scorecard + closing line (beat 6) */}
      <Sequence from={sec(145)} durationInFrames={sec(20)}>
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
