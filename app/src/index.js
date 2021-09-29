import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { App } from "./App.tsx";
import { PlantIdContextProvider } from "./context/PlantIdContext";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <PlantIdContextProvider>
      <App />
    </PlantIdContextProvider>
  </StrictMode>,
  rootElement
);
