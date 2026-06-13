import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto-reload when a stale dynamic chunk fails to load after a new deploy
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});
window.addEventListener("error", (e) => {
  const msg = e?.message || "";
  if (msg.includes("dynamically imported module") || msg.includes("Failed to fetch dynamically imported module")) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
