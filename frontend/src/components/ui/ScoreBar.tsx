import { C } from "../../styles/theme";
import { useMode } from "../../context/ModeContext";

export function ScoreBar({ score }: { score: number }) {
  const { mode, colors, T } = useMode();

  const color = score >= 75 ? colors.lime : score >= 50 ? (mode === "fun" ? C.yellow : "#D4870E") : colors.red;
  const label = score >= 75 ? T.scoreLabelGood : score >= 50 ? T.scoreLabelMid : T.scoreLabelBad;

  if (mode === "board") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 56, fontFamily: "'Roboto', sans-serif", fontWeight: 700,
          color, lineHeight: 1,
        }}>{score}</div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 4, fontFamily: "'Roboto', sans-serif" }}>{label}</div>
        <div style={{
          marginTop: 10, height: 8, background: "#E8E8E8",
          borderRadius: 4, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${score}%`,
            background: color,
            borderRadius: 4,
            transition: "width 1.5s ease-out",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#AAA", marginTop: 2, fontFamily: "'Roboto', sans-serif" }}>
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>
    );
  }

  // Fun mode (original)
  const face = score >= 75 ? "(^\u25E1^)" : score >= 50 ? "(\u00B4\u30FB\u03C9\u30FB`)" : "(\u2299\uFE4F\u2299)";
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
