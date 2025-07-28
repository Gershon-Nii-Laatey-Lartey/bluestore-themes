
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import "./index.css";
import App from "./App";

// Detect PWA standalone mode and add class to body
function setPwaStandaloneClass() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    document.body.classList.add('pwa-standalone');
  } else {
    document.body.classList.remove('pwa-standalone');
  }
}
setPwaStandaloneClass();
window.addEventListener('resize', setPwaStandaloneClass);
window.addEventListener('orientationchange', setPwaStandaloneClass);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
