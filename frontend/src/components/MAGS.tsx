import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/theme";
import { Stars, Marquee, RetroBtn } from "./ui";
import {
  uploadFile,
  identifyCredit,
  analyseSubmission,
  getSetupStatus,
  getStoredApiKey,
} from "../api/client";
import type { CreditInfo, AnalysisResult } from "../types";
import { useMode } from "../context/ModeContext";

import { ScanningScreen, AnalysingScreen } from "./PixelFace";
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
  const { mode, toggleMode, colors, T } = useMode();
  const isBoard = mode === "board";

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
          if (isBoard) {
            setBooting(false);
          } else {
            setBooting(true);
            setTimeout(() => setBooting(false), 9000);
          }
        } else {
          setStep(STEPS.SETUP);
          setSplash(false);
        }
      })
      .catch(() => {
        setStep(STEPS.SETUP);
        setSplash(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot animation helper
  const bootIn = (delaySec: number, anim = "slideIn 0.6s ease"): React.CSSProperties =>
    booting ? { opacity: 0, animation: `${anim} ${delaySec}s both` } : {};

  const handleInitialise = useCallback(() => {
    setStep(STEPS.UPLOAD);
    if (isBoard) {
      setBooting(false);
    } else {
      setBooting(true);
      setTimeout(() => setBooting(false), 9000);
    }
  }, [isBoard]);

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
      setError(T.errorUploadPrefix + (e instanceof Error ? e.message : String(e)));
      setStep(STEPS.UPLOAD);
    }
  }, [T.errorUploadPrefix]);

  const analyse = useCallback(async () => {
    if (!creditInfo) return;
    setStep(STEPS.ANALYSING); setError(null);
    try {
      const r = await analyseSubmission(sessionId, creditInfo);
      setResults(r); setStep(STEPS.RESULTS);
    } catch (e: unknown) {
      setError(T.errorAnalysePrefix + (e instanceof Error ? e.message : String(e)));
      setStep(STEPS.IDENTIFIED);
    }
  }, [sessionId, creditInfo, T.errorAnalysePrefix]);

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

  const font = isBoard ? "'Roboto', sans-serif" : "'VT323', monospace";

  // ── Main app: header + stars + ticker + content ──
  return (
    <div style={{
      minHeight: "100vh",
      background: isBoard
        ? "#FFFFFF"
        : `linear-gradient(180deg, ${C.darkBg} 0%, #0f3460 50%, ${C.midBg} 100%)`,
      fontFamily: font, position: "relative", overflow: "hidden",
    }}>

      {/* Boot overlay — fun mode only */}
      {!isBoard && booting && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 998, background: "#000",
          animation: "bootFade 1.2s ease 0.3s forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* Stars — fun mode only (Stars component handles it internally too) */}
      {!isBoard && (
        <div style={bootIn(0.5, "slideIn 1s ease")}>
          <Stars />
        </div>
      )}

      {/* Splash */}
      {splash && step === null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: isBoard ? "#FFFFFF" : "#000",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 20,
              color: isBoard ? "#229C47" : "#33ff33",
              animation: isBoard ? undefined : "blink 1.5s ease infinite",
            }}>{T.bootingText}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: isBoard
          ? "#FFFFFF"
          : `linear-gradient(90deg, ${C.darkGreen}, #003355, ${C.border})`,
        padding: isBoard ? "12px 20px" : "10px 16px",
        borderBottom: isBoard ? "1px solid #E0E0E0" : `3px solid ${C.lime}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        ...(isBoard ? {} : bootIn(0.8, "slideDown 0.5s ease")),
        ...(isBoard ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : {}),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isBoard ? (
            <img src="/images/greenstar-logo.png" alt="Green Star" height={32} style={{ objectFit: "contain" }} />
          ) : (
            <>
              <img src="/images/diamond-pixel.png" alt="" width={28} height={28} style={{ ...pixelStyle, animation: "float 2s ease-in-out infinite" }} />
              <div>
                <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 22, color: C.lime, textShadow: `0 0 10px ${C.lime}, 2px 2px 0 ${C.shadow}`, letterSpacing: 3 }}>M.A.G.S.</div>
                <div style={{ fontSize: 12, color: C.cyan, letterSpacing: 1 }}>Machine-Assisted Green Star Reviewer</div>
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Mode toggle */}
          {isBoard ? (
            <button onClick={toggleMode} aria-label="Switch to Fun Mode" style={{
              width: 40, height: 22, borderRadius: 11, border: "none",
              background: "#44883E", cursor: "pointer", position: "relative",
              transition: "background 0.2s", padding: 0, flexShrink: 0,
            }}>
              <span style={{
                position: "absolute", top: 2, left: 20, width: 18, height: 18,
                borderRadius: "50%", background: "#FFF",
                transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }} />
            </button>
          ) : (
            <RetroBtn color="#666" textColor={C.cyan} onClick={toggleMode} style={{ padding: "6px 12px", fontSize: 13, lineHeight: "16px" }}>
              BRD
            </RetroBtn>
          )}
          {/* Setup button */}
          {isBoard ? (
            <button onClick={goToSetup} aria-label="Setup" style={{
              width: 32, height: 32, borderRadius: 4, border: "none",
              background: "#44883E", color: "#FFF", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#3a7534"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#44883E"; }}
            >{"\u2699"}</button>
          ) : (
            <RetroBtn color="#666" textColor={C.cyan} onClick={goToSetup} style={{ padding: "6px 12px", fontSize: 13, lineHeight: "16px" }}>
              {"\u2699"} setup
            </RetroBtn>
          )}
          {step !== null && step > STEPS.UPLOAD && (
            isBoard ? (
              <button onClick={reset} style={{
                padding: "6px 14px", fontSize: 12, fontFamily: "'Roboto', sans-serif", fontWeight: 500,
                background: "#44883E", color: "#FFF", border: "none", borderRadius: 4,
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#3a7534"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#44883E"; }}
              >{"\u2190"} Start Over</button>
            ) : (
              <RetroBtn color="#999" onClick={reset}>{"\u2190"} start over</RetroBtn>
            )
          )}
        </div>
      </header>

      {/* Ticker — fun mode only */}
      {!isBoard && (
        <div style={{
          background: colors.black,
          borderBottom: `2px solid ${C.border}`,
          fontSize: 15,
          color: C.yellow,
          ...bootIn(1.2, "slideIn 0.4s ease"),
        }}>
          <Marquee>{T.ticker}</Marquee>
        </div>
      )}

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 14px", position: "relative", zIndex: 1 }}>
        {step === STEPS.UPLOAD && (
          <UploadScreen booting={isBoard ? false : booting} bootIn={isBoard ? () => ({}) : bootIn} onFile={onFile} error={error} />
        )}

        {step === STEPS.IDENTIFYING && (
          <ScanningScreen fileName={file?.name} />
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
      <footer style={{
        marginTop: 40,
        borderTop: isBoard ? "1px solid #E0E0E0" : `3px solid ${C.border}`,
        background: isBoard ? "#FFFFFF" : C.black,
        padding: "14px 16px",
        textAlign: "center",
      }}>
        {!isBoard && (
          <img src="/images/greenstar-pixel.png" alt="Green Star" width={220} height={40} style={{ ...pixelStyle, marginBottom: 8 }} />
        )}
        <div style={{
          fontSize: isBoard ? 13 : 16,
          color: isBoard ? "#888" : C.sky,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>{T.footerMadeBy}</div>
        <div style={{
          fontSize: isBoard ? 11 : 13,
          color: isBoard ? "#AAA" : "#445",
          marginTop: 4,
          fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
        }}>{"\u00A9"} 2026 Green Building Council of Australia</div>
      </footer>
    </div>
  );
}
