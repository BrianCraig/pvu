import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { App } from "./App.tsx";
import { PlantIdContextProvider } from "./context/PlantIdContext";
import { SettingsContextProvider } from "./context/SettingsContext";

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
