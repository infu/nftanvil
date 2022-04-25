import React, { useEffect, useState, useRef } from "react";
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

import {
  buy,
  claim,
  get_mine,
  airdrop_use,
  stats,
  unprocessed_tx,
} from "./actions/purchase";
import { ButtonModal } from "./components/Tools.js";
import { PriceOptions, ProgressBar } from "./components/Ito.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import logo from "./logo.svg";
import bbn_logo from "./assets/bbn_logo.png";

import nfts from "./nfts.json";
import "./App.css";

const START = 1651089600; //Date.now() / 1000 + 30;

const getShuffledArr = (arr) => {
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};

let r_nfts = getShuffledArr(nfts);

function About() {
  return (
    <div className="about">
      <p>
        Welcome to badbot.ninja – Open-source Internet Computer web3 dapp
        demonstrating how easy it is for developers to build their own NFT use
        cases with the Anvil protocol.
      </p>
      <p>
        Badbot Ninja metaverse apparel is a collection of NFTs made to be
        inexpensive and accessible. We are starting with 10k NFT helmets and
        later we will be adding NFTs for other character slots like chest, legs,
        hands, etc. In the future we’re going to be working on crafting,
        enchanting, avatar customization and our own blockchain game engine. In
        the long term, these will be used in Zraham City which is our city in
        the metaverse.
      </p>
      <p>
        What you see here is 10K AI-generated helmet NFTs – each one unique with
        its own name, description, and attributes (also some are rarer than
        others). 5k NFTs are available for purchase, 4k are allocated for
        airdrops, and 1k is left for us. This is all set up securely with smart
        contracts running on ICP, everyone gets random NFTs – even us!
      </p>
      <p>
        Because AIs are strange and nobody knows how they work - some NFTs may
        be weird – but don’t worry in the future we’ll add the ability to
        disenchant your NFT into raw materials such as crystals, metals and
        other supplies to be used in Zraham City.
      </p>
      <p>
        We appreciate you guys trying out our dapp and we hope you have fun!
      </p>
      <p>
        Some useful links:
        <br />
        <a href="https://nftanvil.com" target="_blank">
          NFT Anvil
        </a>{" "}
        <br />
        <a href="https://docs.nftanvil.com/docs/intro" target="_blank">
          Anvil protocol docs
        </a>
        <br />
        <a
          href="https://github.com/infu/nftanvil/tree/main/apps/badbot.ninja"
          target="_blank"
        >
          Github link to this dapp and smart contract
        </a>
      </p>
      <p>P.S Secondary Market will open 1 week after launch</p>
    </div>
  );
}

function Timer({ children }) {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("");
  const [open, setOpen] = useState(false);

  const dispatch = useAnvilDispatch();

  const load = async () => {
    let duration = START - Math.round(Date.now() / 1000);
    let days = Math.floor(duration / (60 * 60 * 24));
    let hours = Math.floor((duration - days * (60 * 60 * 24)) / (60 * 60));
    let min = Math.floor(
      (duration - days * (60 * 60 * 24) - hours * (60 * 60)) / 60
    );
    let sec = Math.floor(
      duration - days * (60 * 60 * 24) - hours * (60 * 60) - min * 60
    );

    if (duration <= 0) {
      setOpen(true);
      setTime("");
    } else
      setTime(
        days +
          " days " +
          hours +
          " hours " +
          min +
          " minutes " +
          sec +
          "seconds until start"
      );
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load();
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [count, dispatch]);

  return (
    <div style={{ textAlign: "center", marginTop: "8px" }}>
      {time}
      <div className={open ? "ito-open" : "ito-waiting"}>{children}</div>
    </div>
  );
}

function App() {
  const loaded = useAnvilSelector((state) => state.user.map.history);
  const logged = useAnvilSelector((state) => state.user.address);

  const dispatch = useAnvilDispatch();
  const [mine, setMine] = React.useState([]);

  const load = async () => {
    setMine(await dispatch(get_mine()));
  };

  const unprocessed = async () => {
    // Unprocessed transactions are stored and this will try to use them in case user quit in the middle of it
    for (let j = 0; j < 10; j++) {
      let re = await dispatch(unprocessed_tx());

      if (re === false) break;
    }
    load();
  };

  useEffect(() => {
    if (loaded && logged) {
      dispatch(claim()).catch((e) => {});

      // in case something went wrong, on refresh this will claim purchased nfts
      load();
      unprocessed();
    }
  }, [loaded, logged, dispatch]);

  if (!loaded) return null;

  return (
    <div className="App">
      <img src={bbn_logo} className="bbn-logo" alt="Bad Bot Ninja" />
      <h1 className="Title">Bad Bot Ninja</h1>
      <About />

      <User />
      <Timer>
        <PriceOptions
          refreshMine={() => {
            load();
          }}
        />
      </Timer>
      <ProgressBar />
      <br />
      <br />
      <br />
      <Collection nfts={r_nfts} mine={mine} />
      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
