import { C } from "../../styles/theme";

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? C.lime : score >= 50 ? C.yellow : C.red;
  const face = score >= 75 ? "(^\u25E1^)" : score >= 50 ? "(\u00B4\u30FB\u03C9\u30FB`)" : "(\u2299\uFE4F\u2299)";
  const label = score >= 75 ? "lookin good!!" : score >= 50 ? "needs some work~" : "uh oh spaghetti-o";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 80, fontFamily: "'VT323', monospace",
        color, textShadow: `0 0 30px ${color}, 0 0 60px ${color}30`,
        lineHeight: 1,
      }}>{score}</div>
      <div style={{ fontSize: 18, color, marginTop: 4 }}>{face} {label}</div>
      <div style={{
        marginTop: 10, height: 20, background: "#222",
        border: `3px solid ${C.border}`, overflow: "hidden",
        boxShadow: `inset 2px 2px 0px rgba(0,0,0,0.4)`,
      }}>
        <div style={{
          height: "100%", width: `${score}%`,
          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 10px, ${color}88 10px, ${color}88 14px)`,
          transition: "width 1.5s ease-out",
          boxShadow: `0 0 12px ${color}`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginTop: 2 }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
