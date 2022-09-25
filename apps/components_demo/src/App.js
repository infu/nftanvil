import React from "react";

import { useAnvilSelector } from "@vvv-interactive/nftanvil-react";

import { NavLink, Routes, Route } from "react-router-dom";
import { Box, Button, Center, Wrap } from "@chakra-ui/react";

import { Auth } from "@vvv-interactive/nftanvil-react";
import { PageWelcome } from "./pages/welcome";
import { PageInventory1 } from "./pages/inventory1";
import { PageInventory2 } from "./pages/inventory2";
import { PageInventory3 } from "./pages/inventory3";

// import { PageMarketplace } from "./pages/marketplace";
import { PageDemoflow } from "./pages/demoflow";

function App() {
  const authenticated = useAnvilSelector((state) => state.user.authenticated);

  return (
    <Box>
      <Header mt={5} mb={20} />
      {authenticated ? (
        <Routes>
          <Route path="/" element={<PageWelcome />} />

          <Route path="/inventory1" element={<PageInventory1 />} />
          <Route path="/inventory2" element={<PageInventory2 />} />
          <Route path="/inventory3" element={<PageInventory3 />} />

          {/* <Route path="/marketplace" element={<PageMarketplace />} /> */}
          <Route path="/demoflow" element={<PageDemoflow />} />
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
          <NavLink to="/">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                Welcome
              </Button>
            )}
          </NavLink>
          {/* <NavLink to="/marketplace">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                Marketplace
              </Button>
            )}
          </NavLink> */}
          <NavLink to="/inventory1">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                1
              </Button>
            )}
          </NavLink>
          <NavLink to="/inventory2">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                2
              </Button>
            )}
          </NavLink>
          {/* <NavLink to="/inventory3">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                3
              </Button>
            )}
          </NavLink> */}
          <NavLink to="/demoflow">
            {({ isActive }) => (
              <Button isActive={isActive} variant="solid" colorScheme="gray">
                flow 1
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
