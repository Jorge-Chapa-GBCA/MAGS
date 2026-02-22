import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { C } from "../styles/theme";
import { B } from "../styles/theme-board";
import { funText, boardText, type TextDictionary } from "../text";

type Mode = "fun" | "board";

interface ModeContextValue {
  mode: Mode;
  toggleMode: () => void;
  colors: typeof C;
  T: TextDictionary;
}

const ModeContext = createContext<ModeContextValue>({
  mode: "fun",
  toggleMode: () => {},
  colors: C,
  T: funText,
});

const STORAGE_KEY = "mags_mode";

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "board") return "board";
    } catch {}
    return "fun";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    document.body.classList.toggle("board-mode", mode === "board");
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "fun" ? "board" : "fun"));
  }, []);

  const colors = mode === "fun" ? C : B;
  const T = mode === "fun" ? funText : boardText;

  return (
    <ModeContext.Provider value={{ mode, toggleMode, colors, T }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
