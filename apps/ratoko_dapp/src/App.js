import React, { useEffect, useState, useRef } from "react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { useAnvilDispatch, useAnvilSelector } from "./link_lib";

import { Inventory } from "./link_lib/components/Inventory";
import { InventoryLarge } from "./link_lib/components/InventoryLarge";

import powered from "./assets/powered.dark.svg";
import {
  MarketplaceLoad,
  MarketplaceFilters,
} from "./link_lib/components/Marketplace";

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
  Stack,
  ButtonGroup,
  Center,
  useColorMode,
  Wrap,
} from "@chakra-ui/react";
import ratoko_logo from "./assets/ratoko_logo.png";
import f_left from "./assets/f_left.png";
import f_right from "./assets/f_right.png";

import r_left from "./assets/r_left.png";
import r_right from "./assets/r_right.png";
import { Auth } from "./link_lib/components/Auth";
import "./App.css";

function About() {
  return (
    <div className="about">
      <p>Welcome to Ratoko digital breedable collectibles</p>
      <p>
        Why a rat?{" "}
        <a
          rel="noreferrer"
          href="https://www.youtube.com/watch?v=810aKcfM__Q"
          target="_blank"
        >
          Bubble Boy and the Sewer Rat
        </a>
      </p>

      <p>
        Andreas calls <b>Bitcoin a rat</b>, a survivor, and closed-source crypto
        projects - bubble boys.
      </p>
      <p>
        <a
          rel="noreferrer"
          target="_blank"
          href="https://twitter.com/AnvilRatoko"
        >
          Follow our twitter here @AnvilRatoko
        </a>
      </p>

      <p>
        <b>Features:</b>
        <br />
        - Independent
        <br />
        - Minted by the Blacksmith. Crafted by the Sculptor.
        <br /> - Open-source all the way
        <br /> - Graphics are on-chain generated SVGs. <br />- Breedable (later
        this year)
        <br /> - Marketplace (next week)
        <br /> - In the only NFT ecosystem which works towards true
        decentralization, not only of governance but of user traffic too.
        <br /> - Trade for Bitcoin (later this year)
        <br /> - It's made to survive for thousands of years. Anvil NFTs have
        extensive DoS protection on IC and a fully automated refueling system.
        <br />- Reverse-gas NFTs, free to use unless you abuse
        <br /> - NFT art can be used commercially by owners. See terms and
        conditions for more info.
        <br /> - Underpromise, Overdeliver.
      </p>
    </div>
  );
}

function App() {
  // const logged = useAnvilSelector((state) => state.user.address);
  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useAnvilDispatch();

  return (
    <div className="App">
      <img alt="" src={r_left} className="r-left" />
      <img alt="" src={r_right} className="r-right" />
      <img alt="" src={r_left} className="rb-left" />
      <img alt="" src={r_right} className="rb-right" />

      <img alt="" src={f_left} className="f-left" />
      <img alt="" src={f_right} className="f-right" />

      <img src={ratoko_logo} className="ratoko-logo" alt="Ratoko" />
      <h1 className="Title">Ratoko</h1>
      <div className="inner-page">
        <PageTabs />
        <Center mt={6}>
          <Auth />
        </Center>
        <Routes>
          <Route path="/" element={<PageAbout />} />

          {/* <Route path="/nfta:id/:code" element={<NFTPageWrapper />} />
          <Route path="/nfta:id" element={<NFTPageWrapper />} /> */}
          <Route path="/inventory" element={<PageInventory />} />
          <Route path="/marketplace" element={<PageMk />} />

          <Route path="about" element={<PageAbout />} />
          <Route path="terms" element={<Terms />} />
        </Routes>

        <ToastContainer theme="dark" />
      </div>
      <Footer />
    </div>
  );
}

function Terms() {
  return (
    <div className="termspage">
      <h3>TERMS &amp; CONDITIONS</h3>
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

function PageMk() {
  let navigate = useNavigate();

  // const { width, height } = useWindowSize();

  return (
    <>
      <MarketplaceLoad
        author={
          "bbd87200973033cb69bc0aee03e90df1a1de01e28aa0246bb175baabfd071754" //"a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda" //, // "" // ""
        }
      >
        {(items) => (
          <MarketplaceFilters
            items={items}
            attributes={[
              ["attack", "with attack"],
              ["airdrops", "width airdrops"],
            ]}
            tags={[
              ["Ship 13", "Space 23"],
              ["Thistle Fusion", "Terraform Haze"],
            ]}
          >
            {({
              goPageBack,
              goPageNext,
              stats,
              fOrder,
              fQuality,
              fTags,
              slice,
            }) => {
              return (
                <Box>
                  <Stack m="auto" maxW={"600px"}>
                    <Box>
                      {goPageBack}
                      {goPageNext}
                    </Box>
                    {fOrder}
                    {fTags}
                    {stats ? <div>Floor: {stats.floor}</div> : null}
                    {stats ? <div>Mean: {stats.mean}</div> : null}
                  </Stack>
                  <InventoryLarge
                    items={slice.map((x) => tokenToText(x[0]))}
                    custom={(meta) => {
                      return (
                        <div style={{ paddingTop: "30px" }}>{meta.tags[0]}</div>
                      );
                    }}
                    onOpenNft={(id) => {
                      navigate("/" + id); //, { replace: true }
                    }}
                  />
                </Box>
              );
            }}
          </MarketplaceFilters>
        )}
      </MarketplaceLoad>
    </>
  );
}

function PageInventory() {
  let navigate = useNavigate();

  const accounts = useAnvilSelector((state) => state.user.accounts);
  return (
    <>
      <Center>
        <Stack direction="horizontal">
          {Object.keys(accounts).map((address) => (
            <Inventory
              key={address}
              cols={5}
              rows={8}
              address={address}
              onOpenNft={(id) => {
                navigate("/" + id); //, { replace: true }
              }}
            />
          ))}
        </Stack>
      </Center>
      <Center>
        <Inventory cols={2} rows={5} address={"tmp1"} pagination={false} />
        <Inventory cols={2} rows={5} address={"tmp2"} pagination={false} />
        <Inventory
          cols={5}
          rows={8}
          onOpenNft={(id) => {
            navigate("/" + id); //, { replace: true }
          }}
          address={
            "a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a"
          }
        />
      </Center>
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
      | Made by the Blacksmith &amp; the Sculptor.
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
          <NavLink to="/mint">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="orange">
                Mint
              </Button>
            )}
          </NavLink>
          <NavLink to="/marketplace">
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
