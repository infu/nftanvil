import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store, { history } from "./store";
import { Provider } from "react-redux";
import { auth } from "./reducers/user";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme.js";
import { ColorModeScript } from "@chakra-ui/react";

import { ConnectedRouter } from "connected-react-router";
//import "./decorations/Christmass";

setTimeout(() => {
  store.dispatch(auth());
}, 100);

setTimeout(() => {
  ReactDOM.render(
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <React.StrictMode>
        <ChakraProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <App />
            </ConnectedRouter>
          </Provider>
        </ChakraProvider>
      </React.StrictMode>
    </>,
    document.getElementById("root")
  );
}, 200);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});
