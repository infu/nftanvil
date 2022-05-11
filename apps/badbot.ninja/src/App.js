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
  TestAnvilComponent,
} from "@vvv-interactive/nftanvil-react";
import { Inventory } from "@vvv-interactive/nftanvil-react/cjs/components/Inventory";

import { User } from "./components/User";
import { Collection } from "./components/Collection";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Principal } from "@dfinity/principal";

import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";
import {
  claim as claimUsewin,
  unprocessed_tx as unprocessed_txUsewin,
} from "./actions/usewin";
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
import { UseWinGame } from "./components/Usewin.js";
import { ToastContainer } from "react-toastify";
import { Link, NavLink, BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  useColorMode,
} from "@chakra-ui/react";
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
      <p>Welcome to badbot.ninja!</p>
      <p>
        Badbot Ninja is an open-source web3 dapp on the Internet Computer
        demonstrating how easy it is for developers to build their own NFT use
        cases with the Anvil protocol.
      </p>
      <p>
        Badbot Ninja metaverse apparel is our first showcase project, an NFT
        series with collectibility and accessibility in mind. We are starting
        with a 10k collection of helmets and will expand to include wearable
        NFTs for other character slots like chest, legs, hands, etc. In the
        future, we will be working on adding the functionality for crafting and
        enchanting items, along with avatar customization, to be applied in our
        metaverse space, Zraham City. We will be developing our own
        blockchain-based game engine so that Zraham City and its impeccably
        attired citizens can congregate and explore a dynamic digital arena.
      </p>
      <p>
        What you see here is a collection of 10k AI-generated helmet NFTs—each
        one is unique with its own name, description, and attributes, some are
        rarer than others. 5k of our inaugural set is available for purchase, 4k
        are allocated for airdrops, and 1k out of the NFT collection is left for
        the developer team. Every asset here is set up securely with smart
        contracts running on the ICP blockchain, meaning everyone has a fair
        chance of receiving truly randomized NFTs, even us!
      </p>
      <p>
        Because AIs are mysterious and no one knows exactly how they think, some
        NFTs might be strange. However, don’t worry if the AI selects a strange
        helmet for you! In the future, we will add the ability to disenchant
        your NFT into raw materials such as crystals, metals, and other supplies
        that you can use to craft new items in Zraham City.
      </p>
      <p>Try out our Dapp and have fun!</p>
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
      <br />
      <br />
      <div className="update">
        <b>Update:</b> Sold out for 19 hours and price per NFT was ~0.3ICP.
        Marketplace is now available.
      </div>
      <div className="update">
        <p>
          <b>Update:</b> Additional information about items and their utility
        </p>
        <p>
          <b>Qualities:</b> Artifacts - 44 | Legendary - 199 | Epic - 412 | Rare
          - 1334 | Uncommon - 2015 | Common - 5996
        </p>

        <p>
          <b>Attributes:</b>
        </p>
        <p>
          +luck | Benefits playing games of chance. Also affects the combat
          system.
        </p>
        <p>+attack | Increases your damage.</p>
        <p>+defence | Reduces damage taken.</p>
        <p>
          +airdrops | Increases your chance to get drops from events and looting
        </p>
        <p>
          +harvest | Benefits gathering of resources from mining, disenchanting
          and similar.
        </p>
        <br />
        <p>
          The higher the quality, the better materials it will disenchant to.
          The materials will be fungible tokens and will be used to craft
          special items with a given blueprint.
        </p>
        <br />

        <p>
          Zraham city is a long term project which will combine all technologies
          we work on. Unity world + Internet Computer + Anvil protocol +
          Kontribute lore + Smart contract game engine. Based on quality and
          provable randomness some items will get usable effects added to them.
          These effects (with cooldown) will interact with the world and with
          roleplayers.
        </p>
        <p>
          <a
            target="_blank"
            href="https://twitter.com/nftanvil/status/1521812925740105731/photo/1"
          >
            Next Badbot Ninja collection
          </a>{" "}
          is coming early June{" "}
        </p>
        <p>
          Badbot.ninja will keep on releasing new item collections with the same
          airdrop/sale ratio to increase brand awareness. Next Wednesday 11 May
          - To demonstrate how "crypto nft use on cooldown" works, we will mint
          limited artwork - 50 Blacksmith posters, place them inside a smart
          contract and allow item holders to attempt to win them. Airdrop & luck
          attributes will be used along with randomness.
        </p>

        <p>
          Badbot.ninja proceeds are gathered in a pool which will support
          Zraham's builders.
        </p>
      </div>
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
  const { colorMode, toggleColorMode } = useColorMode();

  const [count, setCount] = useState(0);
  const [prices, setPrices] = useState(false);

  const dispatch = useAnvilDispatch();
  const [mine, setMine] = React.useState([]);

  const load = async () => {
    setMine(await dispatch(get_mine()));
  };
  const getPrices = async () => {
    let x = await fetch(
      "https://nftpkg.com/api/v1/prices/a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda"
    ).then((x) => x.json());
    let r = {};
    for (let a of x) {
      r[a[0]] = [a[1], a[2]]; // + Math.floor(Math.random() * 1000000)
    }
    setPrices(r);
  };

  useEffect(() => {
    getPrices();
    const interval = setInterval(() => {
      load();
      getPrices(count + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [count, dispatch]);

  const unprocessed = async () => {
    // Unprocessed transactions are stored and this will try to use them in case user quit in the middle of it
    for (let j = 0; j < 10; j++) {
      let re = await dispatch(unprocessed_tx());

      if (re === false) break;
    }
    load();
  };

  const unprocessedUsewin = async () => {
    // Unprocessed transactions are stored and this will try to use them in case user quit in the middle of it
    for (let j = 0; j < 10; j++) {
      let re = await dispatch(unprocessed_txUsewin());

      if (re === false) break;
    }
    load();
  };

  useEffect(() => {
    if (colorMode === "light") toggleColorMode();
    if (loaded && logged) {
      dispatch(claim()).catch((e) => {});
      dispatch(claimUsewin()).catch((e) => {});

      // in case something went wrong, on refresh this will claim purchased nfts
      load();
      unprocessed();
      unprocessedUsewin();
    }
  }, [loaded, logged, dispatch]);

  if (!loaded) return null;
  if (!prices) return null;
  return (
    <div className="App">
      <img src={bbn_logo} className="bbn-logo" alt="Bad Bot Ninja" />
      <h1 className="Title">Bad Bot Ninja</h1>
      <PageTabs />
      <User />

      <Routes>
        <Route
          path="/"
          element={<PageMarketplace mine={mine} prices={prices} load={load} />}
        />
        <Route path="/inventory" element={<PageInventory />} />
        <Route path="about" element={<PageAbout />} />
        <Route path="boss" element={<PageBoss />} />
      </Routes>

      <ToastContainer theme="dark" />
    </div>
  );
}

function PageAbout() {
  return <About />;
}

function PageBoss() {
  return (
    <UseWinGame
      nfts={nfts}
      refreshMine={() => {
        //load();
      }}
    />
  );
}
function PageInventory() {
  const address = useAnvilSelector((state) => state.user.address);

  return (
    <>
      <Inventory address={address} />
    </>
  );
}
function PageMarketplace({ load, mine, prices }) {
  return (
    <>
      <Timer>
        <PriceOptions
          refreshMine={() => {
            load();
          }}
        />
      </Timer>
      {/* <ProgressBar /> */}
      {/* <br />
      <br />
      <br /> */}
      <Collection nfts={r_nfts} mine={mine} prices={prices} />
    </>
  );
}
function PageTabs(p) {
  return (
    <Center>
      <Box {...p}>
        <ButtonGroup variant="outline" spacing="3">
          <NavLink to="/">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                Marketplace
              </Button>
            )}
          </NavLink>
          <NavLink to="/inventory">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                Inventory
              </Button>
            )}
          </NavLink>
          <NavLink to="/boss">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                Boss
              </Button>
            )}
          </NavLink>
          <NavLink to="/about">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                About
              </Button>
            )}
          </NavLink>
        </ButtonGroup>
      </Box>
    </Center>
  );
}

export default App;
