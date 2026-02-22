import type { CSSProperties, ReactNode } from "react";
import { C } from "../../styles/theme";
import { useMode } from "../../context/ModeContext";

interface RetroBtnProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  bg?: string;
  textColor?: string;
  style?: CSSProperties;
}

export function RetroBtn({ children, onClick, color, bg, textColor, style: s = {} }: RetroBtnProps) {
  const { mode, colors } = useMode();

  if (mode === "board") {
    const btnBg = bg || color || colors.lime;
    const txtColor = textColor || "#FFFFFF";
    return (
      <button onClick={onClick} style={{
        background: btnBg, color: txtColor,
        border: "none", borderRadius: 5,
        padding: "10px 22px", fontSize: 14, fontWeight: 500,
        cursor: "pointer", fontFamily: "'Roboto', sans-serif",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        transition: "box-shadow 0.2s, transform 0.15s",
        ...s,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.18)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = ""; }}
      >{children}</button>
    );
  }

  // Fun mode (original)
  const btnColor = color || C.lime;
  const bgColor = bg || `linear-gradient(180deg, ${btnColor} 0%, ${btnColor}bb 100%)`;
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
