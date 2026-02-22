import { useState } from "react";
import { C } from "../../styles/theme";
import { PixelBox, ScoreBar, Badge } from "../ui";
import type { AnalysisResult, CreditInfo, Finding } from "../../types";
import { useMode } from "../../context/ModeContext";

interface Props {
  results: AnalysisResult;
  creditInfo: CreditInfo | null;
  fileName: string | undefined;
}

export function ResultsScreen({ results, creditInfo, fileName }: Props) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { mode, colors, T } = useMode();
  const isBoard = mode === "board";

  const findings: Finding[] = results.findings?.filter(
    (f: Finding) => filter === "all" || f.category === filter || f.severity === filter
  ) || [];
  const counts: Record<string, number> = results.findings?.reduce(
    (a: Record<string, number>, f: Finding) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {}
  ) || {};

  const severities = [
    { k: "no_submission_form", l: isBoard ? T.badgeCritical : "CRITICAL", c: isBoard ? "#C04535" : C.hotPink },
    { k: "major_nc", l: isBoard ? T.badgeMajor : "MAJOR", c: colors.red },
    { k: "minor_nc", l: isBoard ? T.badgeMinor : "MINOR", c: isBoard ? "#D4870E" : C.orange },
    { k: "general", l: isBoard ? T.badgeGeneral : "GENERAL", c: isBoard ? "#005687" : C.cyan },
  ];

  return (
    <div style={{ animation: "slideIn 0.4s ease" }}>

      {/* Score */}
      <PixelBox title={isBoard ? `Results \u2014 ${creditInfo?.credit_id}` : `results.exe // ${creditInfo?.credit_id}`} color={colors.lime}>
        <div style={{ padding: 22, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 160 }}><ScoreBar score={results.overall_score} /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              fontSize: isBoard ? 18 : 22,
              color: isBoard ? "#303030" : C.cyan,
              marginBottom: 8,
              fontFamily: isBoard ? "'Roboto Condensed', sans-serif" : undefined,
              fontWeight: isBoard ? 700 : undefined,
            }}>{creditInfo?.credit_name}</div>
            <div style={{
              fontSize: isBoard ? 14 : 17,
              color: isBoard ? "#666" : C.sky,
              lineHeight: 1.5,
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
            }}>{results.summary}</div>
          </div>
        </div>
      </PixelBox>

      {/* Severity counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "14px 0" }}>
        {severities.map(s => (
          <div key={s.k} onClick={() => setFilter(filter === s.k ? "all" : s.k)} style={isBoard
            ? {
                background: filter === s.k ? `${s.c}15` : "#FFFFFF",
                border: `1px solid ${filter === s.k ? s.c : "#E0E0E0"}`,
                borderRadius: 0,
                padding: "12px 6px", textAlign: "center", cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }
            : {
                background: `${s.c}25`, border: `3px solid ${filter === s.k ? C.white : s.c}`,
                padding: "10px 6px", textAlign: "center", cursor: "pointer",
                boxShadow: filter === s.k ? `0 0 14px ${s.c}` : `3px 3px 0 ${C.shadow}`,
              }
          }>
            <div style={{
              fontSize: isBoard ? 28 : 34,
              color: s.c,
              textShadow: isBoard ? undefined : `0 0 10px ${s.c}`,
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
              fontWeight: isBoard ? 700 : undefined,
            }}>{counts[s.k] || 0}</div>
            <div style={{
              fontSize: isBoard ? 10 : 13,
              color: s.c,
              letterSpacing: isBoard ? 1 : 2,
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
              fontWeight: isBoard ? 700 : undefined,
              textTransform: "uppercase",
            }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { k: "all", l: "ALL" },
          { k: "structural", l: "STRUCTURE" },
          { k: "content", l: "CONTENT" },
          { k: "terminology", l: "WORDS" },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={isBoard
            ? {
                fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 500,
                padding: "6px 16px",
                background: filter === f.k ? colors.lime : "#FFFFFF",
                color: filter === f.k ? "#FFFFFF" : "#666",
                border: `1px solid ${filter === f.k ? colors.lime : "#DDD"}`,
                borderRadius: 0, cursor: "pointer",
                transition: "all 0.2s",
              }
            : {
                fontFamily: "'VT323', monospace", fontSize: 16, padding: "5px 14px",
                background: filter === f.k ? C.lime : "transparent",
                color: filter === f.k ? C.black : C.lime,
                border: `2px solid ${C.lime}`, cursor: "pointer",
                boxShadow: filter === f.k ? `0 0 8px ${C.lime}` : "none",
              }
          }>{f.l}</button>
        ))}
      </div>

      {/* Findings */}
      <div style={{ display: "flex", flexDirection: "column", gap: isBoard ? 8 : 6 }}>
        {findings.length === 0 && (
          <div style={{
            textAlign: "center", padding: 28,
            color: isBoard ? "#999" : C.sky,
            fontSize: isBoard ? 14 : 20,
            fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
          }}>{T.noFindings}</div>
        )}
        {findings.map((f, i) => {
          const open = expanded === f.id;
          return (
            <PixelBox key={f.id || i} color={isBoard ? "#E0E0E0" : C.border} style={isBoard
              ? { cursor: "pointer", borderRadius: 0, borderLeft: `4px solid ${severities.find(s => s.k === f.severity)?.c || "#E0E0E0"}` }
              : { cursor: "pointer", boxShadow: open ? `0 0 14px ${C.purple}30, 4px 4px 0 ${C.shadow}` : `4px 4px 0 ${C.shadow}` }
            }>
              <div onClick={() => setExpanded(open ? null : f.id)} style={{ padding: isBoard ? "12px 16px" : "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge severity={f.severity} />
                    <span style={{
                      fontSize: isBoard ? 14 : 18,
                      color: isBoard ? "#303030" : C.white,
                      fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                      fontWeight: isBoard ? 500 : undefined,
                    }}>{f.title}</span>
                  </div>
                  <span style={{
                    fontSize: isBoard ? 11 : 14,
                    color: isBoard ? "#999" : C.purple,
                    fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                  }}>
                    [{f.category === "structural" ? "STRUCTURE" : f.category === "content" ? "CONTENT" : "WORDS"}]
                  </span>
                </div>

                {open && (
                  <div style={{
                    marginTop: 12, paddingTop: 12,
                    borderTop: isBoard ? "1px solid #E8E8E8" : `1px dashed ${C.border}`,
                  }}>
                    <div style={{
                      fontSize: isBoard ? 13 : 16,
                      color: isBoard ? "#555" : C.sky,
                      lineHeight: 1.6, marginBottom: 10,
                      fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                    }}>{f.description}</div>

                    {f.location && (
                      <div style={{ marginBottom: 8, fontSize: isBoard ? 13 : 15, fontFamily: isBoard ? "'Roboto', sans-serif" : undefined }}>
                        <span style={{ color: isBoard ? "#888" : C.cyan }}>Location: </span>
                        <span style={{ color: isBoard ? "#303030" : C.white }}>{f.location}</span>
                      </div>
                    )}

                    {f.suggestion && (
                      <div style={isBoard
                        ? { background: "#F0FFF0", border: "1px solid #D8F0D8", borderRadius: 0, padding: 12, marginBottom: 8 }
                        : { background: `${C.lime}12`, border: `2px solid ${C.lime}35`, padding: 12, marginBottom: 8 }
                      }>
                        <div style={{
                          fontSize: isBoard ? 10 : 14,
                          color: colors.lime,
                          marginBottom: 3,
                          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                          fontWeight: isBoard ? 700 : undefined,
                          textTransform: "uppercase",
                          letterSpacing: isBoard ? 1 : undefined,
                        }}>SUGGESTION:</div>
                        <div style={{
                          fontSize: isBoard ? 13 : 16,
                          color: isBoard ? "#444" : C.softGreen,
                          lineHeight: 1.5,
                          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                        }}>{f.suggestion}</div>
                      </div>
                    )}

                    {f.reference && (
                      <div style={{
                        fontSize: isBoard ? 12 : 14,
                        color: isBoard ? "#999" : C.purple,
                        fontStyle: "italic",
                        fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
                      }}>ref: {f.reference}</div>
                    )}
                  </div>
                )}
              </div>
            </PixelBox>
          );
        })}
      </div>

      {/* Strengths */}
      {results.strengths?.length > 0 && (
        <PixelBox color={colors.green} bg={isBoard ? "#F0FFF0" : `${C.darkGreen}55`} style={{ marginTop: 14, padding: 16 }}>
          <div style={{
            fontSize: isBoard ? 16 : 20,
            color: colors.lime,
            marginBottom: 10,
            fontFamily: isBoard ? "'Roboto Condensed', sans-serif" : undefined,
            fontWeight: isBoard ? 700 : undefined,
          }}>{T.strengths}</div>
          {results.strengths.map((s, i) => (
            <div key={i} style={{
              fontSize: isBoard ? 13 : 16,
              color: isBoard ? "#444" : C.mint,
              marginBottom: 5, lineHeight: 1.5,
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
            }}>{"\u2713"} {s}</div>
          ))}
        </PixelBox>
      )}

      {/* Footer note */}
      <div style={{
        marginTop: 16, padding: "8px 12px",
        background: isBoard ? "#F8F8F8" : `${C.black}cc`,
        border: isBoard ? "1px solid #E8E8E8" : `2px solid ${C.border}`,
        borderRadius: 0,
        display: "flex", justifyContent: "space-between",
        fontSize: isBoard ? 12 : 14, color: isBoard ? "#999" : "#777",
        flexWrap: "wrap", gap: 6,
        fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
      }}>
        <span>{isBoard ? "Checked" : "checked"}: {fileName}</span>
        <span style={{ color: isBoard ? "#C04535" : C.hotPink }}>{T.advisoryNote}</span>
      </div>
    </div>
  );
}
