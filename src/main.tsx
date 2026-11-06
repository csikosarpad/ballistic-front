import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/oxanium/latin-400.css";
import "@fontsource/oxanium/latin-600.css";
import "@fontsource/oxanium/latin-700.css";
import "@fontsource/oxanium/latin-ext-400.css";
import "@fontsource/oxanium/latin-ext-600.css";
import "@fontsource/oxanium/latin-ext-700.css";
import "@fontsource/rajdhani/latin-500.css";
import "@fontsource/rajdhani/latin-700.css";
import "@fontsource/rajdhani/latin-ext-500.css";
import "@fontsource/rajdhani/latin-ext-700.css";
import "./ui/ui.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
