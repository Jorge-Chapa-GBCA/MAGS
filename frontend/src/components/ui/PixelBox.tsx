import { CSSProperties, ReactNode } from "react";
import { C } from "../../styles/theme";

interface PixelBoxProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  title?: string;
  style?: CSSProperties;
}

export function PixelBox({ children, color = C.border, bg = `${C.black}ee`, title, style: extra = {} }: PixelBoxProps) {
  return (
    <div style={{
      background: bg, border: `3px solid ${color}`, borderRadius: 0,
      boxShadow: `4px 4px 0px ${C.shadow}`,
      ...extra,
    }}>
      {title && (
        <div style={{
          background: `linear-gradient(90deg, ${color}80, ${color}30)`,
          padding: "6px 14px", borderBottom: `3px solid ${color}`,
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
