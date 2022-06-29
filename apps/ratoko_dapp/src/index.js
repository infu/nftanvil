import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
//import reportWebVitals from "./reportWebVitals";
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";

import { theme } from "./theme.js";

import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";
authentication.setOptions({ cookie: true });

window.lockdown({
  //comes from lockdown.umd.min.js
  consoleTaming: "unsafe", // Leave original start console in place
  overrideTaming: "min",
});

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <React.StrictMode>
      <AnvilProvider>
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChakraProvider>
      </AnvilProvider>
    </React.StrictMode>
  </>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
