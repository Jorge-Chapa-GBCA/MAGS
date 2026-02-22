import { useState, useEffect } from "react";
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
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
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
  [0,1,1,1,0,0,0,0,1,1,1,0,0],
  [0,1,1,1,0,0,0,0,1,1,1,0,0],
  [0,1,1,1,0,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,0,1,0,0,0,0,0],
];

const FACE_GRIN = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
];

const FACES = [FACE_NEUTRAL, FACE_THINK, FACE_OOH, FACE_GRIN];

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

export function HappyFace({ color = C.lime, size = 8 }: { color?: string; size?: number }) {
  return (
    <div style={{ animation: "float 2s ease-in-out infinite" }}>
      <PixelFace grid={FACE_GRIN} color={color} size={size} />
    </div>
  );
}

export function IdentifyingFace() {
  const [faceIdx, setFaceIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFaceIdx(f => (f + 1) % 2), 1400);
    return () => clearInterval(t);
  }, []);
  return <PixelFace grid={[FACE_NEUTRAL, FACE_THINK][faceIdx]} color={C.lime} size={8} />;
}

export function AnalysingScreen({ creditName }: { creditName: string }) {
  const [faceIdx, setFaceIdx] = useState(0);
  const [dots, setDots] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setFaceIdx(f => (f + 1) % FACES.length), 1800);
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
          <PixelFace grid={FACES[faceIdx]} color={G} size={8} />
        </div>

        <div style={{ textAlign: "center", fontSize: 20, color: G, marginBottom: 6, textShadow: `0 0 10px ${G}40` }}>
          {tasks[taskIdx]}{".".repeat(dots)}
        </div>
        <div style={{ textAlign: "center", fontSize: 16, color: C.sky }}>
          checking <span style={{ color: C.yellow }}>{creditName}</span>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
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
