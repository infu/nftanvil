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
  TestAnvilComponent,
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
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
            dispatch(user_logout());
          }}
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => {
            dispatch(user_login());
          }}
        >
          Authenticate
        </button>
      )}
    </>
  );
}

function App() {
  const loaded = useAnvilSelector((state) => state.user.map.history);
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
  if (!loaded) return null;

  return (
    <div className="App">
      <header className="App-header">
        <Test /> <TestAnvilComponent />
        <NFTPage nfts={nfts} />
      </header>
    </div>
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
        return <NFT id={tokenToText(nft[0])} key={idx} />;
      })}
    </>
  );
}

function NFT({ id }) {
  const meta = useAnvilSelector((state) => state.nft[id]);

  const dispatch = useAnvilDispatch();

  useEffect(() => {
    dispatch(nft_fetch(id));
  }, [id, dispatch]);

  if (!meta) return null;

  console.log("META", meta);
  return (
    <div>
      {id} - {meta.name}
    </div>
  );
}

export default App;
