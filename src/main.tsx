import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const Root = () => {
  if (import.meta.env.DEV) {
    return <App />;
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
createRoot(rootElement).render(<Root />);
