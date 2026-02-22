import { useState, useRef, useCallback } from "react";
import {
  getSetupStatus,
  uploadReference,
  validateApiKey,
  setApiKey,
  getStoredApiKey,
  clearApiKey,
} from "../../api/client";
import type { SetupStatus } from "../../types";
import { useMode } from "../../context/ModeContext";

const EXPECTED_REFS: { prefix: string; label: string }[] = [
  { prefix: "submission_guidelines", label: "Submission Guidelines" },
  { prefix: "assessment_panel_manual", label: "Assessment Panel Manual" },
  { prefix: "common_language_guide", label: "Common Language Guide" },
];

interface Props {
  onInitialise: () => void;
}

export function SetupScreen({ onInitialise }: Props) {
  const { mode } = useMode();
  const isBoard = mode === "board";

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(() =>
    getStoredApiKey() ? true : null
  );
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [refUploading, setRefUploading] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const refInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Initialise stored key on first render
  useState(() => {
    const stored = getStoredApiKey();
    if (stored) setApiKeyInput(stored);
    getSetupStatus()
      .then(setSetupStatus)
      .catch(() => {});
  });

  const refreshSetup = useCallback(async () => {
    try {
      const status = await getSetupStatus();
      setSetupStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  const refsLoaded = (status: SetupStatus | null): Record<string, boolean> => {
    if (!status) return {};
    const result: Record<string, boolean> = {};
    for (const ref of EXPECTED_REFS) {
      result[ref.prefix] = Object.keys(status.reference_docs_loaded).some(
        (k) => k.startsWith(ref.prefix)
      );
    }
    return result;
  };

  const loaded = refsLoaded(setupStatus);
  const allRefsOk = EXPECTED_REFS.every((r) => loaded[r.prefix]);
  const setupReady = apiKeyValid && allRefsOk;

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

  // Board mode colors
  const BG = isBoard ? "#F5FFF4" : "#000";
  const G = isBoard ? "#229C47" : "#33ff33";
  const DIM = isBoard ? "#AAAAAA" : "#1a7a1a";
  const ERR = isBoard ? "#C04535" : "#ff3333";
  const font = isBoard ? "'Roboto', sans-serif" : "'VT323', monospace";

  const termLine: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 18, flexWrap: "wrap",
  };
  const prompt: React.CSSProperties = { color: DIM, fontSize: isBoard ? 16 : 20, flexShrink: 0 };
  const labelStyle: React.CSSProperties = { color: G, fontSize: isBoard ? 16 : 20, fontWeight: isBoard ? 500 : undefined };
  const ok: React.CSSProperties = { color: G, fontSize: isBoard ? 14 : 18, letterSpacing: isBoard ? 1 : 2 };
  const pending: React.CSSProperties = { color: DIM, fontSize: isBoard ? 14 : 18, letterSpacing: isBoard ? 1 : 2 };

  return (
    <div style={{
      minHeight: "100vh", background: BG, fontFamily: font,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        maxWidth: 620, width: "100%",
        ...(isBoard ? { background: "#FFFFFF", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" } : {}),
      }}>

        {isBoard && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: "#229C47", marginBottom: 4 }}>
              M.A.G.S. Setup
            </div>
            <div style={{ fontSize: 13, color: "#999" }}>Configure your API key and reference documents.</div>
          </div>
        )}

        {/* API key */}
        <div style={termLine}>
          <span style={prompt}>{isBoard ? "\u2022" : ">"}</span>
          <span style={labelStyle}>{isBoard ? "API Key" : "api key"}</span>
          {apiKeyValid ? (
            <span style={ok}>{isBoard ? "\u2713 Verified" : "[OK]"}</span>
          ) : (
            <>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => { setApiKeyInput(e.target.value); setApiKeyValid(null); setSetupError(null); }}
                placeholder="sk-ant-..."
                style={{
                  flex: 1, minWidth: 180, fontFamily: font, fontSize: isBoard ? 14 : 19,
                  padding: isBoard ? "8px 12px" : "4px 8px",
                  background: isBoard ? "#F8F8F8" : "transparent",
                  color: isBoard ? "#303030" : G,
                  border: isBoard ? `1px solid ${apiKeyValid === false ? ERR : "#DDD"}` : "none",
                  borderBottom: isBoard ? undefined : `1px solid ${apiKeyValid === false ? ERR : DIM}`,
                  borderRadius: isBoard ? 6 : 0,
                  outline: "none", caretColor: G,
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleValidateKey(); }}
                autoFocus
              />
              <span
                onClick={handleValidateKey}
                style={{
                  color: apiKeyValidating ? "#666" : G,
                  fontSize: isBoard ? 14 : 18,
                  cursor: "pointer",
                  letterSpacing: isBoard ? 0 : 2,
                  ...(isBoard ? { padding: "6px 14px", background: G, color: "#FFF", borderRadius: 5, fontWeight: 500 } : {}),
                  ...(apiKeyValidating && isBoard ? { opacity: 0.5, pointerEvents: "none" as const } : {}),
                }}
              >
                {apiKeyValidating ? (isBoard ? "..." : "[...]") : (isBoard ? "Verify" : "[ENTER]")}
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
              <span style={prompt}>{isBoard ? "\u2022" : ">"}</span>
              <span style={labelStyle}>{isBoard ? ref.label : ref.label.toLowerCase()}</span>
              {isLoaded ? (
                <span style={ok}>{isBoard ? "\u2713 Uploaded" : "[OK]"}</span>
              ) : isUploading ? (
                <span style={{ ...pending, animation: isBoard ? undefined : "blink 1s ease infinite" }}>
                  {isBoard ? "Processing..." : "[READING...]"}
                </span>
              ) : (
                <>
                  <span
                    onClick={() => refInputRefs.current[ref.prefix]?.click()}
                    style={{
                      color: isBoard ? G : DIM,
                      fontSize: isBoard ? 13 : 18,
                      cursor: "pointer",
                      letterSpacing: isBoard ? 0 : 2,
                      ...(isBoard ? { padding: "4px 12px", border: `1px solid ${G}`, borderRadius: 5 } : {}),
                    }}
                  >
                    {isBoard ? "Upload" : "[UPLOAD]"}
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
          <div style={{ color: ERR, fontSize: isBoard ? 13 : 17, marginBottom: 18, fontFamily: font }}>
            {isBoard ? "" : "> "}{isBoard ? "Error" : "ERR"}: {setupError || "invalid key"}
          </div>
        )}

        {/* Cursor blink or INITIALISE */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          {setupReady ? (
            isBoard ? (
              <button
                onClick={onInitialise}
                style={{
                  fontFamily: "'Roboto', sans-serif", fontSize: 15, fontWeight: 500,
                  padding: "12px 40px", background: G, color: "#FFF",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.18)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = ""; }}
              >
                Initialise
              </button>
            ) : (
              <span
                onClick={onInitialise}
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
            )
          ) : (
            <span style={{
              color: DIM, fontSize: 20,
              animation: isBoard ? undefined : "blink 1.2s step-end infinite",
            }}>{isBoard ? "" : "_"}</span>
          )}
        </div>

        {/* Reset everything */}
        {setupReady && (
          <div style={{ marginTop: 48, textAlign: "center" }}>
            <span
              onClick={() => {
                clearApiKey();
                setApiKeyInput("");
                setApiKeyValid(null);
                setSetupStatus(null);
                setSetupError(null);
                refreshSetup();
              }}
              style={{
                color: isBoard ? "#BBB" : "#333",
                fontSize: isBoard ? 12 : 14,
                cursor: "pointer",
                letterSpacing: isBoard ? 0 : 1,
                fontFamily: font,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = isBoard ? "#888" : "#666"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = isBoard ? "#BBB" : "#333"; }}
            >
              {isBoard ? "Reset configuration" : "reload everything"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
