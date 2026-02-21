import type { ReactNode } from "react";

export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", padding: "6px 0" }}>
      <div style={{ display: "inline-block", animation: "marquee 22s linear infinite" }}>
        <span style={{ paddingRight: 80 }}>{children}</span>
        <span style={{ paddingRight: 80 }}>{children}</span>
      </div>
    </div>
  );
}
