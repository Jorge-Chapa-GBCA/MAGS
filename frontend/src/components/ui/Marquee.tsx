import type { ReactNode } from "react";
import { useMode } from "../../context/ModeContext";

export function Marquee({ children }: { children: ReactNode }) {
  const { mode } = useMode();

  if (mode === "board") {
    return (
      <div style={{
        padding: "8px 16px",
        textAlign: "center",
        fontFamily: "'Roboto', sans-serif",
        fontSize: 12,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", padding: "6px 0" }}>
      <div style={{ display: "inline-block", animation: "marquee 22s linear infinite" }}>
        <span style={{ paddingRight: 80 }}>{children}</span>
        <span style={{ paddingRight: 80 }}>{children}</span>
      </div>
    </div>
  );
}
