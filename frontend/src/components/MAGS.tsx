import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/theme";
import { Stars, Marquee, PixelBox, RetroBtn } from "./ui";
import {
  uploadFile,
  identifyCredit,
  analyseSubmission,
  getSetupStatus,
  getStoredApiKey,
} from "../api/client";
import type { CreditInfo, AnalysisResult } from "../types";

import { IdentifyingFace, AnalysingScreen } from "./PixelFace";
import { SetupScreen } from "./screens/SetupScreen";
import { UploadScreen } from "./screens/UploadScreen";
import { IdentifiedScreen } from "./screens/IdentifiedScreen";
import { ResultsScreen } from "./screens/ResultsScreen";

const STEPS = { SETUP: -1, UPLOAD: 0, IDENTIFYING: 1, IDENTIFIED: 2, ANALYSING: 3, RESULTS: 4 };

const pixelStyle: React.CSSProperties = {
  imageRendering: "pixelated",
  filter: "drop-shadow(0 0 3px rgba(124, 252, 0, 0.5))",
};

export default function MAGS() {
  const [step, setStep] = useState<number | null>(null); // null = loading
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [splash, setSplash] = useState(true);
  const [booting, setBooting] = useState(false);

  // On mount: check setup status
  useEffect(() => {
    getSetupStatus()
      .then((status) => {
        if (getStoredApiKey() && status.ready) {
          setStep(STEPS.UPLOAD);
          setSplash(false);
          setBooting(true);
          setTimeout(() => setBooting(false), 5000);
        } else {
          setStep(STEPS.SETUP);
          setSplash(false);
        }
      })
      .catch(() => {
        setStep(STEPS.SETUP);
        setSplash(false);
      });
  }, []);

  // Boot animation helper
  const bootIn = (delaySec: number, anim = "slideIn 0.6s ease"): React.CSSProperties =>
    booting ? { opacity: 0, animation: `${anim} ${delaySec}s both` } : {};

  const handleInitialise = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setBooting(true);
    setTimeout(() => setBooting(false), 5000);
  }, []);

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
    setResults(null); setError(null);
  };

  const goToSetup = useCallback(() => {
    setStep(STEPS.SETUP);
  }, []);

  // ── Setup screen: full-screen, no chrome ──
  if (step === STEPS.SETUP) {
    return <SetupScreen onInitialise={handleInitialise} />;
  }

  // ── Main app: header + stars + ticker + content ──
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.darkBg} 0%, #0f3460 50%, ${C.midBg} 100%)`,
      fontFamily: "'VT323', monospace", position: "relative", overflow: "hidden",
    }}>

      {/* Boot overlay */}
      {booting && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 998, background: "#000",
          animation: "bootFade 1.2s ease 0.3s forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* Stars */}
      <div style={bootIn(0.5, "slideIn 1s ease")}>
        <Stars />
      </div>

      {/* Splash */}
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

      {/* Header */}
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

      {/* Ticker */}
      <div style={{
        background: C.black, borderBottom: `2px solid ${C.border}`, fontSize: 15, color: C.yellow,
        ...bootIn(1.2, "slideIn 0.4s ease"),
      }}>
        <Marquee>
          {"\u2605"} M.A.G.S. v1.0 {"\u2605"} upload ur Green Star submission & let the machine do the checking {"\u2605"} now with AI-powered credit identification {"\u2605"} saving assessors one document at a time {"\u2605"} built by GBCA {"\u2605"}
        </Marquee>
      </div>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 14px", position: "relative", zIndex: 1 }}>
        {step === STEPS.UPLOAD && (
          <UploadScreen booting={booting} bootIn={bootIn} onFile={onFile} error={error} />
        )}

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

        {step === STEPS.IDENTIFIED && creditInfo && (
          <IdentifiedScreen creditInfo={creditInfo} onAnalyse={analyse} onReset={reset} error={error} />
        )}

        {step === STEPS.ANALYSING && (
          <AnalysingScreen creditName={creditInfo?.credit_name || ""} />
        )}

        {step === STEPS.RESULTS && results && (
          <ResultsScreen results={results} creditInfo={creditInfo} fileName={file?.name} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 40, borderTop: `3px solid ${C.border}`, background: C.black, padding: "14px 16px", textAlign: "center" }}>
        <img src="/images/greenstar-pixel.png" alt="Green Star" width={220} height={40} style={{ ...pixelStyle, marginBottom: 8 }} />
        <div style={{ fontSize: 16, color: C.sky }}>~ made by GBCA ~</div>
        <div style={{ fontSize: 13, color: "#445", marginTop: 4 }}>{"\u00A9"} 2026 Green Building Council of Australia</div>
      </footer>
    </div>
  );
}
