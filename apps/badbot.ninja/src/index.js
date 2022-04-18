import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
//import reportWebVitals from "./reportWebVitals";
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";

window.lockdown({
  //comes from lockdown.umd.min.js
  consoleTaming: "unsafe", // Leave original start console in place
  overrideTaming: "min",
});

ReactDOM.render(
  <React.StrictMode>
    <AnvilProvider>
      <App />
    </AnvilProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
