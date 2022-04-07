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

import { buy, claim, get_mine } from "./actions/purchase";

import logo from "./logo.svg";
import bbn_logo from "./assets/bbn_logo.png";

import nfts from "./nfts.json";
import "./App.css";

function PriceOptions() {
  const dispatch = useAnvilDispatch();

  return (
    <div className="priceOptions">
      <button
        onClick={async () => {
          dispatch(buy(40000));
        }}
      >
        Buy 1
      </button>
      <button
        onClick={async () => {
          dispatch(buy(80000));
        }}
      >
        Buy 5 (10% discount)
      </button>
      <button
        onClick={async () => {
          dispatch(buy(120000));
        }}
      >
        Buy 20 (20% discount)
      </button>
    </div>
  );
}

function App() {
  const loaded = useAnvilSelector((state) => state.user.map.history);

  const dispatch = useAnvilDispatch();
  const [mine, setMine] = React.useState([]);

  const load = async () => {
    setMine(await dispatch(get_mine()));
  };

  useEffect(() => {
    if (loaded) {
      dispatch(claim()); // in case something went wrong, on refresh this will claim purchased nfts
      load();
    }
  }, [loaded, dispatch]);

  if (!loaded) return null;

  return (
    <div className="App">
      <img src={bbn_logo} className="bbn-logo" alt="Bad Bot Ninja" />
      <h1 className="Title">Bad Bot Ninja</h1>
      <div className="Subtitle">gear for post-apocalyptic overlords</div>

      <User />
      <PriceOptions />

      <br />
      <br />
      <br />
      <Collection nfts={nfts} mine={mine} />
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
