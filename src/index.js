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

import { ConnectedRouter } from "connected-react-router";

setTimeout(() => {
  store.dispatch(auth());
}, 100);

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
