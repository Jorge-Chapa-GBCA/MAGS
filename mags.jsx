import { useState, useEffect, useRef, useCallback } from "react";

// ─── EARLY INTERNET PALETTE ───
const C = {
  lime: "#7CFC00",
  green: "#00CC66",
  darkGreen: "#006633",
  hotPink: "#FF69B4",
  yellow: "#FFD700",
  cyan: "#00FFFF",
  purple: "#9B59B6",
  lavender: "#E8D5F5",
  sky: "#87CEEB",
  white: "#FFFFFF",
  cream: "#FFFEF2",
  black: "#1a1a2e",
  darkBg: "#16213e",
  midBg: "#1a1a3e",
  cardBg: "#FFFFF0",
  border: "#333366",
  shadow: "#000033",
  red: "#FF4444",
  orange: "#FF8C00",
  mint: "#98FFB0",
  softGreen: "#E8FFE8",
  softPink: "#FFE8F0",
};

const STEPS = { UPLOAD: 0, IDENTIFYING: 1, IDENTIFIED: 2, ANALYSING: 3, RESULTS: 4 };

// ─── API CALLS ───
async function identifyCredit(fileContent, fileName) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a Green Star certification expert. Analyse this document and identify which Green Star credit it relates to.\n\nFilename: ${fileName}\n\nContent (first 3000 chars):\n${fileContent.substring(0, 3000)}\n\nRespond ONLY in JSON:\n{"credit_id":"e.g. Energy-1","credit_name":"Full name","rating_tool":"e.g. Green Star Buildings","confidence":0.0,"summary":"Brief description"}`
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { credit_id: "???", credit_name: "Mystery Credit", rating_tool: "Unknown", confidence: 0, summary: text }; }
}

async function analyseSubmission(fileContent, fileName, creditInfo) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `You are a Green Star assessor reviewing "${creditInfo.credit_name}" (${creditInfo.credit_id}) under ${creditInfo.rating_tool}.\n\nCheck for:\n1. STRUCTURAL: missing sections, templates, formatting\n2. CONTENT: evidence gaps, unsubstantiated claims\n3. TERMINOLOGY: non-standard terms vs common language\n\nFilename: ${fileName}\nContent:\n${fileContent.substring(0, 8000)}\n\nRespond ONLY in JSON:\n{"overall_score":0-100,"summary":"2-3 sentences","findings":[{"id":"F1","category":"structural|content|terminology","severity":"critical|warning|info","title":"Short title","description":"Issue","location":"Where","suggestion":"Fix","reference":"Guideline ref"}],"strengths":["Good things"]}`
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { overall_score: 0, summary: "oops!! " + text.substring(0, 200), findings: [], strengths: [] }; }
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("[Could not read file]");
    reader.readAsText(file);
  });
}

// ─── COMPONENTS ───

function Stars({ count = 18 }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    size: Math.random() > 0.5 ? 12 : 8,
    char: ["\u2726", "\u2727", "\u22C6", "\u2736", "\u2605"][Math.floor(Math.random() * 5)],
    color: [C.yellow, C.hotPink, C.cyan, C.lime, C.purple][Math.floor(Math.random() * 5)],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <span key={i} style={{
          position: "absolute", left: s.left, top: s.top, fontSize: s.size,
          color: s.color, animation: `twinkle 2s ease-in-out ${s.delay} infinite`,
          textShadow: `0 0 4px ${s.color}`,
        }}>{s.char}</span>
      ))}
    </div>
  );
}

function Marquee({ children }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", padding: "6px 0" }}>
      <div style={{ display: "inline-block", animation: "marquee 22s linear infinite" }}>
        <span style={{ paddingRight: 80 }}>{children}</span>
        <span style={{ paddingRight: 80 }}>{children}</span>
      </div>
    </div>
  );
}

function PixelBox({ children, color = C.border, bg = `${C.black}ee`, title, style: extra = {} }) {
  return (
    <div style={{
      background: bg, border: `3px solid ${color}`, borderRadius: 0,
      boxShadow: `4px 4px 0px ${C.shadow}`,
      ...extra,
    }}>
      {title && (
        <div style={{
          background: `linear-gradient(90deg, ${color}80, ${color}30)`,
          padding: "6px 14px", borderBottom: `3px solid ${color}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.red, border: "1px solid #990000" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.yellow, border: "1px solid #997700" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.lime, border: "1px solid #006600" }} />
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: C.cyan, marginLeft: 4 }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function RetroBtn({ children, onClick, color = C.lime, bg, textColor, style: s = {} }) {
  const bgColor = bg || `linear-gradient(180deg, ${color} 0%, ${color}bb 100%)`;
  const txtColor = textColor || C.black;
  return (
    <button onClick={onClick} style={{
      background: bgColor, color: txtColor,
      border: `3px solid ${C.shadow}`, borderRadius: 0,
      padding: "10px 20px", fontSize: 16, fontWeight: 400,
      cursor: "pointer", fontFamily: "'VT323', monospace", letterSpacing: 1,
      textTransform: "uppercase",
      boxShadow: `3px 3px 0px ${C.shadow}, inset 1px 1px 0px rgba(255,255,255,0.3)`,
      transition: "transform 0.1s",
      ...s,
    }}
    onMouseDown={e => e.currentTarget.style.transform = "translate(2px, 2px)"}
    onMouseUp={e => e.currentTarget.style.transform = ""}
    onMouseLeave={e => e.currentTarget.style.transform = ""}
    >{children}</button>
  );
}

