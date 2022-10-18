import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AnvilProvider } from "./nftanvil-react/";
import { BrowserRouter } from "react-router-dom";
const container = document.getElementById("root");
const root = createRoot(container);

function AppRoot() {
  return (
    <AnvilProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnvilProvider>
  );
}

root.render(<AppRoot />);
