import { useState, useEffect } from "react";
import { C } from "../../styles/theme";

export function Loader({ text }: { text: string }) {
  const [dots, setDots] = useState(0);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setDots(d => (d + 1) % 4), 500);
    const b = setInterval(() => setFrame(f => (f + 1) % 4), 250);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const spinner = ["\u25D0", "\u25D3", "\u25D1", "\u25D2"][frame];
  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <div style={{ fontSize: 40, marginBottom: 8, animation: "float 1.5s ease-in-out infinite" }}>{spinner}</div>
      <div style={{ fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}40` }}>
        {text}{".".repeat(dots)}
      </div>
    </div>
  );
}
