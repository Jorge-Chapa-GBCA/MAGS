import { C } from "../../styles/theme";

const cfg: Record<string, { bg: string; label: string }> = {
  no_submission_form: { bg: C.hotPink, label: "XX NO FORM XX" },
  major_nc: { bg: C.red, label: "!! MAJOR NC !!" },
  minor_nc: { bg: C.orange, label: "~ MINOR NC ~" },
  general: { bg: C.cyan, label: "i GENERAL i" },
};

export function Badge({ severity }: { severity: string }) {
  const s = cfg[severity] || cfg.general;
  return (
    <span style={{
      fontFamily: "'VT323', monospace", fontSize: 14, padding: "2px 10px",
      background: s.bg, color: severity === "general" ? C.black : C.white,
      border: `2px solid ${C.black}`, boxShadow: `2px 2px 0px ${C.shadow}`,
    }}>{s.label}</span>
  );
}
