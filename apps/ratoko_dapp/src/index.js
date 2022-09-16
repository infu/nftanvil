import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
//import reportWebVitals from "./reportWebVitals";
import { AnvilProvider } from "./link_lib";
import { BrowserRouter } from "react-router-dom";

import authentication from "./link_lib/auth.js";
authentication.setOptions({ cookie: true });

// window.lockdown({
//   //comes from lockdown.umd.min.js
//   consoleTaming: "unsafe", // Leave original start console in place
//   overrideTaming: "min",
// });

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
