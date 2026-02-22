import "./styles/animations.css";
import MAGS from "./components/MAGS";
import { ErrorBoundary } from "./components/ui";

function App() {
  return (
    <ErrorBoundary>
      <MAGS />
    </ErrorBoundary>
  );
}

export default App;
