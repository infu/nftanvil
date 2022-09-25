import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <>
    <React.StrictMode>
      <AnvilProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AnvilProvider>
    </React.StrictMode>
  </>,
  document.getElementById("root")
);
