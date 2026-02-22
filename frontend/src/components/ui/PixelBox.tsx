import type { CSSProperties, ReactNode } from "react";
import { C } from "../../styles/theme";
import { useMode } from "../../context/ModeContext";

interface PixelBoxProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  title?: string;
  style?: CSSProperties;
}

export function PixelBox({ children, color, bg, title, style: extra = {} }: PixelBoxProps) {
  const { mode, colors } = useMode();
  const borderColor = color ?? colors.border;

  if (mode === "board") {
    return (
      <div style={{
        background: bg || "#FFFFFF",
        borderRadius: 0,
        border: `1px solid #E0E0E0`,
        boxShadow: "none",
        ...extra,
      }}>
        {title && (
          <div style={{
            padding: "10px 18px",
            background: "#44883E",
            fontFamily: "'Roboto Condensed', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}>
            {title}
          </div>
        )}
        {children}
      </div>
    );
  }

  // Fun mode (original)
  return (
    <div style={{
      background: bg || `${C.black}ee`, border: `3px solid ${borderColor}`, borderRadius: 0,
      boxShadow: `4px 4px 0px ${C.shadow}`,
      ...extra,
    }}>
      {title && (
        <div style={{
          background: `linear-gradient(90deg, ${borderColor}80, ${borderColor}30)`,
          padding: "6px 14px", borderBottom: `3px solid ${borderColor}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.red, border: "1px solid #990000" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.yellow, border: "1px solid #997700" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.lime, border: "1px solid #006600" }} />
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: C.cyan, marginLeft: 4 }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}
