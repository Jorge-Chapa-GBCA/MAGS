import { useState, useRef } from "react";
import { C } from "../../styles/theme";
import { PixelBox } from "../ui";
import { HappyFace } from "../PixelFace";

interface Props {
  booting: boolean;
  bootIn: (delaySec: number, anim?: string) => React.CSSProperties;
  onFile: (f: File | undefined) => void;
  error: string | null;
}

export function UploadScreen({ booting, bootIn, onFile, error }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
          ur friendly neighbourhood Machine-Assisted Green Star reviewer
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
            <div style={{ marginBottom: 10 }}>
              <HappyFace color={C.lime} size={6} />
            </div>
            <div style={{ fontSize: 24, color: C.lime, textShadow: `0 0 8px ${C.lime}30` }}>~ drop ur file here ~</div>
            <div style={{ fontSize: 17, color: C.sky, marginTop: 6 }}>or click to browse!! (pdf, docx, xlsx, txt)</div>
            <div style={{ fontSize: 16, color: C.hotPink, marginTop: 18, animation: "blink 1.5s ease infinite" }}>
              {">>>"} waiting 4 upload {"<<<"}
            </div>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.xlsx,.csv" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0])} />
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
  );
}
