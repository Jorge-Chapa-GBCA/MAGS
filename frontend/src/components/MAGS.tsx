import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../styles/theme";
import { Stars, Marquee, PixelBox, RetroBtn, Loader, ScoreBar, Badge } from "./ui";
import {
  uploadFile,
  identifyCredit,
  analyseSubmission,
  getSetupStatus,
  uploadReference,
  validateApiKey,
  setApiKey,
  getStoredApiKey,
  clearApiKey,
} from "../api/client";
import type { CreditInfo, AnalysisResult, Finding, SetupStatus } from "../types";

const STEPS = { SETUP: -1, UPLOAD: 0, IDENTIFYING: 1, IDENTIFIED: 2, ANALYSING: 3, RESULTS: 4 };

const pixelStyle: React.CSSProperties = {
  imageRendering: "pixelated",
  filter: "drop-shadow(0 0 3px rgba(124, 252, 0, 0.5))",
};

// Expected reference doc keys and their display labels
const EXPECTED_REFS: { prefix: string; label: string }[] = [
  { prefix: "submission_guidelines", label: "Submission Guidelines" },
  { prefix: "assessment_panel_manual", label: "Assessment Panel Manual" },
  { prefix: "common_language_guide", label: "Common Language Guide" },
];


// Pixel smiley face for the analysis screen
// Each row is a bitmask — 1 = filled pixel, 0 = empty
const FACE_NEUTRAL = [
  // eyes: two 2x2 blocks
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // nose
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // mouth: smile
  [0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
];

const FACE_THINK = [
  // eyes: left squint, right wide
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // nose
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // mouth: wavy/thinking
  [0,0,0,0,1,1,0,1,1,0,0,0,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0],
];

const FACE_OOH = [
  // eyes wide
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,0,0,0,0,1,1,1,0,0],
  [0,1,1,1,0,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // nose
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // mouth: O shape
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,0,1,0,0,0,0,0],
];

