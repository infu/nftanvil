import React, { useState, useEffect } from "react";

import {
  useAnvilSelector,
  Auth,
  Logout,
  AuthII,
  LogoutII,
} from "./nftanvil-react/";

import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { Box, Button, Center, Wrap, Flex, Spacer } from "@chakra-ui/react";

import { History, HistoryRedirect, HistoryTx } from "./History";
import { InventoryPage } from "./inventory/InventoryPage";

import { NFTPage } from "./NFTPage";
// import { PageMarketplace } from "./pages/marketplace";
import { MintSingleNft } from "./mint/MintSingleNft";
import { MintFt } from "./mint/MintFt";

import { Mint } from "./mint/Mint";
import { Marketplace } from "./marketplace/Marketplace";
import {
  MarketplaceIndex,
  MarketplaceRoute,
} from "./marketplace/MarketplacePage";
import { Breadcrumbs } from "./Breadcrumbs";
import { Logo } from "./Logo";
import "./App.css";
function App() {
  const authenticated = useAnvilSelector((state) => state.user.authenticated);
  const loaded = useAnvilSelector((state) => state.ic.anvil.space);
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetch("https://nftpkg.com/api/v1/collections")
      .then((x) => x.json())
      .then((co) => {
        setCollections(co);
      });
  }, []);

  if (!loaded) return null;

  return (
    <Box>
      <Header />
      <Breadcrumbs collections={collections} />

      <Routes>
        <Route path="/mint" element={<Mint />}>
          <Route index element={<MintSingleNft />} />
          <Route path="nft" element={<MintSingleNft />} />
          <Route path="ft" element={<MintFt />} />
        </Route>

        <Route path="/inventory" element={<InventoryPage />} />

        <Route path="/history" exact element={<HistoryRedirect />} />
        <Route path="/tx:tx" element={<HistoryTx />} />
        <Route path="/history/:canister/:from/:to" element={<History />} />
        <Route path="/marketplace" element={<MarketplaceRoute />}>
          <Route
            index
            element={<MarketplaceIndex collections={collections} />}
          />
          <Route
            path=":author"
            element={<Marketplace collections={collections} />}
          />
          <Route path=":author/nfta:id" element={<NFTPage />} />
        </Route>
        {/* <Route path="/marketplace" element={<PageMarketplace />} /> */}

        <Route path="/nfta:id/:code" element={<NFTPage />} />
        <Route path="/nfta:id" element={<NFTPage />} />
      </Routes>
    </Box>
  );
}

function Header(p) {
  return (
    <Flex mt={5} mb={5} pl="4" pr="4">
      <Logo />
      <Spacer />
      <Wrap spacing="3" justify="center">
        <NavLink to="/marketplace">
          {({ isActive }) => (
            <Button isActive={isActive} variant="solid" colorScheme="gray">
              Marketplace
            </Button>
          )}
        </NavLink>
        <NavLink to="/mint">
          {({ isActive }) => (
            <Button isActive={isActive} variant="solid" colorScheme="gray">
              Mint
            </Button>
          )}
        </NavLink>
        <NavLink to="/inventory">
          {({ isActive }) => (
            <Button isActive={isActive} variant="solid" colorScheme="gray">
              Wallet
            </Button>
          )}
        </NavLink>
        <NavLink to="/history">
          {({ isActive }) => (
            <Button isActive={isActive} variant="solid" colorScheme="gray">
              Activity
            </Button>
          )}
        </NavLink>
      </Wrap>
    </Flex>
  );
}

export default App;
