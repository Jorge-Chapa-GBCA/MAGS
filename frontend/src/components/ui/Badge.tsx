import { C } from "../../styles/theme";

const cfg: Record<string, { bg: string; label: string }> = {
  critical: { bg: C.red, label: "!! CRITICAL !!" },
  warning: { bg: C.orange, label: "~ WARNING ~" },
  info: { bg: C.cyan, label: "i INFO i" },
};

export function Badge({ severity }: { severity: string }) {
  const s = cfg[severity] || cfg.info;
  return (
    <span style={{
      fontFamily: "'VT323', monospace", fontSize: 14, padding: "2px 10px",
      background: s.bg, color: severity === "info" ? C.black : C.white,
      border: `2px solid ${C.black}`, boxShadow: `2px 2px 0px ${C.shadow}`,
    }}>{s.label}</span>
  );
}
