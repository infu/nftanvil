import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@vvv-interactive/nftanvil-react/src/theme.js";

const container = document.getElementById("root");
const root = createRoot(container);

function AppRoot() {
  return (
    <ChakraProvider theme={theme}>
      <AnvilProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AnvilProvider>
    </ChakraProvider>
  );
}

root.render(<AppRoot />);