function Loader({ text }) {
  const [dots, setDots] = useState(0);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setDots(d => (d + 1) % 4), 500);
    const b = setInterval(() => setFrame(f => (f + 1) % 4), 250);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const spinner = ["\u25D0", "\u25D3", "\u25D1", "\u25D2"][frame];
  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <div style={{ fontSize: 40, marginBottom: 8, animation: "float 1.5s ease-in-out infinite" }}>{spinner}</div>
      <div style={{ fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}40` }}>
        {text}{".".repeat(dots)}
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 75 ? C.lime : score >= 50 ? C.yellow : C.red;
  const face = score >= 75 ? "(^\u25E1^)" : score >= 50 ? "(\u00B4\u30FB\u03C9\u30FB`)" : "(\u2299\uFE4F\u2299)";
  const label = score >= 75 ? "lookin good!!" : score >= 50 ? "needs some work~" : "uh oh spaghetti-o";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 80, fontFamily: "'VT323', monospace",
        color, textShadow: `0 0 30px ${color}, 0 0 60px ${color}30`,
        lineHeight: 1,
      }}>{score}</div>
      <div style={{ fontSize: 18, color, marginTop: 4 }}>{face} {label}</div>
      <div style={{
        marginTop: 10, height: 20, background: "#222",
        border: `3px solid ${C.border}`, overflow: "hidden",
        boxShadow: `inset 2px 2px 0px rgba(0,0,0,0.4)`,
      }}>
        <div style={{
          height: "100%", width: `${score}%`,
          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 10px, ${color}88 10px, ${color}88 14px)`,
          transition: "width 1.5s ease-out",
          boxShadow: `0 0 12px ${color}`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginTop: 2 }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}

function Badge({ severity }) {
  const cfg = {
    critical: { bg: C.red, label: "!! CRITICAL !!" },
    warning: { bg: C.orange, label: "~ WARNING ~" },
    info: { bg: C.cyan, label: "i INFO i" },
  };
  const s = cfg[severity] || cfg.info;
  return (
    <span style={{
      fontFamily: "'VT323', monospace", fontSize: 14, padding: "2px 10px",
      background: s.bg, color: severity === "info" ? C.black : C.white,
      border: `2px solid ${C.black}`, boxShadow: `2px 2px 0px ${C.shadow}`,
    }}>{s.label}</span>
  );
}

function HazardBar() {
  return (
    <div style={{
      background: `repeating-linear-gradient(45deg, ${C.yellow} 0px, ${C.yellow} 10px, ${C.black} 10px, ${C.black} 20px)`,
      height: 8, width: "100%",
    }} />
  );
}

// ─── MAIN ───

export default function MAGS() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [creditInfo, setCreditInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [splash, setSplash] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 2200); return () => clearTimeout(t); }, []);

  const onFile = useCallback(async (f) => {
    if (!f) return;
    setFile(f); setError(null); setStep(STEPS.IDENTIFYING);
    try {
      const txt = await readFileAsText(f);
      setFileContent(txt);
      const credit = await identifyCredit(txt, f.name);
      setCreditInfo(credit);
      setStep(STEPS.IDENTIFIED);
    } catch (e) { setError("ack!! " + e.message); setStep(STEPS.UPLOAD); }
  }, []);

  const analyse = useCallback(async () => {
    setStep(STEPS.ANALYSING); setError(null);
    try {
      const r = await analyseSubmission(fileContent, file.name, creditInfo);
      setResults(r); setStep(STEPS.RESULTS);
    } catch (e) { setError("boom: " + e.message); setStep(STEPS.IDENTIFIED); }
  }, [fileContent, file, creditInfo]);

  const reset = () => { setStep(STEPS.UPLOAD); setFile(null); setFileContent(""); setCreditInfo(null); setResults(null); setError(null); setFilter("all"); setExpanded(null); };

  const findings = results?.findings?.filter(f => filter === "all" || f.category === filter || f.severity === filter) || [];
  const counts = results?.findings?.reduce((a, f) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {}) || {};

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.darkBg} 0%, #0f3460 50%, ${C.midBg} 100%)`,
      fontFamily: "'VT323', monospace", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Silkscreen:wght@400;700&display=swap');
        @keyframes twinkle { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.2; transform:scale(0.5); } }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes rainbow { 0%{color:#FF6B6B} 16%{color:#FF8C00} 33%{color:#FFD700} 50%{color:#7CFC00} 66%{color:#00FFFF} 83%{color:#FF69B4} 100%{color:#FF6B6B} }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeOut { 0%{opacity:1} 75%{opacity:1} 100%{opacity:0;pointer-events:none} }
        * { box-sizing:border-box; } body { margin:0; }
        ::-webkit-scrollbar { width:10px; }
        ::-webkit-scrollbar-track { background:${C.darkBg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; }
      `}</style>

      <Stars />

      {/* Splash */}
      {splash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: C.black, animation: "fadeOut 2.2s ease forwards",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, animation: "float 1s ease-in-out infinite" }}>{"\uD83C\uDF3F"}</div>
            <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 52, animation: "rainbow 2s linear infinite", marginTop: 8 }}>MAGS</div>
            <div style={{ fontSize: 20, color: C.cyan, marginTop: 8 }}>~ loading the green machine ~</div>
          </div>
        </div>
      )}

      {/* Header */}
      <HazardBar />
      <header style={{
        background: `linear-gradient(90deg, ${C.darkGreen}, #003355, ${C.border})`,
        padding: "10px 16px", borderBottom: `3px solid ${C.lime}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26, animation: "float 2s ease-in-out infinite" }}>{"\uD83C\uDF3F"}</span>
          <div>
            <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}, 2px 2px 0 ${C.shadow}`, letterSpacing: 3 }}>MAGS</div>
            <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 1 }}>Machine-Assisted Green Star</div>
          </div>
        </div>
        {step > STEPS.UPLOAD && <RetroBtn color="#999" onClick={reset}>{"\u2190"} start over</RetroBtn>}
      </header>

      {/* Ticker */}
      <div style={{ background: C.black, borderBottom: `2px solid ${C.border}`, fontSize: 15, color: C.yellow }}>
        <Marquee>
          {"\u2605"} MAGS v1.0 {"\u2605"} upload ur Green Star submission & let the machine do the checking {"\u2605"} now with AI-powered credit identification {"\u2605"} saving assessors one document at a time {"\u2605"} built with {"\uD83C\uDF3F"} by GBCA {"\u2605"}
        </Marquee>
      </div>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 14px", position: "relative", zIndex: 1 }}>

        {/* ── UPLOAD ── */}
        {step === STEPS.UPLOAD && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 42, animation: "rainbow 4s linear infinite", textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}>
                Welcome 2 MAGS!
              </div>
              <div style={{ fontSize: 20, color: C.sky, marginTop: 10, lineHeight: 1.5 }}>
                ur friendly neighbourhood green star submission checker {"\u2728"}
              </div>
            </div>

            <PixelBox title="upload_zone.exe" color={C.darkGreen}>
              <div
                onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
                style={{
                  padding: "48px 24px", textAlign: "center", cursor: "pointer",
                  background: dragOver ? `${C.lime}12` : "transparent",
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 10, animation: "float 2.5s ease-in-out infinite" }}>{"\uD83D\uDCC1"}</div>
                <div style={{ fontSize: 24, color: C.lime, textShadow: `0 0 8px ${C.lime}30` }}>~ drop ur file here ~</div>
                <div style={{ fontSize: 17, color: C.sky, marginTop: 6 }}>or click to browse!! (pdf, docx, txt)</div>
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

            <div style={{ textAlign: "center", marginTop: 32, fontSize: 28 }}>
              {"\uD83C\uDF31\uD83C\uDFD7\uFE0F\uD83C\uDF0D\u2728\uD83C\uDF3F"}
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#556", padding: "4px 14px", background: `${C.black}cc`, border: `1px solid ${C.border}`, display: "inline-block" }}>
                {"\uD83D\uDD17"} a GBCA production {"\uD83D\uDD17"} best viewed at 800x600 {"\uD83D\uDD17"} sign my guestbook!!
              </span>
            </div>
          </div>
        )}

        {/* ── IDENTIFYING ── */}
        {step === STEPS.IDENTIFYING && (
          <PixelBox title="scanning.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ padding: 28 }}>
              <Loader text="reading ur document" />
              <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginTop: 6 }}>
                analysing <span style={{ color: C.yellow }}>{file?.name}</span>
              </div>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 28 }}>{"\uD83D\uDD0D\uD83D\uDCC4\uD83E\uDD16"}</div>
            </div>
          </PixelBox>
        )}

        {/* ── IDENTIFIED ── */}
        {step === STEPS.IDENTIFIED && creditInfo && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <PixelBox title="credit_detected.log" color={C.green}>
              <div style={{ padding: 22 }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 36 }}>{"\uD83C\uDFAF"}</div>
                  <div style={{ fontSize: 28, color: C.lime, textShadow: `0 0 12px ${C.lime}30` }}>found it!!</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[
                    { label: "CREDIT", val: creditInfo.credit_name, icon: "\uD83C\uDFF7\uFE0F" },
                    { label: "ID", val: creditInfo.credit_id, icon: "\uD83D\uDD22" },
                    { label: "RATING TOOL", val: creditInfo.rating_tool, icon: "\uD83D\uDCD0" },
                    { label: "CONFIDENCE", val: `${Math.round(creditInfo.confidence * 100)}%`, icon: "\uD83C\uDFB2" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: `${C.border}40`, border: `2px solid ${C.border}`, padding: "10px 12px" }}>
                      <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 2, marginBottom: 3 }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: 18, color: C.white, wordBreak: "break-word" }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {creditInfo.summary && (
                  <div style={{ background: `${C.purple}20`, border: `2px solid ${C.purple}50`, padding: 12, marginBottom: 18 }}>
                    <div style={{ fontSize: 13, color: C.purple, marginBottom: 3 }}>{"\uD83D\uDCAC"} SUMMARY</div>
                    <div style={{ fontSize: 17, color: C.lavender, lineHeight: 1.5 }}>{creditInfo.summary}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <RetroBtn onClick={analyse} style={{ flex: 1 }}>{"\uD83D\uDE80"} Run Compliance Check!!</RetroBtn>
                  <RetroBtn color={C.hotPink} textColor={C.white} onClick={reset}>{"\uD83D\uDD04"} wrong? re-upload</RetroBtn>
                </div>

                {error && <div style={{ marginTop: 12, fontSize: 16, color: C.red }}>{"\u274C"} {error}</div>}
              </div>
            </PixelBox>
          </div>
        )}

        {/* ── ANALYSING ── */}
        {step === STEPS.ANALYSING && (
          <PixelBox title="analysis.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ padding: 28 }}>
              <Loader text="checking compliance" />
              <div style={{ textAlign: "center", fontSize: 16, color: C.sky, marginTop: 4, marginBottom: 14 }}>
                checking <span style={{ color: C.yellow }}>{creditInfo?.credit_name}</span>
              </div>
              {["\uD83D\uDCD0 parsing structure...", "\uD83D\uDCCB checking requirements...", "\uD83D\uDCD6 scanning terminology...", "\uD83E\uDDEE crunching numbers..."].map((l, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 16, color: C.lime, marginBottom: 5, animation: `slideIn 0.4s ease ${i * 0.5}s both`, opacity: 0 }}>{l}</div>
              ))}
            </div>
          </PixelBox>
        )}

        {/* ── RESULTS ── */}
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
                { k: "critical", l: "CRITICAL", c: C.red, e: "\uD83D\uDEA8" },
                { k: "warning", l: "WARNING", c: C.orange, e: "\u26A0\uFE0F" },
                { k: "info", l: "INFO", c: C.cyan, e: "\uD83D\uDCA1" },
              ].map(s => (
                <div key={s.k} onClick={() => setFilter(filter === s.k ? "all" : s.k)} style={{
                  background: `${s.c}25`, border: `3px solid ${filter === s.k ? C.white : s.c}`,
                  padding: "10px 6px", textAlign: "center", cursor: "pointer",
                  boxShadow: filter === s.k ? `0 0 14px ${s.c}` : `3px 3px 0 ${C.shadow}`,
                }}>
                  <div style={{ fontSize: 34, color: s.c, textShadow: `0 0 10px ${s.c}` }}>{counts[s.k] || 0}</div>
                  <div style={{ fontSize: 13, color: s.c, letterSpacing: 2 }}>{s.e} {s.l}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { k: "all", l: "ALL" },
                { k: "structural", l: "\uD83C\uDFD7\uFE0F STRUCTURE" },
                { k: "content", l: "\uD83D\uDCCB CONTENT" },
                { k: "terminology", l: "\uD83D\uDCD6 WORDS" },
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
                <div style={{ textAlign: "center", padding: 28, color: C.sky, fontSize: 20 }}>{"\u2728"} no findings here! {"\u2728"}</div>
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
                          [{f.category === "structural" ? "\uD83C\uDFD7\uFE0F STRUCTURE" : f.category === "content" ? "\uD83D\uDCCB CONTENT" : "\uD83D\uDCD6 WORDS"}]
                        </span>
                      </div>

                      {open && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
                          <div style={{ fontSize: 16, color: C.sky, lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>

                          {f.location && (
                            <div style={{ marginBottom: 8, fontSize: 15 }}>
                              <span style={{ color: C.cyan }}>{"\uD83D\uDCCD"} location: </span>
                              <span style={{ color: C.white }}>{f.location}</span>
                            </div>
                          )}

                          {f.suggestion && (
                            <div style={{ background: `${C.lime}12`, border: `2px solid ${C.lime}35`, padding: 12, marginBottom: 8 }}>
                              <div style={{ fontSize: 14, color: C.lime, marginBottom: 3 }}>{"\uD83D\uDCA1"} SUGGESTION:</div>
                              <div style={{ fontSize: 16, color: C.softGreen, lineHeight: 1.5 }}>{f.suggestion}</div>
                            </div>
                          )}

                          {f.reference && (
                            <div style={{ fontSize: 14, color: C.purple, fontStyle: "italic" }}>{"\uD83D\uDCDA"} ref: {f.reference}</div>
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
                <div style={{ fontSize: 20, color: C.lime, marginBottom: 10 }}>{"\uD83C\uDF1F"} things u did great!! {"\uD83C\uDF1F"}</div>
                {results.strengths.map((s, i) => (
                  <div key={i} style={{ fontSize: 16, color: C.mint, marginBottom: 5, lineHeight: 1.5 }}>{"\u2713"} {s}</div>
                ))}
              </PixelBox>
            )}

            {/* Footer note */}
            <div style={{ marginTop: 16, padding: "8px 12px", background: `${C.black}cc`, border: `2px solid ${C.border}`, display: "flex", justifyContent: "space-between", fontSize: 14, color: "#777", flexWrap: "wrap", gap: 6 }}>
              <span>{"\uD83D\uDCC4"} checked: {file?.name}</span>
              <span style={{ color: C.hotPink }}>{"\u26A0\uFE0F"} advisory only ~ not a formal assessment</span>
            </div>
          </div>
        )}
      </main>

      {/* Site footer */}
      <footer style={{ marginTop: 40, borderTop: `3px solid ${C.border}`, background: C.black, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 16, color: C.sky }}>~ made with {"\uD83C\uDF3F"} and {"\u2728"} by GBCA ~</div>
        <div style={{ fontSize: 13, color: "#445", marginTop: 4 }}>{"\u00A9"} 2026 Green Building Council of Australia | sign my guestbook!!</div>
        <div style={{ marginTop: 8, fontSize: 20, letterSpacing: 6 }}>{"\uD83C\uDF31\uD83C\uDFD7\uFE0F\uD83C\uDF0D\uD83D\uDC9A\u2728"}</div>
      </footer>
      <HazardBar />
    </div>
  );
}
