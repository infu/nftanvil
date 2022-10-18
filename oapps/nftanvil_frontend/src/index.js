import React from "react";
import ReactDOM from "react-dom";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store, { history } from "./store";
import { Provider } from "react-redux";
import { auth, window_focus, window_blur } from "./reducers/user";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme.js";
import { ColorModeScript } from "@chakra-ui/react";

import { ConnectedRouter } from "connected-react-router";
import { useSelector } from "react-redux";
import { faucet } from "./reducers/user.js";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

//import "./decorations/Christmass";

// Sentry.init({
//   dsn: "https://50f3883d85f34ee98de5e31eb20a4bb0@o101334.ingest.sentry.io/6230204",
//   integrations: [new BrowserTracing()],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });

setTimeout(() => {
  store.dispatch(auth());
}, 100);

if (process.env.NODE_ENV !== "production") {
  window.faucet = (...arg) => {
    store.dispatch(faucet(...arg));
  };
}

setTimeout(() => {
  ReactDOM.render(
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <React.StrictMode>
        <DndProvider backend={HTML5Backend}>
          <Provider store={store}>
            <ChakraProvider theme={theme}>
              <ConnectedRouter history={history}>
                <App />
              </ConnectedRouter>
            </ChakraProvider>
          </Provider>
        </DndProvider>
      </React.StrictMode>
    </>,
    document.getElementById("root")
  );
}, 200);

setTimeout(() => {
  try {
    window.lockdown({
      //comes from lockdown.umd.min.js
      consoleTaming: "unsafe", // Leave original start console in place
      overrideTaming: "min",
      localeTaming: "unsafe",
      errorTaming: "unsafe",
      errorTrapping: "report",
    });
  } catch (e) {
    document.getElementById("root").innerHTML = null;
  }
}, 1000);

window.addEventListener("focus", () => store.dispatch(window_focus()));
window.addEventListener("blur", () => store.dispatch(window_blur()));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Object.defineProperty(String.prototype, "capitalize", {
//   value: function () {
//     return this.charAt(0).toUpperCase() + this.slice(1);
//   },
//   enumerable: false,
// });
