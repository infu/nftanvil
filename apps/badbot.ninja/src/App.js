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

function About() {
  return (
    <div className="about">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
        sagittis egestas orci ut accumsan. Aliquam facilisis libero in lacus
        elementum maximus. Nulla facilisi. Ut tristique, elit non hendrerit
        venenatis, orci turpis volutpat nunc, ac laoreet nulla metus mollis
        ligula. Vestibulum pulvinar enim sit amet ex dignissim convallis. Ut
        tincidunt sapien felis, eu auctor mauris tempus ac. In magna purus,
        varius id iaculis ut, vehicula nec dui. Aenean vehicula varius accumsan.
        Donec interdum, orci a accumsan egestas, mauris velit pharetra felis,
        vel rutrum ligula dui non mauris. Ut a ornare dolor. Duis cursus
        pellentesque convallis. Quisque sit amet justo non elit fermentum
        hendrerit quis sit amet dui. Vivamus ac odio at metus ullamcorper
        finibus. Quisque efficitur, ante sit amet finibus dapibus, sapien erat
        imperdiet augue, ac varius leo sem et enim. Nam fringilla nisl id purus
        aliquam, quis mollis ligula viverra. Donec a arcu laoreet, venenatis
        velit vitae, hendrerit dui.
      </p>

      <p>
        Vivamus libero nisi, venenatis id lobortis quis, aliquam quis ipsum.
        Vestibulum ultrices luctus diam, nec varius lorem ultricies sed. Donec
        sollicitudin et sapien in gravida. Curabitur et finibus odio. Vivamus
        accumsan luctus tortor id pharetra. Maecenas ornare dui libero, non
        sagittis arcu sodales sit amet. Nulla nec dui quis metus fermentum
        dapibus.
      </p>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non lorem
        a elit sodales consequat. Donec id urna ut justo feugiat pulvinar.
        Maecenas vehicula odio ut accumsan lacinia. Quisque sit amet fermentum
        neque. Nunc nec congue odio. Vestibulum efficitur, urna quis iaculis
        varius, velit nisi ullamcorper tellus, vitae semper urna sapien id ante.
        Etiam bibendum ultrices porta. Curabitur condimentum nibh vel laoreet
        vestibulum. Nunc finibus quis nisl in condimentum. Etiam lectus ipsum,
        facilisis ac rutrum in, volutpat rhoncus tortor. Proin eget sollicitudin
        nisl. Mauris sodales, neque posuere sagittis rutrum, risus tellus congue
        nulla, nec pulvinar nulla nisi nec tellus.
      </p>

      <p>
        Maecenas interdum neque ut sem ultricies sollicitudin. Nunc nisi turpis,
        rhoncus eget nisi id, egestas vehicula metus. Praesent id lectus urna.
        Aliquam viverra cursus sem dictum facilisis. Pellentesque pellentesque
        pretium vestibulum. Duis eget placerat ex. Mauris aliquet euismod
        aliquet. Proin feugiat consectetur sapien, eget ultricies velit
        facilisis vel. Proin velit arcu, sagittis eget augue pretium, tincidunt
        scelerisque lectus. Aliquam venenatis justo quis velit feugiat
        dignissim. Nulla odio sapien, convallis eu lectus eget, imperdiet
        maximus urna. Proin semper ex eget diam mattis tristique. Donec posuere
        aliquet suscipit.
      </p>
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
      {/* <About /> */}
      <User />
      <PriceOptions
        refreshMine={() => {
          load();
        }}
      />
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