const FACE_GRIN = [
  // eyes: happy squint
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // nose
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  // mouth: big grin
  [0,1,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
];

const FACES = [FACE_NEUTRAL, FACE_THINK, FACE_OOH, FACE_GRIN];

function PixelFace({ grid, color, size = 8 }: { grid: number[][]; color: string; size?: number }) {
  const gap = 2;
  const w = grid[0].length * (size + gap);
  const h = grid.length * (size + gap);
  return (
    <div style={{ width: w, height: h, position: "relative", margin: "0 auto" }}>
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <div key={`${y}-${x}`} style={{
              position: "absolute",
              left: x * (size + gap),
              top: y * (size + gap),
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 ${size}px ${color}60`,
            }} />
          ) : null
        )
      )}
    </div>
  );
}

function IdentifyingFace() {
  const [faceIdx, setFaceIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFaceIdx(f => (f + 1) % 2), 1400);
    return () => clearInterval(t);
  }, []);
  return <PixelFace grid={[FACE_NEUTRAL, FACE_THINK][faceIdx]} color={C.lime} size={8} />;
}

function AnalysingScreen({ creditName }: { creditName: string }) {
  const [faceIdx, setFaceIdx] = useState(0);
  const [dots, setDots] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setFaceIdx(f => (f + 1) % FACES.length), 1800);
    const b = setInterval(() => setDots(d => (d + 1) % 4), 500);
    const c = setInterval(() => setTaskIdx(t => (t + 1) % 4), 2200);
    return () => { clearInterval(a); clearInterval(b); clearInterval(c); };
  }, []);

  const tasks = ["parsing structure", "checking requirements", "scanning terminology", "crunching numbers"];
  const G = C.lime;

  return (
    <PixelBox title="analysis.exe" color={C.border} style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ padding: 28 }}>
        {/* Pixel smiley */}
        <div style={{ marginBottom: 24 }}>
          <PixelFace grid={FACES[faceIdx]} color={G} size={8} />
        </div>

        {/* Status text */}
        <div style={{ textAlign: "center", fontSize: 20, color: G, marginBottom: 6, textShadow: `0 0 10px ${G}40` }}>
          {tasks[taskIdx]}{".".repeat(dots)}
        </div>
        <div style={{ textAlign: "center", fontSize: 16, color: C.sky }}>
          checking <span style={{ color: C.yellow }}>{creditName}</span>
        </div>

        {/* Progress tasks */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{
              textAlign: "center", fontSize: 15,
              color: i < taskIdx ? G : i === taskIdx ? C.cyan : `${C.border}`,
              animation: i === taskIdx ? "blink 1.5s ease infinite" : "none",
            }}>
              {i < taskIdx ? "\u2713" : i === taskIdx ? "\u25B6" : "\u25CB"} {t}
            </div>
          ))}
        </div>
      </div>
    </PixelBox>
  );
}


export default function MAGS() {
  const [step, setStep] = useState<number | null>(null); // null = loading
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [splash, setSplash] = useState(true);
  const [booting, setBooting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup state
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [refUploading, setRefUploading] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const refInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // On mount: check setup status
  useEffect(() => {
    getSetupStatus()
      .then((status) => {
        setSetupStatus(status);
        if (getStoredApiKey()) {
          setApiKeyValid(true);
          setApiKeyInput(getStoredApiKey()!);
        }
        if (status.ready) {
          // Already set up — cinematic boot
          setStep(STEPS.UPLOAD);
          setSplash(false);
          setBooting(true);
          setTimeout(() => setBooting(false), 5000);
        } else {
          // Needs setup — black terminal, no splash
          setStep(STEPS.SETUP);
          setSplash(false);
        }
      })
      .catch(() => {
        setStep(STEPS.SETUP);
        setSplash(false);
      });
  }, []);

  // Initialise: trigger cinematic boot from setup terminal
  const handleInitialise = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setBooting(true);
    setTimeout(() => setBooting(false), 5000);
  }, []);

  // Stagger helper: returns animation style when booting, empty otherwise
  // Usage: bootIn(1.5) or bootIn(1.5, "slideDown 0.5s ease")
  const bootIn = (delaySec: number, anim = "slideIn 0.6s ease"): React.CSSProperties =>
    booting ? { opacity: 0, animation: `${anim} ${delaySec}s both` } : {};
  // ^ reads as: animation: slideIn 0.6s ease 1.5s both (name dur timing delay fill)

  // Refresh setup status from server
  const refreshSetup = useCallback(async () => {
    try {
      const status = await getSetupStatus();
      setSetupStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  // Check if all refs are loaded (at least one matching each prefix)
  const refsLoaded = useCallback((status: SetupStatus | null) => {
    if (!status) return {};
    const result: Record<string, boolean> = {};
    for (const ref of EXPECTED_REFS) {
      result[ref.prefix] = Object.keys(status.reference_docs_loaded).some(
        (k) => k.startsWith(ref.prefix)
      );
    }
    return result;
  }, []);

  const allRefsLoaded = useCallback((status: SetupStatus | null) => {
    const loaded = refsLoaded(status);
    return EXPECTED_REFS.every((r) => loaded[r.prefix]);
  }, [refsLoaded]);

  const setupReady = apiKeyValid && allRefsLoaded(setupStatus);

  // API key validation
  const handleValidateKey = useCallback(async () => {
    if (!apiKeyInput.trim()) return;
    setApiKeyValidating(true);
    setSetupError(null);
    try {
      await validateApiKey(apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setApiKeyValid(true);
      await refreshSetup();
    } catch (e: unknown) {
      setApiKeyValid(false);
      clearApiKey();
      setSetupError(e instanceof Error ? e.message : "Key validation failed");
    } finally {
      setApiKeyValidating(false);
    }
  }, [apiKeyInput, refreshSetup]);

  // Reference upload handler
  const handleRefUpload = useCallback(async (prefix: string, f: File | undefined) => {
    if (!f) return;
    setRefUploading(prefix);
    setSetupError(null);
    try {
      await uploadReference(f);
      await refreshSetup();
    } catch (e: unknown) {
      setSetupError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setRefUploading(null);
    }
  }, [refreshSetup]);

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

  const goToSetup = useCallback(async () => {
    await refreshSetup();
    setSetupError(null);
    setStep(STEPS.SETUP);
  }, [refreshSetup]);

  const findings: Finding[] = results?.findings?.filter(
    (f: Finding) => filter === "all" || f.category === filter || f.severity === filter
  ) || [];
  const counts: Record<string, number> = results?.findings?.reduce(
    (a: Record<string, number>, f: Finding) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {}
  ) || {};

  const loaded = refsLoaded(setupStatus);

  // -----------------------------------------------------------------------
  // SETUP: full-screen black terminal — no branding, no chrome
  // -----------------------------------------------------------------------
  if (step === STEPS.SETUP) {
    const G = "#33ff33";
    const DIM = "#1a7a1a";
    const termLine: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: 18, flexWrap: "wrap",
    };
    const prompt: React.CSSProperties = {
      color: DIM, fontSize: 20, flexShrink: 0,
    };
    const label: React.CSSProperties = {
      color: G, fontSize: 20,
    };
    const ok: React.CSSProperties = {
      color: G, fontSize: 18, letterSpacing: 2,
    };
    const pending: React.CSSProperties = {
      color: DIM, fontSize: 18, letterSpacing: 2,
    };

    return (
      <div style={{
        minHeight: "100vh", background: "#000", fontFamily: "'VT323', monospace",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ maxWidth: 620, width: "100%" }}>

          {/* API key */}
          <div style={termLine}>
            <span style={prompt}>&gt;</span>
            <span style={label}>api key</span>
            {apiKeyValid ? (
              <span style={ok}>[OK]</span>
            ) : (
              <>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => { setApiKeyInput(e.target.value); setApiKeyValid(null); setSetupError(null); }}
                  placeholder="sk-ant-..."
                  style={{
                    flex: 1, minWidth: 180, fontFamily: "'VT323', monospace", fontSize: 19,
                    padding: "4px 8px", background: "transparent", color: G,
                    border: "none", borderBottom: `1px solid ${apiKeyValid === false ? "#ff3333" : DIM}`,
                    outline: "none", caretColor: G,
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleValidateKey(); }}
                  autoFocus
                />
                <span
                  onClick={handleValidateKey}
                  style={{
                    color: apiKeyValidating ? "#666" : G, fontSize: 18, cursor: "pointer",
                    letterSpacing: 2,
                  }}
                >
                  {apiKeyValidating ? "[...]" : "[ENTER]"}
                </span>
              </>
            )}
          </div>

          {/* Reference docs */}
          {EXPECTED_REFS.map((ref) => {
            const isLoaded = loaded[ref.prefix];
            const isUploading = refUploading === ref.prefix;

            return (
              <div key={ref.prefix} style={termLine}>
                <span style={prompt}>&gt;</span>
                <span style={label}>{ref.label.toLowerCase()}</span>
                {isLoaded ? (
                  <span style={ok}>[OK]</span>
                ) : isUploading ? (
                  <span style={{ ...pending, animation: "blink 1s ease infinite" }}>[READING...]</span>
                ) : (
                  <>
                    <span
                      onClick={() => refInputRefs.current[ref.prefix]?.click()}
                      style={{ color: DIM, fontSize: 18, cursor: "pointer", letterSpacing: 2 }}
                    >
                      [UPLOAD]
                    </span>
                    <input
                      ref={(el) => { refInputRefs.current[ref.prefix] = el; }}
                      type="file"
                      accept=".pdf"
                      style={{ display: "none" }}
                      onChange={(e) => handleRefUpload(ref.prefix, e.target.files?.[0])}
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Error line */}
          {(setupError || apiKeyValid === false) && (
            <div style={{ color: "#ff3333", fontSize: 17, marginBottom: 18 }}>
              &gt; ERR: {setupError || "invalid key"}
            </div>
          )}

          {/* Cursor blink or INITIALISE */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            {setupReady ? (
              <span
                onClick={handleInitialise}
                style={{
                  color: G, fontSize: 28, cursor: "pointer", letterSpacing: 4,
                  textShadow: `0 0 12px ${G}80`,
                  padding: "10px 32px",
                  border: `2px solid ${G}`,
                  display: "inline-block",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${G}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                [ INITIALISE ]
              </span>
            ) : (
              <span style={{ color: DIM, fontSize: 20, animation: "blink 1.2s step-end infinite" }}>_</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // MAIN APP: header, stars, ticker, content
  // -----------------------------------------------------------------------
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.darkBg} 0%, #0f3460 50%, ${C.midBg} 100%)`,
      fontFamily: "'VT323', monospace", position: "relative", overflow: "hidden",
    }}>

      {/* Boot overlay: black screen that fades to reveal the gradient + stars */}
      {booting && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 998, background: "#000",
          animation: "bootFade 1.2s ease 0.3s forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* Stars — fade in early during boot */}
      <div style={bootIn(0.5, "slideIn 1s ease")}>
        <Stars />
      </div>

      {/* Splash: only for initial page load when step is null */}
      {splash && step === null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#000",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, color: "#33ff33", animation: "blink 1.5s ease infinite" }}>~ booting up ~</div>
          </div>
        </div>
      )}

      {/* Header — slides down from top */}
      <header style={{
        background: `linear-gradient(90deg, ${C.darkGreen}, #003355, ${C.border})`,
        padding: "10px 16px", borderBottom: `3px solid ${C.lime}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        ...bootIn(0.8, "slideDown 0.5s ease"),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/images/diamond-pixel.png" alt="" width={28} height={28} style={{ ...pixelStyle, animation: "float 2s ease-in-out infinite" }} />
          <div>
            <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}, 2px 2px 0 ${C.shadow}`, letterSpacing: 3 }}>M.A.G.S.</div>
            <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 1 }}>Machine-Assisted Green Star Reviewer</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <RetroBtn color="#666" textColor={C.cyan} onClick={goToSetup} style={{ padding: "6px 12px", fontSize: 13 }}>
            {"\u2699"} setup
          </RetroBtn>
          {step !== null && step > STEPS.UPLOAD && <RetroBtn color="#999" onClick={reset}>{"\u2190"} start over</RetroBtn>}
        </div>
      </header>

      {/* Ticker — slides in */}
      <div style={{
        background: C.black, borderBottom: `2px solid ${C.border}`, fontSize: 15, color: C.yellow,
        ...bootIn(1.2, "slideIn 0.4s ease"),
      }}>
        <Marquee>
          {"\u2605"} M.A.G.S. v1.0 {"\u2605"} upload ur Green Star submission & let the machine do the checking {"\u2605"} now with AI-powered credit identification {"\u2605"} saving assessors one document at a time {"\u2605"} built by GBCA {"\u2605"}
        </Marquee>
      </div>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 14px", position: "relative", zIndex: 1 }}>

        {/* UPLOAD */}
        {step === STEPS.UPLOAD && (
          <div style={{ minHeight: "calc(100vh - 280px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                fontFamily: "'Silkscreen', monospace", fontSize: 28, color: C.sky, textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                ...bootIn(1.6, "slideIn 0.5s ease"),
              }}>
                Hi! I'm
              </div>
              <div style={{
                fontFamily: "'Silkscreen', monospace", fontSize: 64,
                animation: booting ? `scaleReveal 0.8s ease 2.0s both, rainbow 4s linear 2.0s infinite` : "rainbow 4s linear infinite",
                textShadow: "3px 3px 0 rgba(0,0,0,0.5)", marginTop: 4,
                ...(booting ? { opacity: 0 } : {}),
              }}>
                M.A.G.S.
              </div>
              <div style={{
                fontSize: 20, color: C.sky, marginTop: 10, lineHeight: 1.5,
                ...bootIn(2.8, "slideIn 0.5s ease"),
              }}>
                ur friendly neighbourhood<br />Machine-Assisted Green Star<br />reviewer
              </div>
              <div style={{
                fontSize: 16, color: C.lavender, marginTop: 12, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto",
                ...bootIn(3.2, "slideIn 0.5s ease"),
              }}>
                drop a Green Star submission document and i'll identify the credit,
                check it against GBCA reference guides, and flag any structural,
                content, or terminology issues before it goes to the assessors~
              </div>
            </div>

            <div style={bootIn(3.7, "slideIn 0.6s ease")}>
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
            </div>

            {error && (
              <PixelBox color={C.red} style={{ marginTop: 14, padding: 12 }}>
                <div style={{ fontSize: 17, color: C.red }}>{"\u274C"} {error}</div>
              </PixelBox>
            )}

            <div style={{ textAlign: "center", marginTop: 16, ...bootIn(4.2, "slideIn 0.4s ease") }}>
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
              <IdentifyingFace />
              <div style={{ textAlign: "center", fontSize: 20, color: C.lime, marginTop: 16, textShadow: `0 0 10px ${C.lime}40` }}>
                reading ur document
              </div>
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
                  <RetroBtn onClick={analyse} style={{ flex: 1 }}>Run Compliance Check!!</RetroBtn>
                  <RetroBtn color={C.hotPink} textColor={C.white} onClick={reset}>wrong? re-upload</RetroBtn>
                </div>

                {error && <div style={{ marginTop: 12, fontSize: 16, color: C.red }}>{"\u274C"} {error}</div>}
              </div>
            </PixelBox>
          </div>
        )}

        {/* ANALYSING */}
        {step === STEPS.ANALYSING && <AnalysingScreen creditName={creditInfo?.credit_name || ""} />}

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
                { k: "major_nc", l: "MAJOR NC", c: C.red },
                { k: "minor_nc", l: "MINOR NC", c: C.orange },
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
