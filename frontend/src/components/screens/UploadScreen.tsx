import { useState, useRef, useEffect } from "react";
import { C } from "../../styles/theme";
import { PixelBox } from "../ui";
import { HappyFace } from "../PixelFace";
import { useMode } from "../../context/ModeContext";

function Typewriter({ text, delay, speed = 50, style, instant = false }: { text: string; delay: number; speed?: number; style?: React.CSSProperties; instant?: boolean }) {
  const [visible, setVisible] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (instant) { setStarted(true); setVisible(text.length); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay, instant, text.length]);

  useEffect(() => {
    if (instant) return;
    if (!started) return;
    if (visible >= text.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), speed);
    return () => clearTimeout(t);
  }, [started, visible, text, speed, instant]);

  if (!started) return <div style={{ ...style, visibility: "hidden" }}>{text}</div>;
  if (instant) return <div style={style}>{text}</div>;
  return (
    <div style={style}>
      <span>{text.slice(0, visible)}</span>
      {visible < text.length && <span style={{ animation: "blink 0.6s step-end infinite" }}>_</span>}
      <span style={{ visibility: "hidden" }}>{text.slice(visible)}</span>
    </div>
  );
}

interface Props {
  booting: boolean;
  bootIn: (delaySec: number, anim?: string) => React.CSSProperties;
  onFile: (f: File | undefined) => void;
  error: string | null;
}

export function UploadScreen({ booting, bootIn, onFile, error }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mode, colors, T } = useMode();
  const isBoard = mode === "board";

  const titleFont = isBoard ? "'Roboto Condensed', sans-serif" : "'Silkscreen', monospace";
  const bodyFont = isBoard ? "'Roboto', sans-serif" : undefined;

  return (
    <div style={{ minHeight: "calc(100vh - 280px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {isBoard ? (
          <>
            <img src="/images/greenstar-logo.png" alt="Green Star" height={48} style={{ objectFit: "contain", marginBottom: 8 }} />
            <div style={{ fontSize: 14, color: "#888", fontFamily: bodyFont }}>
              Credit submission review tool
            </div>
          </>
        ) : (
          <>
            {booting ? (
              <Typewriter
                text={T.greeting}
                delay={1600}
                speed={80}
                style={{ fontFamily: titleFont, fontSize: 28, color: C.sky, textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}
              />
            ) : (
              <div style={{ fontFamily: titleFont, fontSize: 28, color: C.sky, textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>
                {T.greeting}
              </div>
            )}
            <div style={{
              fontFamily: titleFont, fontSize: 64,
              animation: booting ? `scaleReveal 0.8s ease 2.4s both, rainbow 4s linear 2.4s infinite` : "rainbow 4s linear infinite",
              textShadow: "3px 3px 0 rgba(0,0,0,0.5)",
              marginTop: 4,
              ...(booting ? { opacity: 0 } : {}),
            }}>
              {T.appTitle}
            </div>
            {booting ? (
              <Typewriter
                text={T.subtitle}
                delay={3200}
                speed={15}
                style={{ fontSize: 20, color: C.sky, marginTop: 10, lineHeight: 1.5 }}
              />
            ) : (
              <div style={{ fontSize: 20, color: C.sky, marginTop: 10, lineHeight: 1.5 }}>
                {T.subtitle}
              </div>
            )}
            {booting ? (
              <Typewriter
                text={T.description}
                delay={5200}
                speed={10}
                style={{ fontSize: 16, color: C.lavender, marginTop: 12, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}
              />
            ) : (
              <div style={{ fontSize: 16, color: C.lavender, marginTop: 12, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                {T.description}
              </div>
            )}
          </>
        )}
      </div>

      <div style={!isBoard && booting ? { opacity: 0, animation: "tvOpen 0.8s ease 7.5s both", transformOrigin: "center center" } : (isBoard ? { animation: "slideIn 0.3s ease" } : {})}>
        <PixelBox title={T.uploadBoxTitle} color={isBoard ? colors.green : C.darkGreen} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              flex: 1, padding: isBoard ? "40px 24px" : "48px 24px", textAlign: "center", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: dragOver ? (isBoard ? "#F0FFF0" : `${C.lime}12`) : "transparent",
              borderRadius: isBoard ? 12 : 0,
            }}
          >
            {isBoard ? (
              <div style={{ marginBottom: 20, fontSize: 48, color: dragOver ? colors.green : "#BBBBBB" }}>
                {"\u2B06"}
              </div>
            ) : (
              <div style={{ marginBottom: 30 }}>
                <HappyFace color={C.lime} size={6} excited={dragOver} />
              </div>
            )}
            <div style={{
              fontSize: isBoard ? 18 : 24,
              color: isBoard ? (dragOver ? colors.green : "#555") : C.lime,
              textShadow: isBoard ? undefined : `0 0 8px ${C.lime}30`,
              fontFamily: isBoard ? "'Roboto', sans-serif" : undefined,
              fontWeight: isBoard ? 500 : undefined,
            }}>
              {dragOver ? T.dropRelease : T.dropHere}
            </div>
            <div style={{
              fontSize: isBoard ? 13 : 17,
              color: isBoard ? "#999" : C.sky,
              marginTop: 6,
              fontFamily: bodyFont,
            }}>{T.browseHint}</div>
            {!isBoard && (
              <div style={{ fontSize: 16, color: C.hotPink, marginTop: 18, animation: "blink 1.5s ease infinite" }}>
                {dragOver ? T.waitingUploadDrag : T.waitingUpload}
              </div>
            )}
            {isBoard && (
              <div style={{ fontSize: 12, color: "#BBB", marginTop: 14, fontFamily: bodyFont }}>
                {T.waitingUpload}
              </div>
            )}
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.xlsx,.csv" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0])} />
          </div>
        </PixelBox>
      </div>

      {error && (
        <PixelBox color={colors.red} style={{ marginTop: 14, padding: 12 }}>
          <div style={{ fontSize: isBoard ? 14 : 17, color: colors.red, fontFamily: bodyFont }}>{"\u274C"} {error}</div>
        </PixelBox>
      )}

      <div style={{ textAlign: "center", marginTop: 16, ...(isBoard ? {} : bootIn(8.5, "slideIn 0.4s ease")) }}>
        <span style={{
          fontSize: 12,
          color: isBoard ? "#BBB" : "#556",
          padding: "4px 14px",
          background: isBoard ? "transparent" : `${C.black}cc`,
          border: isBoard ? "none" : `1px solid ${C.border}`,
          display: "inline-block",
          fontFamily: bodyFont,
        }}>
          {T.gbcaTag}
        </span>
      </div>
    </div>
  );
}
