import { C } from "../../styles/theme";
import { useMode } from "../../context/ModeContext";

const funCfg: Record<string, { bg: string; label: string }> = {
  no_submission_form: { bg: C.hotPink, label: "XX CRITICAL XX" },
  major_nc: { bg: C.red, label: "!! MAJOR ISSUE !!" },
  minor_nc: { bg: C.orange, label: "~ MINOR ISSUE ~" },
  general: { bg: C.cyan, label: "i GENERAL i" },
};

const boardColors: Record<string, { bg: string; text: string }> = {
  no_submission_form: { bg: "#FCEDEF", text: "#C04535" },
  major_nc: { bg: "#FEF0E5", text: "#C04535" },
  minor_nc: { bg: "#FFF7E5", text: "#D4870E" },
  general: { bg: "#E8F4F8", text: "#005687" },
};

export function Badge({ severity }: { severity: string }) {
  const { mode, T } = useMode();

  if (mode === "board") {
    const bc = boardColors[severity] || boardColors.general;
    const labels: Record<string, string> = {
      no_submission_form: T.badgeCritical,
      major_nc: T.badgeMajor,
      minor_nc: T.badgeMinor,
      general: T.badgeGeneral,
    };
    return (
      <span style={{
        fontFamily: "'Roboto', sans-serif", fontSize: 11, fontWeight: 700, padding: "3px 10px",
        background: bc.bg, color: bc.text,
        borderRadius: 12, letterSpacing: 0.5, textTransform: "uppercase",
      }}>{labels[severity] || labels.general}</span>
    );
  }

  // Fun mode
  const s = funCfg[severity] || funCfg.general;
  return (
    <span style={{
      fontFamily: "'VT323', monospace", fontSize: 14, padding: "2px 10px",
      background: s.bg, color: severity === "general" ? C.black : C.white,
      border: `2px solid ${C.black}`, boxShadow: `2px 2px 0px ${C.shadow}`,
    }}>{s.label}</span>
  );
}
