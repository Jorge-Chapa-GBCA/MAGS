import { useState, useEffect, useRef } from "react";
import { C } from "../styles/theme";
import { PixelBox } from "./ui";

// Pixel smiley face bitmasks — 1 = filled pixel, 0 = empty
// Eyes are 2 wide × 3 tall, no nose
const FACE_NEUTRAL = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
];

const FACE_THINK = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,0,1,1,0,0,0,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0],
];

const FACE_OOH = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,1,0,0,0,0],
  [0,0,0,0,1,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
];

const FACE_GRIN = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
];

const FACE_GRIN_BLINK = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
];

// Squinting — one eye smaller than the other
const FACE_SQUINT = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
];

// Looking up — eyes shifted high
const FACE_LOOKUP = [
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Skeptical — one eyebrow raised (one eye higher)
const FACE_SKEPTICAL = [
  [0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,0,1,1,0,0,0,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0],
];

// Focused — narrow eyes
const FACE_FOCUSED = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const FACES = [FACE_NEUTRAL, FACE_THINK, FACE_OOH, FACE_GRIN];
const SCANNING_FACES = [FACE_NEUTRAL, FACE_THINK, FACE_SQUINT, FACE_FOCUSED, FACE_LOOKUP];
const ANALYSIS_FACES = [FACE_NEUTRAL, FACE_THINK, FACE_SKEPTICAL, FACE_SQUINT, FACE_OOH, FACE_FOCUSED, FACE_LOOKUP, FACE_GRIN];

export function PixelFace({ grid, color, size = 8 }: { grid: number[][]; color: string; size?: number }) {
  const gap = 2;
  const w = grid[0].length * (size + gap);
  const h = grid.length * (size + gap);
  return (
    <div style={{ width: w, height: h, position: "relative", margin: "0 auto" }}>
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <div key={`${y}-${x}`} style={{
              position: "absolute",
              left: x * (size + gap),
              top: y * (size + gap),
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 ${size}px ${color}60`,
            }} />
          ) : null
        )
      )}
    </div>
  );
}

export function HappyFace({ color = C.lime, size = 8, excited = false }: { color?: string; size?: number; excited?: boolean }) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (excited) return;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        timerRef = scheduleBlink();
      }, delay);
    };
    let timerRef = scheduleBlink();
    return () => clearTimeout(timerRef);
  }, [excited]);

  const grid = excited ? FACE_OOH : blinking ? FACE_GRIN_BLINK : FACE_GRIN;

  return (
    <div style={{ animation: "float 2s ease-in-out infinite" }}>
      <PixelFace grid={grid} color={color} size={size} />
    </div>
  );
}

const SCANNING_QUIPS = [
  "hmm, interesting...",
  "ooh i've seen one of these before",
  "reading every last pixel",
  "this is giving Green Star energy",
  "let me put my glasses on",
  "flipping through the pages",
  "ok ok i think i know what this is",
  "just a sec, nearly there",
  "doing my best speed-read",
  "i promise i'm not just looking at the pictures",
];

const ANALYSIS_QUIPS = [
  "checking the fine print",
  "sharpening my red pen",
  "i live for a good submission form",
  "cross-referencing everything",
  "being thorough so you don't have to be",
  "this is the fun part (for me)",
  "no stone left unturned",
  "channelling my inner assessor",
  "triple-checking my findings",
  "almost done, hold tight",
];

export function IdentifyingFace() {
  const [faceIdx, setFaceIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFaceIdx(f => (f + 1) % 2), 1400);
    return () => clearInterval(t);
  }, []);
  return <PixelFace grid={[FACE_NEUTRAL, FACE_THINK][faceIdx]} color={C.lime} size={8} />;
}

export function ScanningScreen({ fileName }: { fileName?: string }) {
  const [faceIdx, setFaceIdx] = useState(0);
  const [quipIdx, setQuipIdx] = useState(() => Math.floor(Math.random() * SCANNING_QUIPS.length));
  const faceCount = useRef(0);

  useEffect(() => {
    const a = setInterval(() => {
      faceCount.current += 1;
      setFaceIdx(f => (f + 1) % SCANNING_FACES.length);
      if (faceCount.current % 2 === 0) {
        setQuipIdx(q => (q + 1) % SCANNING_QUIPS.length);
      }
    }, 1400);
    return () => clearInterval(a);
  }, []);

  return (
    <PixelBox title="scanning.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: 28 }}>
        <PixelFace grid={SCANNING_FACES[faceIdx]} color={C.lime} size={8} />
        <div style={{ textAlign: "center", fontSize: 18, color: C.lime, marginTop: 12, textShadow: `0 0 10px ${C.lime}40` }}>
          {SCANNING_QUIPS[quipIdx]}
        </div>
        <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginTop: 10 }}>
          reading <span style={{ color: C.yellow }}>{fileName}</span>
        </div>
      </div>
    </PixelBox>
  );
}

export function AnalysingScreen({ creditName }: { creditName: string }) {
  const [faceIdx, setFaceIdx] = useState(0);
  const [dots, setDots] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [quipIdx, setQuipIdx] = useState(() => Math.floor(Math.random() * ANALYSIS_QUIPS.length));
  const faceCount = useRef(0);

  useEffect(() => {
    const a = setInterval(() => {
      faceCount.current += 1;
      setFaceIdx(f => (f + 1) % ANALYSIS_FACES.length);
      if (faceCount.current % 2 === 0) {
        setQuipIdx(q => (q + 1) % ANALYSIS_QUIPS.length);
      }
    }, 1800);
    const b = setInterval(() => setDots(d => (d + 1) % 4), 500);
    const c = setInterval(() => setTaskIdx(t => (t + 1) % 4), 2200);
    return () => { clearInterval(a); clearInterval(b); clearInterval(c); };
  }, []);

  const tasks = ["parsing structure", "checking requirements", "scanning terminology", "crunching numbers"];
  const G = C.lime;

  return (
    <PixelBox title="analysis.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 24 }}>
          <PixelFace grid={ANALYSIS_FACES[faceIdx]} color={G} size={8} />
        </div>

        <div style={{ textAlign: "center", fontSize: 18, color: G, marginBottom: 8, textShadow: `0 0 10px ${G}40` }}>
          {ANALYSIS_QUIPS[quipIdx]}
        </div>

        <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginBottom: 12 }}>
          checking <span style={{ color: C.yellow }}>{creditName}</span>
        </div>

        <div style={{ textAlign: "center", fontSize: 15, color: G, marginBottom: 6, textShadow: `0 0 10px ${G}40` }}>
          {tasks[taskIdx]}{".".repeat(dots)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{
              textAlign: "center", fontSize: 15,
              color: i < taskIdx ? G : i === taskIdx ? C.cyan : `${C.border}`,
              animation: i === taskIdx ? "blink 1.5s ease infinite" : "none",
            }}>
              {i < taskIdx ? "\u2713" : i === taskIdx ? "\u25B6" : "\u25CB"} {t}
            </div>
          ))}
        </div>
      </div>
    </PixelBox>
  );
}
