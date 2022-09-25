import React from "react";
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";

// Default implementation, that you can customize
export default function Root({ children }) {
  return <AnvilProvider>HELLOOO BOO{children}</AnvilProvider>;
}
