import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { App } from "./App.tsx";
import { PlantIdContextProvider } from "./context/PlantIdContext";
import { SettingsContextProvider } from "./context/SettingsContext";

if (process?.env?.NODE_ENV === 'production') {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-JB36BMB2MX');
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-JB36BMB2MX";
  document.head.appendChild(script);
}

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);


const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <SettingsContextProvider>
      <PlantIdContextProvider>
        <App />
      </PlantIdContextProvider>
    </SettingsContextProvider>
  </StrictMode>,
  rootElement
);
