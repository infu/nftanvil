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

function About() {
  return (
    <div className="about">
      <p>
        Heya, welcome to badbot.ninja metaverse apparel. This is a simple web3
        open-source dapp anyone can clone. It showcases the open-source Anvil
        protocol and NFTA standard in a simplified frontend aiming to be easily
        understood by developers.
      </p>

      <p>
        We made this collection so everyone can have inexpensive NFTs to play
        with. We are airdropping 4k and will leave 5k to sell here, while we
        keep the 1k that remains in the end.
      </p>

      <p>
        In the future, we are planning on experimenting with different smart
        contracts (transformation, enchanting, crafting) and these NFT items
        will be part of that. They will also be used in a character
        customization system part of Zraham city - our metaverse city - a
        long-term project. What you see here are 10k helmets and we will be
        adding more items for different slots (legs, chest, hands, etc.) in the
        following months.
      </p>

      <p>
        Badbot.ninja helmets were created by AI and originally intended to be
        icon-sized. Their graphics and texts are AI created, so some may be
        faulty, but worry not, you will be able to disintegrate them into raw
        materials - crystals, metals, etc. You will also be able to remix them
        and create one NFT with parts from 3 different ones. Ex: take graphics
        from one, texts from another, quality and attributes from a third one.
      </p>
      <p>
        This open-source smart contract holds all 10k NFTs and everyone gets
        provably random ones, even us.
      </p>
      <p>Secondary market will open a week after launch. Have fun!</p>
      <p>
        Useful links: <br />
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
      <Collection nfts={nfts} mine={mine} />
      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
