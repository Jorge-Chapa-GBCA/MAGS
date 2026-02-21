import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../styles/theme";
import { Stars, Marquee, PixelBox, RetroBtn, Loader, ScoreBar, Badge } from "./ui";
import { uploadFile, identifyCredit, analyseSubmission } from "../api/client";
import type { CreditInfo, AnalysisResult, Finding } from "../types";

const STEPS = { UPLOAD: 0, IDENTIFYING: 1, IDENTIFIED: 2, ANALYSING: 3, RESULTS: 4 };

const pixelStyle: React.CSSProperties = {
  imageRendering: "pixelated",
  filter: "drop-shadow(0 0 3px rgba(124, 252, 0, 0.5))",
};


export default function MAGS() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [splash, setSplash] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 2200); return () => clearTimeout(t); }, []);

  const onFile = useCallback(async (f: File | undefined) => {
    if (!f) return;
    setFile(f); setError(null); setStep(STEPS.IDENTIFYING);
    try {
      const upload = await uploadFile(f);
      setSessionId(upload.session_id);
      const credit = await identifyCredit(upload.session_id);
      setCreditInfo(credit);
      setStep(STEPS.IDENTIFIED);
    } catch (e: unknown) {
      setError("ack!! " + (e instanceof Error ? e.message : String(e)));
      setStep(STEPS.UPLOAD);
    }
  }, []);

  const analyse = useCallback(async () => {
    if (!creditInfo) return;
    setStep(STEPS.ANALYSING); setError(null);
    try {
      const r = await analyseSubmission(sessionId, creditInfo);
      setResults(r); setStep(STEPS.RESULTS);
    } catch (e: unknown) {
      setError("boom: " + (e instanceof Error ? e.message : String(e)));
      setStep(STEPS.IDENTIFIED);
    }
  }, [sessionId, creditInfo]);

  const reset = () => {
    setStep(STEPS.UPLOAD); setFile(null); setSessionId(""); setCreditInfo(null);
    setResults(null); setError(null); setFilter("all"); setExpanded(null);
  };

  const findings: Finding[] = results?.findings?.filter(
    (f: Finding) => filter === "all" || f.category === filter || f.severity === filter
  ) || [];
  const counts: Record<string, number> = results?.findings?.reduce(
    (a: Record<string, number>, f: Finding) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {}
  ) || {};

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.darkBg} 0%, #0f3460 50%, ${C.midBg} 100%)`,
      fontFamily: "'VT323', monospace", position: "relative", overflow: "hidden",
    }}>
      <Stars />

      {/* Splash */}
      {splash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: C.black, animation: "fadeOut 2.2s ease forwards",
        }}>
          <div style={{ textAlign: "center" }}>
            <img src="/images/diamond-pixel.png" alt="" width={64} height={64} style={{ ...pixelStyle, animation: "float 1s ease-in-out infinite" }} />
            <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 52, animation: "rainbow 2s linear infinite", marginTop: 8 }}>M.A.G.S.</div>
            <div style={{ fontSize: 20, color: C.cyan, marginTop: 8 }}>~ loading the green machine ~</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: `linear-gradient(90deg, ${C.darkGreen}, #003355, ${C.border})`,
        padding: "10px 16px", borderBottom: `3px solid ${C.lime}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/images/diamond-pixel.png" alt="" width={28} height={28} style={{ ...pixelStyle, animation: "float 2s ease-in-out infinite" }} />
          <div>
            <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}, 2px 2px 0 ${C.shadow}`, letterSpacing: 3 }}>M.A.G.S.</div>
            <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 1 }}>Machine-Assisted Green Star Reviewer</div>
          </div>
        </div>
        {step > STEPS.UPLOAD && <RetroBtn color="#999" onClick={reset}>{"\u2190"} start over</RetroBtn>}
      </header>

      {/* Ticker */}
      <div style={{ background: C.black, borderBottom: `2px solid ${C.border}`, fontSize: 15, color: C.yellow }}>
        <Marquee>
          {"\u2605"} M.A.G.S. v1.0 {"\u2605"} upload ur Green Star submission & let the machine do the checking {"\u2605"} now with AI-powered credit identification {"\u2605"} saving assessors one document at a time {"\u2605"} built by GBCA {"\u2605"}
        </Marquee>
      </div>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 14px", position: "relative", zIndex: 1 }}>

        {/* UPLOAD */}
        {step === STEPS.UPLOAD && (
          <div style={{ animation: "slideIn 0.4s ease", minHeight: "calc(100vh - 280px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 28, color: C.sky, textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>
                Hi! I'm
              </div>
              <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 64, animation: "rainbow 4s linear infinite", textShadow: "3px 3px 0 rgba(0,0,0,0.5)", marginTop: 4 }}>
                M.A.G.S.
              </div>
              <div style={{ fontSize: 20, color: C.sky, marginTop: 10, lineHeight: 1.5 }}>
                ur friendly neighbourhood green star submission checker
              </div>
              <div style={{ fontSize: 16, color: C.lavender, marginTop: 12, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                drop a Green Star submission document and i'll identify the credit,
                check it against GBCA reference guides, and flag any structural,
                content, or terminology issues before it goes to the assessors~
              </div>
            </div>

            <PixelBox title="upload_zone.exe" color={C.darkGreen} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
                style={{
                  flex: 1, padding: "48px 24px", textAlign: "center", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: dragOver ? `${C.lime}12` : "transparent",
                }}
              >
                <img src="/images/diamond-pixel.png" alt="" width={56} height={56} style={{ ...pixelStyle, marginBottom: 10, animation: "float 2.5s ease-in-out infinite" }} />
                <div style={{ fontSize: 24, color: C.lime, textShadow: `0 0 8px ${C.lime}30` }}>~ drop ur file here ~</div>
                <div style={{ fontSize: 17, color: C.sky, marginTop: 6 }}>or click to browse!! (pdf, docx, xlsx, txt)</div>
                <div style={{ fontSize: 16, color: C.hotPink, marginTop: 18, animation: "blink 1.5s ease infinite" }}>
                  {">>>"} waiting 4 upload {"<<<"}
                </div>
                <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt,.xlsx,.csv" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0])} />
              </div>
            </PixelBox>

            {error && (
              <PixelBox color={C.red} style={{ marginTop: 14, padding: 12 }}>
                <div style={{ fontSize: 17, color: C.red }}>{"\u274C"} {error}</div>
              </PixelBox>
            )}

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "#556", padding: "4px 14px", background: `${C.black}cc`, border: `1px solid ${C.border}`, display: "inline-block" }}>
                a GBCA production
              </span>
            </div>
          </div>
        )}

        {/* IDENTIFYING */}
        {step === STEPS.IDENTIFYING && (
          <PixelBox title="scanning.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ padding: 28 }}>
              <Loader text="reading ur document" />
              <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginTop: 6 }}>
                analysing <span style={{ color: C.yellow }}>{file?.name}</span>
              </div>
            </div>
          </PixelBox>
        )}

        {/* IDENTIFIED */}
        {step === STEPS.IDENTIFIED && creditInfo && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <PixelBox title="credit_detected.log" color={C.green}>
              <div style={{ padding: 22 }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 28, color: C.lime, textShadow: `0 0 12px ${C.lime}30` }}>found it!!</div>
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
                  <RetroBtn onClick={analyse} style={{ flex: 1 }}>Run Compliance Check!!</RetroBtn>
                  <RetroBtn color={C.hotPink} textColor={C.white} onClick={reset}>wrong? re-upload</RetroBtn>
                </div>

                {error && <div style={{ marginTop: 12, fontSize: 16, color: C.red }}>{"\u274C"} {error}</div>}
              </div>
            </PixelBox>
          </div>
        )}

        {/* ANALYSING */}
        {step === STEPS.ANALYSING && (
          <PixelBox title="analysis.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ padding: 28 }}>
              <Loader text="checking compliance" />
              <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginTop: 4, marginBottom: 14 }}>
                checking <span style={{ color: C.yellow }}>{creditInfo?.credit_name}</span>
              </div>
              {["parsing structure...", "checking requirements...", "scanning terminology...", "crunching numbers..."].map((l, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 16, color: C.lime, marginBottom: 5, animation: `slideIn 0.4s ease ${i * 0.5}s both`, opacity: 0 }}>{l}</div>
              ))}
            </div>
          </PixelBox>
        )}

        {/* RESULTS */}
        {step === STEPS.RESULTS && results && (
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "14px 0" }}>
              {[
                { k: "critical", l: "CRITICAL", c: C.red },
                { k: "warning", l: "WARNING", c: C.orange },
                { k: "info", l: "INFO", c: C.cyan },
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
              <span>checked: {file?.name}</span>
              <span style={{ color: C.hotPink }}>advisory only ~ not a formal assessment</span>
            </div>
          </div>
        )}
      </main>

      {/* Site footer */}
      <footer style={{ marginTop: 40, borderTop: `3px solid ${C.border}`, background: C.black, padding: "14px 16px", textAlign: "center" }}>
        <img src="/images/greenstar-pixel.png" alt="Green Star" width={220} height={40} style={{ ...pixelStyle, marginBottom: 8 }} />
        <div style={{ fontSize: 16, color: C.sky }}>~ made by GBCA ~</div>
        <div style={{ fontSize: 13, color: "#445", marginTop: 4 }}>{"\u00A9"} 2026 Green Building Council of Australia</div>
      </footer>
    </div>
  );
}
