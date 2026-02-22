import "./styles/animations.css";
import MAGS from "./components/MAGS";
import { ErrorBoundary } from "./components/ui";
import { ModeProvider } from "./context/ModeContext";

function App() {
  return (
    <ErrorBoundary>
      <ModeProvider>
        <MAGS />
      </ModeProvider>
    </ErrorBoundary>
  );
}

export default App;
