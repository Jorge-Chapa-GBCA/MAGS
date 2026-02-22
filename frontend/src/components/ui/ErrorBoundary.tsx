import { Component, type ReactNode } from "react";
import { C } from "../../styles/theme";
import { RetroBtn } from "./RetroBtn";
import { PixelBox } from "./PixelBox";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        minHeight: "100vh",
        background: C.darkBg,
        fontFamily: "'VT323', monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <PixelBox title="error.exe" color={C.red}>
          <div style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, color: C.red, marginBottom: 12 }}>
              {"\u2620"} uh oh {"\u2620"}
            </div>
            <div style={{ fontSize: 20, color: C.sky, marginBottom: 20, lineHeight: 1.5 }}>
              something broke!! try refreshing the page.
            </div>
            <RetroBtn onClick={() => window.location.reload()}>
              {"\u21BB"} reload
            </RetroBtn>
          </div>
        </PixelBox>
      </div>
    );
  }
}
