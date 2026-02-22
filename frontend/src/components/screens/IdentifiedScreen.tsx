import { C } from "../../styles/theme";
import { PixelBox, RetroBtn } from "../ui";
import type { CreditInfo } from "../../types";
import { useMode } from "../../context/ModeContext";

interface Props {
  creditInfo: CreditInfo;
  onAnalyse: () => void;
  onReset: () => void;
  error: string | null;
}

export function IdentifiedScreen({ creditInfo, onAnalyse, onReset, error }: Props) {
  const { mode, colors, T } = useMode();
  const isBoard = mode === "board";
  const font = isBoard ? "'Roboto', sans-serif" : undefined;

  return (
    <div style={{ animation: "slideIn 0.4s ease" }}>
      <PixelBox title={isBoard ? "Credit Identified" : "credit_detected.log"} color={colors.green}>
        <div style={{ padding: 22 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{
              fontSize: isBoard ? 22 : 28,
              color: colors.lime,
              textShadow: isBoard ? undefined : `0 0 12px ${C.lime}30`,
              fontFamily: isBoard ? "'Roboto Condensed', sans-serif" : undefined,
              fontWeight: isBoard ? 700 : undefined,
            }}>{T.foundIt}</div>
            <div style={{
              fontSize: isBoard ? 14 : 18,
              color: isBoard ? "#666" : C.sky,
              marginTop: 6,
              fontFamily: font,
            }}>
              {T.cantWait}{creditInfo.project_name ? (isBoard ? ":" : " for:") : ""}
            </div>
            {creditInfo.project_name && (
              <div style={{
                fontSize: isBoard ? 20 : 24,
                color: isBoard ? "#303030" : C.yellow,
                marginTop: 4,
                textShadow: isBoard ? undefined : `0 0 8px ${C.yellow}30`,
                fontFamily: isBoard ? "'Roboto Condensed', sans-serif" : undefined,
                fontWeight: isBoard ? 700 : undefined,
              }}>
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
              <div key={i} style={isBoard
                ? { background: "#F8F8F8", border: "1px solid #E8E8E8", borderRadius: 8, padding: "12px 14px" }
                : { background: `${C.border}40`, border: `2px solid ${C.border}`, padding: "10px 12px" }
              }>
                <div style={{
                  fontSize: isBoard ? 10 : 12,
                  color: isBoard ? "#999" : C.cyan,
                  letterSpacing: 2,
                  marginBottom: 3,
                  fontFamily: font,
                  textTransform: "uppercase",
                  fontWeight: isBoard ? 700 : undefined,
                }}>{item.label}</div>
                <div style={{
                  fontSize: isBoard ? 15 : 18,
                  color: isBoard ? "#303030" : C.white,
                  wordBreak: "break-word",
                  fontFamily: font,
                }}>{item.val}</div>
              </div>
            ))}
          </div>

          {creditInfo.summary && (
            <div style={isBoard
              ? { background: "#F0F7FF", border: "1px solid #D8E8F8", borderRadius: 8, padding: 14, marginBottom: 18 }
              : { background: `${C.purple}20`, border: `2px solid ${C.purple}50`, padding: 12, marginBottom: 18 }
            }>
              <div style={{
                fontSize: isBoard ? 10 : 13,
                color: isBoard ? "#888" : C.purple,
                marginBottom: 3,
                fontFamily: font,
                textTransform: "uppercase",
                fontWeight: isBoard ? 700 : undefined,
                letterSpacing: isBoard ? 1 : undefined,
              }}>SUMMARY</div>
              <div style={{
                fontSize: isBoard ? 14 : 17,
                color: isBoard ? "#444" : C.lavender,
                lineHeight: 1.5,
                fontFamily: font,
              }}>{creditInfo.summary}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <RetroBtn onClick={onAnalyse} style={{ flex: 1 }}>{T.runCheck}</RetroBtn>
            <RetroBtn color={isBoard ? "#BBBBBB" : C.hotPink} textColor={isBoard ? "#333" : C.white} onClick={onReset}>{T.wrongReupload}</RetroBtn>
          </div>

          {error && <div style={{ marginTop: 12, fontSize: isBoard ? 14 : 16, color: colors.red, fontFamily: font }}>{"\u274C"} {error}</div>}
        </div>
      </PixelBox>
    </div>
  );
}
