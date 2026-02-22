import { C } from "../../styles/theme";
import { useMode } from "../../context/ModeContext";

export function Stars({ count = 18 }: { count?: number }) {
  const { mode } = useMode();

  if (mode === "board") return null;

  const stars = Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    size: Math.random() > 0.5 ? 12 : 8,
    char: ["\u2726", "\u2727", "\u22C6", "\u2736", "\u2605"][Math.floor(Math.random() * 5)],
    color: [C.yellow, C.hotPink, C.cyan, C.lime, C.purple][Math.floor(Math.random() * 5)],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <span key={i} style={{
          position: "absolute", left: s.left, top: s.top, fontSize: s.size,
          color: s.color, animation: `twinkle 2s ease-in-out ${s.delay} infinite`,
          textShadow: `0 0 4px ${s.color}`,
        }}>{s.char}</span>
      ))}
    </div>
  );
}
