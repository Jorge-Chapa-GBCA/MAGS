import type { CSSProperties, ReactNode } from "react";
import { C } from "../../styles/theme";

interface RetroBtnProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  bg?: string;
  textColor?: string;
  style?: CSSProperties;
}

export function RetroBtn({ children, onClick, color = C.lime, bg, textColor, style: s = {} }: RetroBtnProps) {
  const bgColor = bg || `linear-gradient(180deg, ${color} 0%, ${color}bb 100%)`;
  const txtColor = textColor || C.black;
  return (
    <button onClick={onClick} style={{
      background: bgColor, color: txtColor,
      border: `3px solid ${C.shadow}`, borderRadius: 0,
      padding: "10px 20px", fontSize: 16, fontWeight: 400,
      cursor: "pointer", fontFamily: "'VT323', monospace", letterSpacing: 1,
      textTransform: "uppercase",
      boxShadow: `3px 3px 0px ${C.shadow}, inset 1px 1px 0px rgba(255,255,255,0.3)`,
      transition: "transform 0.1s",
      ...s,
    }}
    onMouseDown={e => (e.currentTarget.style.transform = "translate(2px, 2px)")}
    onMouseUp={e => (e.currentTarget.style.transform = "")}
    onMouseLeave={e => (e.currentTarget.style.transform = "")}
    >{children}</button>
  );
}
