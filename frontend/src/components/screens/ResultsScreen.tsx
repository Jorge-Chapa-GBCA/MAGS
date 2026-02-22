import { useState } from "react";
import { C } from "../../styles/theme";
import { PixelBox, ScoreBar, Badge } from "../ui";
import type { AnalysisResult, CreditInfo, Finding } from "../../types";

interface Props {
  results: AnalysisResult;
  creditInfo: CreditInfo | null;
  fileName: string | undefined;
}

export function ResultsScreen({ results, creditInfo, fileName }: Props) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const findings: Finding[] = results.findings?.filter(
    (f: Finding) => filter === "all" || f.category === filter || f.severity === filter
  ) || [];
  const counts: Record<string, number> = results.findings?.reduce(
    (a: Record<string, number>, f: Finding) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {}
  ) || {};

  return (
    <div style={{ animation: "slideIn 0.4s ease" }}>

      {/* Score */}
      <PixelBox title={`results.exe // ${creditInfo?.credit_id}`} color={C.lime}>
        <div style={{ padding: 22, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 160 }}><ScoreBar score={results.overall_score} /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 22, color: C.cyan, marginBottom: 8 }}>{creditInfo?.credit_name}</div>
            <div style={{ fontSize: 17, color: C.sky, lineHeight: 1.5 }}>{results.summary}</div>
          </div>
        </div>
      </PixelBox>

      {/* Severity counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "14px 0" }}>
        {[
          { k: "no_submission_form", l: "CRITICAL", c: C.hotPink },
          { k: "major_nc", l: "MAJOR", c: C.red },
          { k: "minor_nc", l: "MINOR", c: C.orange },
          { k: "general", l: "GENERAL", c: C.cyan },
        ].map(s => (
          <div key={s.k} onClick={() => setFilter(filter === s.k ? "all" : s.k)} style={{
            background: `${s.c}25`, border: `3px solid ${filter === s.k ? C.white : s.c}`,
            padding: "10px 6px", textAlign: "center", cursor: "pointer",
            boxShadow: filter === s.k ? `0 0 14px ${s.c}` : `3px 3px 0 ${C.shadow}`,
          }}>
            <div style={{ fontSize: 34, color: s.c, textShadow: `0 0 10px ${s.c}` }}>{counts[s.k] || 0}</div>
            <div style={{ fontSize: 13, color: s.c, letterSpacing: 2 }}>{s.l}</div>
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
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            fontFamily: "'VT323', monospace", fontSize: 16, padding: "5px 14px",
            background: filter === f.k ? C.lime : "transparent",
            color: filter === f.k ? C.black : C.lime,
            border: `2px solid ${C.lime}`, cursor: "pointer",
            boxShadow: filter === f.k ? `0 0 8px ${C.lime}` : "none",
          }}>{f.l}</button>
        ))}
      </div>

      {/* Findings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {findings.length === 0 && (
          <div style={{ textAlign: "center", padding: 28, color: C.sky, fontSize: 20 }}>no findings here!</div>
        )}
        {findings.map((f, i) => {
          const open = expanded === f.id;
          return (
            <PixelBox key={f.id || i} color={C.border} style={{ cursor: "pointer", boxShadow: open ? `0 0 14px ${C.purple}30, 4px 4px 0 ${C.shadow}` : `4px 4px 0 ${C.shadow}` }}>
              <div onClick={() => setExpanded(open ? null : f.id)} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge severity={f.severity} />
                    <span style={{ fontSize: 18, color: C.white }}>{f.title}</span>
                  </div>
                  <span style={{ fontSize: 14, color: C.purple }}>
                    [{f.category === "structural" ? "STRUCTURE" : f.category === "content" ? "CONTENT" : "WORDS"}]
                  </span>
                </div>

                {open && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
                    <div style={{ fontSize: 16, color: C.sky, lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>

                    {f.location && (
                      <div style={{ marginBottom: 8, fontSize: 15 }}>
                        <span style={{ color: C.cyan }}>location: </span>
                        <span style={{ color: C.white }}>{f.location}</span>
                      </div>
                    )}

                    {f.suggestion && (
                      <div style={{ background: `${C.lime}12`, border: `2px solid ${C.lime}35`, padding: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, color: C.lime, marginBottom: 3 }}>SUGGESTION:</div>
                        <div style={{ fontSize: 16, color: C.softGreen, lineHeight: 1.5 }}>{f.suggestion}</div>
                      </div>
                    )}

                    {f.reference && (
                      <div style={{ fontSize: 14, color: C.purple, fontStyle: "italic" }}>ref: {f.reference}</div>
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
        <PixelBox color={C.green} bg={`${C.darkGreen}55`} style={{ marginTop: 14, padding: 16 }}>
          <div style={{ fontSize: 20, color: C.lime, marginBottom: 10 }}>things u did great!!</div>
          {results.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 16, color: C.mint, marginBottom: 5, lineHeight: 1.5 }}>{"\u2713"} {s}</div>
          ))}
        </PixelBox>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 16, padding: "8px 12px", background: `${C.black}cc`, border: `2px solid ${C.border}`, display: "flex", justifyContent: "space-between", fontSize: 14, color: "#777", flexWrap: "wrap", gap: 6 }}>
        <span>checked: {fileName}</span>
        <span style={{ color: C.hotPink }}>advisory only ~ not a formal assessment</span>
      </div>
    </div>
  );
}
