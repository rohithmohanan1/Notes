import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createTheme, ThemeProvider } from '@/components/ui/theme-provider';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme} defaultTheme="light">
    <App />
  </ThemeProvider>
);
