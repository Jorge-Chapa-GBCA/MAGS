import { C } from "../../styles/theme";
import { PixelBox, RetroBtn } from "../ui";
import type { CreditInfo } from "../../types";

interface Props {
  creditInfo: CreditInfo;
  onAnalyse: () => void;
  onReset: () => void;
  error: string | null;
}

export function IdentifiedScreen({ creditInfo, onAnalyse, onReset, error }: Props) {
  return (
    <div style={{ animation: "slideIn 0.4s ease" }}>
      <PixelBox title="credit_detected.log" color={C.green}>
        <div style={{ padding: 22 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 28, color: C.lime, textShadow: `0 0 12px ${C.lime}30` }}>found it!!</div>
            <div style={{ fontSize: 18, color: C.sky, marginTop: 6 }}>
              i can't wait to review this credit{creditInfo.project_name ? " for:" : ""}
            </div>
            {creditInfo.project_name && (
              <div style={{ fontSize: 24, color: C.yellow, marginTop: 4, textShadow: `0 0 8px ${C.yellow}30` }}>
                {creditInfo.project_name}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "CREDIT", val: creditInfo.credit_name },
              { label: "ID", val: creditInfo.credit_id },
              { label: "RATING TOOL", val: creditInfo.rating_tool },
              { label: "CONFIDENCE", val: `${Math.round(creditInfo.confidence * 100)}%` },
            ].map((item, i) => (
              <div key={i} style={{ background: `${C.border}40`, border: `2px solid ${C.border}`, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 2, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 18, color: C.white, wordBreak: "break-word" }}>{item.val}</div>
              </div>
            ))}
          </div>

          {creditInfo.summary && (
            <div style={{ background: `${C.purple}20`, border: `2px solid ${C.purple}50`, padding: 12, marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: C.purple, marginBottom: 3 }}>SUMMARY</div>
              <div style={{ fontSize: 17, color: C.lavender, lineHeight: 1.5 }}>{creditInfo.summary}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <RetroBtn onClick={onAnalyse} style={{ flex: 1 }}>Run Compliance Check!!</RetroBtn>
            <RetroBtn color={C.hotPink} textColor={C.white} onClick={onReset}>wrong? re-upload</RetroBtn>
          </div>

          {error && <div style={{ marginTop: 12, fontSize: 16, color: C.red }}>{"\u274C"} {error}</div>}
        </div>
      </PixelBox>
    </div>
  );
}
