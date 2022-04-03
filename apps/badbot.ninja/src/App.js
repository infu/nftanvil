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
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
} from "@vvv-interactive/nftanvil-react";
import { User } from "./components/User";
import { Collection } from "./components/Collection";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import logo from "./logo.svg";
import nfts from "./nfts.json";
import "./App.css";

import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";

import { createCollectionActor } from "./declarations/collection.js";

function App() {
  const loaded = useAnvilSelector((state) => state.user.map.history);
  if (!loaded) return null;

  return (
    <div className="App">
      <div className="Title">Bad Bot Ninja</div>
      <div className="Subtitle">gear for post-apocalyptic overlords</div>
      <button
        onClick={async () => {
          let txid = TransactionId.fromText("TX888888DA1D4MZOQ");
          txid = [...txid]; // transforms ArrayBuffer to Array;

          await authentication.create();
          let collection = createCollectionActor({
            agentOptions: authentication.getAgentOptions(),
          });
          let resp = await collection.check_tx(txid);
          console.log(resp);
        }}
      >
        Test
      </button>
      <User />
      <br />
      <br />
      <br />
      <Collection nfts={nfts} />
    </div>
  );
}

export default App;

// const [nfts, setNfts] = React.useState(false);
// const load = async () => {
//   let url =
//     "https://nftpkg.com/api/v1/author/a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda";
//   const resp = await fetch(url).then((x) => x.json());
//   setNfts(resp);
// };

// useEffect(() => {
//   load();
// }, []);
