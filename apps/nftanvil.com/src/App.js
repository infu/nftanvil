import React from "react";

import { useAnvilSelector, Auth } from "./nftanvil-react/";

import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { Box, Button, Center, Wrap } from "@chakra-ui/react";

import { History, HistoryRedirect, HistoryTx } from "./History";
import { InventoryPage } from "./inventory/Inventory";
import { InventorySingle } from "./inventory/InventorySingle";
import { InventoryDouble } from "./inventory/InventoryDouble";

import { NFTPage } from "./NFTPage";
// import { PageMarketplace } from "./pages/marketplace";
import { MintSingleNft } from "./mint/MintSingleNft";
import { Mint } from "./mint/Mint";

import { Marketplace } from "./marketplace/Marketplace";
import { MarketplacePage } from "./marketplace/MarketplacePage";

function App() {
  const authenticated = useAnvilSelector((state) => state.user.authenticated);
  const loaded = useAnvilSelector((state) => state.ic.anvil.space);
  const navigate = useNavigate();
  if (!loaded) return null;

  return (
    <Box>
      <Header mt={5} mb={20} />

      {authenticated ? (
        <Routes>
          <Route path="/mint" element={<Mint />}>
            <Route index element={<MintSingleNft />} />
            <Route path="nft" element={<MintSingleNft />} />
          </Route>

          <Route path="/inventory" element={<InventoryPage />}>
            <Route index element={<InventorySingle />} />
            <Route path="single" element={<InventorySingle />} />
            <Route path="double" element={<InventoryDouble />} />
          </Route>
          <Route path="/history" exact element={<HistoryRedirect />} />
          <Route path="/tx:tx" element={<HistoryTx />} />
          <Route path="/history/:canister/:from/:to" element={<History />} />
          <Route path="/marketplace" element={<MarketplacePage />}>
            <Route path=":author" element={<Marketplace />} />
          </Route>
          {/* <Route path="/marketplace" element={<PageMarketplace />} /> */}

          <Route path="/nfta:id/:code" element={<NFTPage />} />
          <Route path="/nfta:id" element={<NFTPage />} />
        </Routes>
      ) : null}
    </Box>
  );
}

function Header(p) {
  return (
    <Center>
      <Box {...p}>
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
                Inventory
              </Button>
            )}
          </NavLink>
          <NavLink to="/history">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                History
              </Button>
            )}
          </NavLink>
          <Auth />
        </Wrap>
      </Box>
    </Center>
  );
}

export default App;
