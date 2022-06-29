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
import { unprocessed_ticket } from "./actions/ticket.js";
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
import { nft_enter_code } from "@vvv-interactive/nftanvil-react/cjs/reducers/nft";

import { Inventory } from "@vvv-interactive/nftanvil-react/cjs/components/Inventory";
import { UseButton } from "./components/Ticket.js";
import { User } from "./components/User";
import { Collection } from "./components/Collection";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Principal } from "@dfinity/principal";

import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";
import powered from "./assets/powered.dark.svg";

import {
  NFTPage,
  NFTClaim,
} from "@vvv-interactive/nftanvil-react/cjs/components/NFT";

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
import {
  Link,
  NavLink,
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  useColorMode,
  Wrap,
} from "@chakra-ui/react";
import logo from "./logo.svg";
import ratoko_logo from "./assets/ratoko_logo.png";
import f_left from "./assets/f_left.png";
import f_right from "./assets/f_right.png";

import r_left from "./assets/r_left.png";
import r_right from "./assets/r_right.png";

import nfts from "./nfts.json";
import "./App.css";

const START = Date.now() / 1000; //1656518400; //1656507600; //Date.now() / 1000 + 30;

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
        Welcome to Ratoko digital breedable collectibles &amp; powered by Anvil!
      </p>
      <p>
        This collection plans to be traded for Bitcoin with IC's novel
        bridgeless tech. It was inspired by this talk{" "}
        <a href="https://www.youtube.com/watch?v=810aKcfM__Q" target="_blank">
          Bubble Boy and the Sewer Rat
        </a>{" "}
        made by our favorite Bitcoin advocate - Andreas Antonopoulos (not
        affiliated).
      </p>
      <blockquote>
        Security is a process of openness and exposure. Its a process of
        continuously adapting to new attacks and in that process dynamically
        becoming more and more robust ~ AA
      </blockquote>
      <p>
        Andreas calls <b>Bitcoin a rat</b>, a survivor, and closed-source crypto
        projects - bubble boys.
      </p>

      <p>
        We stand for open-source projects from day one.{" "}
        <a href="https://github.com/infu/nftanvil" target="_blank">
          Anvil
        </a>{" "}
        is one of the biggest Motoko{" "}
        <i>(Internet Computer's own programming language)</i> open-source
        projects to date, only rivaled by{" "}
        <a target="_blank" href="https://github.com/sagacards/legends-nft">
          Saga Legends
        </a>{" "}
        and{" "}
        <a href="https://github.com/aviate-labs" target="_blank">
          Aviate Labs
        </a>
      </p>
      <p>
        This dapp will list, promote and reward all open-source Motoko projects.
        If you have one, post it on{" "}
        <a href="https://discord.gg/UUYyQZujed" target="_blank">
          our Discord server
        </a>{" "}
        #open-source-motoko
      </p>

      <p>
        <b>Features:</b>
        <br />
        - 10k (1st gen) NFTs (500 team, 500 reserve, 6k public mint, 2.5k
        airdrop, 500 won via BadBot.Ninja boss fight) <br /> - Open-source all
        the way
        <br /> - Graphics are on-chain generated SVGs. <br />- Breedable (later
        this year)
        <br />- Marketplace (next week)
        <br /> - In the only NFT ecosystem which works towards true
        decentralization, not only of governance but of user traffic too.
        <br /> - Trade for Bitcoin (later this year)
        <br />- It's made to survive for thousands of years. Anvil NFTs have
        extensive DoS protection on IC and a fully automated refueling system.
        <br /> - NFTs can be used commercially by owners. See terms and
        conditions for more info.
        <br /> - Underpromise, Overdeliver.
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
      <div className="countdown">{time}</div>
      <div className={open ? "ito-open" : "ito-waiting"}>
        {children}
        {open ? <ProgressBar /> : null}
      </div>
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
    if (logged) setMine(await dispatch(get_mine()));
  };

  const getPrices = async () => {
    let x = await fetch(
      "https://nftpkg.com/api/v1/prices/bbd87200973033cb69bc0aee03e90df1a1de01e28aa0246bb175baabfd071754"
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
  const unprocessed_x_ticket = async () => {
    // Unprocessed transactions are stored and this will try to use them in case user quit in the middle of it
    for (let j = 0; j < 10; j++) {
      let re = await dispatch(unprocessed_ticket());

      if (re === false) break;
    }
    load();
  };

  useEffect(() => {
    if (colorMode === "light") toggleColorMode();
    if (loaded && logged) {
      dispatch(claim()).catch((e) => {});

      // in case something went wrong, on refresh this will claim purchased nfts
      load();
      unprocessed();
      unprocessed_x_ticket();
    }
  }, [loaded, logged, dispatch]);

  if (!loaded) return null;
  if (!prices) return null;
  return (
    <div className="App">
      <img src={r_left} className="r-left" />
      <img src={r_right} className="r-right" />
      <img src={r_left} className="rb-left" />
      <img src={r_right} className="rb-right" />

      <img src={f_left} className="f-left" />
      <img src={f_right} className="f-right" />

      <img src={ratoko_logo} className="ratoko-logo" alt="Ratoko" />
      <h1 className="Title">Ratoko</h1>
      <div className="inner-page">
        <PageTabs />
        <User />

        <Routes>
          <Route
            path="/"
            element={
              <PageMarketplace mine={mine} prices={prices} load={load} />
            }
          />
          <Route path="/nfta:id/:code" element={<NFTPageWrapper />} />
          <Route path="/nfta:id" element={<NFTPageWrapper />} />
          <Route path="/inventory" element={<PageInventory />} />
          <Route path="about" element={<PageAbout />} />
          <Route path="terms" element={<Terms />} />
          <Route path="/:code" element={<NFTClaimWrapper />} />
        </Routes>

        <ToastContainer theme="dark" />
      </div>
      <Footer />
    </div>
  );
}

function NFTPageWrapper() {
  let { id, code } = useParams();
  return (
    <NFTPage
      id={"nfta" + id}
      code={code}
      renderButtons={({ id, meta }) => {
        let duration = START - Math.round(Date.now() / 1000);
        if (duration >= 0) return null;
        if (
          meta.author !==
          "a00ead92e83a4c1555453ada429a4851cc4f12d5a126a2d58fd93241b176d602"
        )
          return null;
        return <UseButton id={id} meta={meta} />;
      }}
    />
  );
}

function NFTClaimWrapper() {
  let { code } = useParams();

  let navigate = useNavigate();
  const dispatch = useAnvilDispatch();
  const go = async () => {
    const url = await dispatch(nft_enter_code(code));
    navigate(url);
  };
  useEffect(() => {
    go();
  }, [code, dispatch]);

  return null;
}

function Terms() {
  return (
    <div className="termspage">
      <h3>TERMS & CONDITIONS</h3>
      <p>
        Ratoko is a collection of digital artworks (NFTs) running on the
        Internet Computer. This website is only an interface allowing
        participants to exchange digital collectibles. Users are entirely
        responsible for the safety and management of their own private Anvil
        wallets and validating contracts. Furthermore, as the Ratoko smart
        contract runs on the Internet Computer, there is no ability to undo,
        reverse, or restore any transactions.
      </p>

      <p>
        This website and its connected services are provided “as is” and “as
        available” without warranty of any kind. By using this website you are
        accepting sole responsibility for any and all transactions involving
        Ratoko digital collectibles.
      </p>

      <h3>OWNERSHIP</h3>
      <p>
        i. You Own the NFT. Each Ratoko is an NFT on the Anvil blockchain. When
        you purchase an NFT, you own the underlying Ratoko, the Art, completely.
        Ownership of the NFT is mediated entirely by the Smart Contract and the
        Internet Computer: at no point may we seize, freeze, or otherwise modify
        the ownership of any Ratoko.
      </p>
      <p>
        ii. Personal Use. Subject to your continued compliance with these Terms,
        author grants you a worldwide, royalty-free license to use, copy, and
        display the purchased Art, along with any extensions that you choose to
        create or use, solely forthe following purposes: (i) for your own
        personal, non-commercial use; (ii) as part of a marketplace that permits
        the purchase and sale of your Ratoko / NFT, provided that the
        marketplace cryptographically verifies each Ratoko owner’s rights to
        display the Art for their Ratoko to ensure that only the actual owner
        can display the Art; or (iii) as part of a third party website or
        application that permits the inclusion, involvement, or participation of
        your Ratoko, provided that the website/application cryptographically
        verifies each Ratoko owner’s rights to display the Art for their Ratoko
        to ensure that only the actual owner can display the Art, and provided
        that the Art is no longer visible once the owner ofthe Ratoko leaves the
        website/application.
      </p>
      <p>
        iii. Commercial Use. Subject to your continued compliance with these
        Terms, author grants you an unlimited, worldwide license to use, copy,
        and display the purchased Art for the purpose of creating derivative
        works based upon the Art (“Commercial Use”). Examples of such Commercial
        Use would e.g. be the use of the Art to produce and sell merchandise
        products (T-Shirts etc.) displaying copies of the Art. For the sake of
        clarity, nothing in this Section will be deemed to restrict you from (i)
        owning or operating a marketplace that permits the use and sale of
        Ratokos generally, provided that the marketplace cryptographically
        verifies each Ratoko owner’s rights to display the Art for their Ratoko
        to ensure that only the actual owner can display the Art; (ii) owning or
        operating a third party website or application that permits the
        inclusion, involvement, or participation of Ratokos generally, provided
        that the third party website or application cryptographically verifies
        each Ratoko owner’s rights to display the Art for their Ratoko to ensure
        that only the actual owner can display the Art, and provided that the
        Art is no longer visible once the owner of the Purchased Ratoko leaves
        the website/application; or (iii) earning revenue from any of the
        foregoing.
      </p>
    </div>
  );
}

function PageAbout() {
  return <About />;
}

function PageInventory() {
  let navigate = useNavigate();

  const address = useAnvilSelector((state) => state.user.address);

  return (
    <>
      <Inventory
        address={address}
        onOpenNft={(id) => {
          navigate("/" + id); //, { replace: true }
        }}
      />
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
      <br />
      <br />
      <br />
      <Collection nfts={r_nfts} mine={mine} prices={prices} />
    </>
  );
}
function Footer() {
  return (
    <div className="footer">
      <NavLink to="/terms">Terms &amp; Conditions</NavLink> |{" "}
      <a target="_blank" href="https://github.com/infu/nftanvil">
        Fully open-source
      </a>{" "}
      | Made by VVV DAO
      <a target="_blank" href="https://docs.nftanvil.com">
        <img
          src={powered}
          style={{
            display: "block",
            margin: "auto",
            width: "300px",
            marginTop: "30px",
          }}
        />
      </a>
    </div>
  );
}

function PageTabs(p) {
  return (
    <Center>
      <Box {...p}>
        <Wrap spacing="3" justify="center">
          <NavLink to="/">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                Mint
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

          <NavLink to="/about">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                About
              </Button>
            )}
          </NavLink>
        </Wrap>
      </Box>
    </Center>
  );
}

export default App;
