import React, { useEffect, useState } from "react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { PrincipalToIdx } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_pwr_transfer,
  user_refresh_balances,
} from "@vvv-interactive/nftanvil-react";
import { User } from "./components/User";
import { Collection } from "./components/Collection";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Principal } from "@dfinity/principal";

import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";

import { createCollectionActor } from "./declarations/collection.js";

import logo from "./logo.svg";
import nfts from "./nfts.json";
import "./App.css";

function App() {
  const loaded = useAnvilSelector((state) => state.user.map.history);
  const dispatch = useAnvilDispatch();
  if (!loaded) return null;

  return (
    <div className="App">
      <div className="Title">Bad Bot Ninja</div>
      <div className="Subtitle">gear for post-apocalyptic overlords</div>
      <button
        onClick={async () => {
          // make pwr transfer and get tx

          // let cp = Principal.fromText();
          let destination = principalToAccountIdentifier(
            process.env.REACT_APP_COLLECTION_CANISTER_ID
          );
          // let p = Principal.fromText(
          //   process.env.REACT_APP_COLLECTION_CANISTER_ID
          // );
          // console.log(p, PrincipalToIdx(p));
          // return;
          let dres = await dispatch(
            user_pwr_transfer({ to: destination, amount: 40000, memo: [] })
          );
          if ("err" in dres) throw dres.err;
          let txid = dres.ok.transactionId;
          //TransactionId.fromText("TX888888DA1D4MZOQ");

          let collection = createCollectionActor({
            agentOptions: authentication.getAgentOptions(),
          });

          const withDelay = async (txid, ms) => {
            await delay(ms);
            return await collection.check_tx(txid);
          };

          let pr = [
            withDelay(txid, 1),
            withDelay(txid, 2),
            withDelay(txid, 3),
            withDelay(txid, 4),
            withDelay(txid, 5),
          ];

          console.log(await Promise.all(pr));
          dispatch(user_refresh_balances());
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

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

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
