import React, { useEffect, useState } from "react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  AnvilProvider,
  TestAnvilComponent,
  useAnvilDispatch,
  useAnvilSelector,
  login,
  logout,
} from "@vvv-interactive/nftanvil-react";
import logo from "./logo.svg";
import "./App.css";

function Test() {
  const dispatch = useAnvilDispatch();
  const address = useAnvilSelector((state) => state.user.address);
  return (
    <>
      <div>{address}</div>

      {address ? (
        <button
          onClick={() => {
            dispatch(logout());
          }}
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => {
            dispatch(login());
          }}
        >
          Authenticate
        </button>
      )}
    </>
  );
}

function App() {
  const [nfts, setNfts] = React.useState(false);
  const load = async () => {
    let url =
      "https://nftpkg.com/api/v1/author/a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda";
    const resp = await fetch(url).then((x) => x.json());
    setNfts(resp);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AnvilProvider>
      <div className="App">
        <header className="App-header">
          <Test /> <TestAnvilComponent />;
          <NFTPage nfts={nfts} />
        </header>
      </div>
    </AnvilProvider>
  );
}

function NFTPage({ nfts }) {
  if (!nfts) return null;
  let slice = [];
  for (let i = 0; i < 4; i++) {
    slice.push(nfts[i]);
  }
  return (
    <>
      {slice.map((nft, idx) => {
        return <div key={idx}>{nft[0]}</div>;
      })}
    </>
  );
}

export default App;
