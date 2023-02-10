import React, { useState, useEffect } from "react";

import {
  useAnvilSelector,
  useAnvilDispatch,
  Auth,
  Logout,
  AuthII,
  LogoutII,
  user_login,
  dialog_open,
  user_set_main_account,
  AccountIcon,
  user_logout,
} from "./nftanvil-react/";

import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Wrap,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  IconButton,
} from "@chakra-ui/react";
import {
  AddIcon,
  HamburgerIcon,
  RepeatIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import { useWindowSize } from "react-use";

import { History, HistoryRedirect, HistoryTx } from "./History";
import { InventoryPage, OfferPage } from "./inventory/InventoryPage";

import { NFTPage } from "./NFTPage";
import { SwapPage } from "./SwapPage";

// import { PageMarketplace } from "./pages/marketplace";
import { MintSingleNft } from "./mint/MintSingleNft";
import { MintFt } from "./mint/MintFt";
import { MintPool } from "./mint/MintPool";

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

  const { width, height } = useWindowSize();
  const mob = width < 900;

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
      {mob ? <HeaderMobile /> : <Header />}
      {/* <Breadcrumbs collections={collections} /> */}

      <Routes>
        <Route path="/mint" element={<Mint />}>
          <Route index element={<MintSingleNft />} />
          <Route path="nft" element={<MintSingleNft />} />
          <Route path="ft" element={<MintFt />} />
          <Route path="pool" element={<MintPool />} />
        </Route>

        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/offer/:code" element={<OfferPage />} />

        <Route path="/pools" element={<SwapPage />} />

        <Route path="/history" exact element={<HistoryRedirect />} />
        <Route path="/tx:tx" element={<HistoryTx />} />
        <Route path="/history/:canister/:from/:to" element={<History />} />
        <Route path="/collections" element={<MarketplaceRoute />}>
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
        <Route path="/nfta:id/:code" element={<NFTPage />} />
        <Route path="/nfta:id" element={<NFTPage />} />
        <Route path="/:url_address" element={<InventoryPage />} />

        <Route exact path="/" element={<Home />} />
      </Routes>
    </Box>
  );
}

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/collections");
  }, []);
}

function HeaderMobile() {
  const dispatch = useAnvilDispatch();
  const main_account = useAnvilSelector((s) => s.user.main_account);
  const beta = window.localStorage.getItem("beta") || false;
  const auth = () => {
    dispatch(
      dialog_open({
        name: "select_account",
      })
    ).then((address) => {
      dispatch(user_set_main_account(address));
    });
  };

  const logout = () => {
    dispatch(user_logout());
  };

  return (
    <Flex mt={5} mb={"50px"} pl="4" pr="4">
      <Logo />
      <Spacer />

      <Box>
        {main_account ? (
          <Box sx={{ position: "relative", top: "-16px" }}>
            <AccountIcon address={main_account} onClick={auth} />
          </Box>
        ) : null}
      </Box>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <NavLink to="/collections">
            {({ isActive }) => <MenuItem>Collections</MenuItem>}
          </NavLink>
          <NavLink to="/mint">
            {({ isActive }) => <MenuItem icon={<AddIcon />}>Mint</MenuItem>}
          </NavLink>
          <NavLink to="/pools">
            {({ isActive }) => <MenuItem icon={<RepeatIcon />}>Pools</MenuItem>}
          </NavLink>
          <NavLink to="/inventory">
            {({ isActive }) => <MenuItem>Wallet</MenuItem>}
          </NavLink>
          <NavLink to="/history">
            {({ isActive }) => (
              <MenuItem icon={<CalendarIcon />}>Activity</MenuItem>
            )}
          </NavLink>

          {!main_account ? (
            <MenuItem onClick={auth}>Login</MenuItem>
          ) : (
            <MenuItem onClick={logout}>Logout</MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
}
function Header(p) {
  const dispatch = useAnvilDispatch();
  const main_account = useAnvilSelector((s) => s.user.main_account);
  const beta = window.localStorage.getItem("beta") || false;

  const auth = () => {
    dispatch(
      dialog_open({
        name: "select_account",
      })
    ).then((address) => {
      dispatch(user_set_main_account(address));
    });
  };
  return (
    <Flex mt={5} mb={"50px"} pl="4" pr="4">
      <Logo />
      <Spacer />
      <Wrap spacing="1px" justify="center" overflow="visible">
        <NavLink to="/collections">
          {({ isActive }) => (
            <Button
              _active={{
                bg: "#7d2141",
              }}
              borderRadius="5px 0px 0px 5px"
              isActive={isActive}
              variant="solid"
              colorScheme="gray"
            >
              Collections
            </Button>
          )}
        </NavLink>
        <NavLink to="/mint">
          {({ isActive }) => (
            <Button
              _active={{
                bg: "#7d2141",
              }}
              borderRadius="0px 0px 0px 0px"
              isActive={isActive}
              variant="solid"
              colorScheme="gray"
            >
              Mint
            </Button>
          )}
        </NavLink>
        {beta ? (
          <>
            <NavLink to="/pools">
              {({ isActive }) => (
                <Button
                  _active={{
                    bg: "#7d2141",
                  }}
                  borderRadius="0px 0px 0px 0px"
                  isActive={isActive}
                  variant="solid"
                  colorScheme="gray"
                >
                  Pools
                </Button>
              )}
            </NavLink>
          </>
        ) : (
          <></>
        )}

        <NavLink to="/inventory">
          {({ isActive }) => (
            <Button
              _active={{
                bg: "#7d2141",
              }}
              isActive={isActive}
              borderRadius="0px 0px 0px 0px"
              variant="solid"
              colorScheme="gray"
            >
              Wallet
            </Button>
          )}
        </NavLink>
        <NavLink to="/history">
          {({ isActive }) => (
            <Button
              _active={{
                bg: "#7d2141",
              }}
              borderRadius="0px 5px 5px 0px"
              isActive={isActive}
              variant="solid"
              colorScheme="gray"
            >
              Activity
            </Button>
          )}
        </NavLink>
      </Wrap>
      <Spacer />
      <Box w="120px" align="right">
        {main_account ? (
          <Box sx={{ position: "relative", top: "-16px" }}>
            <AccountIcon address={main_account} onClick={auth} />
          </Box>
        ) : (
          <Button variant="solid" colorScheme="gray" onClick={auth}>
            Login
          </Button>
        )}
      </Box>
    </Flex>
  );
}

export default App;
