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

const EXPECTED_REFS: { prefix: string; label: string }[] = [
  { prefix: "submission_guidelines", label: "Submission Guidelines" },
  { prefix: "assessment_panel_manual", label: "Assessment Panel Manual" },
  { prefix: "common_language_guide", label: "Common Language Guide" },
];

interface Props {
  onInitialise: () => void;
}

export function SetupScreen({ onInitialise }: Props) {
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

  const G = "#33ff33";
  const DIM = "#1a7a1a";
  const termLine: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 18, flexWrap: "wrap",
  };
  const prompt: React.CSSProperties = { color: DIM, fontSize: 20, flexShrink: 0 };
  const labelStyle: React.CSSProperties = { color: G, fontSize: 20 };
  const ok: React.CSSProperties = { color: G, fontSize: 18, letterSpacing: 2 };
  const pending: React.CSSProperties = { color: DIM, fontSize: 18, letterSpacing: 2 };

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
          <span style={labelStyle}>api key</span>
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
              <span style={labelStyle}>{ref.label.toLowerCase()}</span>
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
          ) : (
            <span style={{ color: DIM, fontSize: 20, animation: "blink 1.2s step-end infinite" }}>_</span>
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
              style={{ color: "#333", fontSize: 14, cursor: "pointer", letterSpacing: 1 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#666"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#333"; }}
            >
              reload everything
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
