import { useState, useEffect, useRef } from "react";
import { C } from "../styles/theme";
import { PixelBox } from "./ui";
import { useMode } from "../context/ModeContext";

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

function BoardSpinner({ color = "#229C47" }: { color?: string }) {
  return (
    <div style={{
      width: 40, height: 40, margin: "0 auto",
      border: `3px solid #E8E8E8`,
      borderTop: `3px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function IdentifyingFace() {
  const { mode } = useMode();
  const [faceIdx, setFaceIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFaceIdx(f => (f + 1) % 2), 1400);
    return () => clearInterval(t);
  }, []);

  if (mode === "board") return <BoardSpinner />;
  return <PixelFace grid={[FACE_NEUTRAL, FACE_THINK][faceIdx]} color={C.lime} size={8} />;
}

export function ScanningScreen({ fileName }: { fileName?: string }) {
  const { mode, colors, T } = useMode();
  const isBoard = mode === "board";

  const [faceIdx, setFaceIdx] = useState(0);
  const [quipIdx, setQuipIdx] = useState(() => Math.floor(Math.random() * T.scanningQuips.length));
  const faceCount = useRef(0);

  useEffect(() => {
    const a = setInterval(() => {
      faceCount.current += 1;
      setFaceIdx(f => (f + 1) % SCANNING_FACES.length);
      if (faceCount.current % 2 === 0) {
        setQuipIdx(q => (q + 1) % T.scanningQuips.length);
      }
    }, 1400);
    return () => clearInterval(a);
  }, [T.scanningQuips.length]);

  return (
    <PixelBox title={T.scanningTitle} color={isBoard ? colors.green : C.border} style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: 28 }}>
        {isBoard
          ? <BoardSpinner color={colors.green} />
          : <PixelFace grid={SCANNING_FACES[faceIdx]} color={C.lime} size={8} />
        }
        <div style={{
          textAlign: "center", fontSize: isBoard ? 14 : 18,
          color: isBoard ? "#555" : C.lime,
          marginTop: 12,
          textShadow: isBoard ? undefined : `0 0 10px ${C.lime}40`,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>
          {T.scanningQuips[quipIdx]}
        </div>
        <div style={{
          textAlign: "center", fontSize: isBoard ? 13 : 16,
          color: isBoard ? "#888" : C.sky,
          marginTop: 10,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>
          {T.scanningPrefix} <span style={{ color: isBoard ? "#303030" : C.yellow, fontWeight: isBoard ? 500 : undefined }}>{fileName}</span>
        </div>
      </div>
    </PixelBox>
  );
}

export function AnalysingScreen({ creditName }: { creditName: string }) {
  const { mode, colors, T } = useMode();
  const isBoard = mode === "board";

  const [faceIdx, setFaceIdx] = useState(0);
  const [dots, setDots] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [quipIdx, setQuipIdx] = useState(() => Math.floor(Math.random() * T.analysisQuips.length));
  const faceCount = useRef(0);

  useEffect(() => {
    const a = setInterval(() => {
      faceCount.current += 1;
      setFaceIdx(f => (f + 1) % ANALYSIS_FACES.length);
      if (faceCount.current % 2 === 0) {
        setQuipIdx(q => (q + 1) % T.analysisQuips.length);
      }
    }, 1800);
    const b = setInterval(() => setDots(d => (d + 1) % 4), 500);
    const c = setInterval(() => setTaskIdx(t => (t + 1) % 4), 2200);
    return () => { clearInterval(a); clearInterval(b); clearInterval(c); };
  }, [T.analysisQuips.length]);

  const tasks = isBoard
    ? ["Parsing structure", "Checking requirements", "Scanning terminology", "Compiling results"]
    : ["parsing structure", "checking requirements", "scanning terminology", "crunching numbers"];
  const G = colors.lime;

  return (
    <PixelBox title={T.analysisTitle} color={isBoard ? colors.green : C.border} style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 24 }}>
          {isBoard
            ? <BoardSpinner color={colors.green} />
            : <PixelFace grid={ANALYSIS_FACES[faceIdx]} color={G} size={8} />
          }
        </div>

        <div style={{
          textAlign: "center", fontSize: isBoard ? 14 : 18,
          color: isBoard ? "#555" : G,
          marginBottom: 8,
          textShadow: isBoard ? undefined : `0 0 10px ${G}40`,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>
          {T.analysisQuips[quipIdx]}
        </div>

        <div style={{
          textAlign: "center", fontSize: isBoard ? 13 : 16,
          color: isBoard ? "#888" : C.sky,
          marginBottom: 12,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>
          {T.analysingPrefix} <span style={{ color: isBoard ? "#303030" : C.yellow, fontWeight: isBoard ? 500 : undefined }}>{creditName}</span>
        </div>

        <div style={{
          textAlign: "center", fontSize: isBoard ? 13 : 15,
          color: isBoard ? colors.green : G,
          marginBottom: 6,
          textShadow: isBoard ? undefined : `0 0 10px ${G}40`,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>
          {tasks[taskIdx]}{".".repeat(dots)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{
              textAlign: "center", fontSize: isBoard ? 13 : 15,
              color: i < taskIdx ? (isBoard ? colors.green : G) : i === taskIdx ? (isBoard ? "#303030" : C.cyan) : (isBoard ? "#CCCCCC" : `${C.border}`),
              animation: i === taskIdx ? (isBoard ? undefined : "blink 1.5s ease infinite") : "none",
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
            }}>
              {i < taskIdx ? "\u2713" : i === taskIdx ? "\u25B6" : "\u25CB"} {t}
            </div>
          ))}
        </div>
      </div>
    </PixelBox>
  );
}
