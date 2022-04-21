import anvillogo from "./assets/anvillogo.svg";
import anvillogowhite from "./assets/anvillogowhite.svg";
import blueflame from "./assets/blueflame.svg";

import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { DashboardPage } from "./components/Dashboard";
import { Disclaimer } from "./components/Disclaimer";
import { Waiting } from "./components/Waiting";
import Cookies from "js-cookie";

import {
  login,
  proModeSet,
  logout,
  transfer_icp,
  pwr_buy,
  hw_auth,
  hw_test,
} from "./reducers/user";

import { use } from "./reducers/nft";

import {
  ButtonGroup,
  Button,
  Box,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  Flex,
  Spacer,
  Center,
  useColorModeValue,
  Tooltip,
  CloseButton,
  Switch,
} from "@chakra-ui/react";
import { useClipboard, useColorMode } from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  HamburgerIcon,
  ArrowBackIcon,
  ExternalLinkIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import { toast } from "react-toastify";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import Dfinity from "./assets/dfinity.svg";

import PoweredDark from "./assets/powered.dark.svg";
import PoweredLight from "./assets/powered.light.svg";

import { Switch as RouterSwitch, Route, Redirect } from "react-router";

import { Link } from "react-router-dom";

import { Nftstorage } from "./components/Nftstorage";

import { Mint } from "./components/Mint";
import { HistoryRedirect, History, HistoryTx } from "./components/History";

import { Inventory, InventoryLarge } from "./components/Inventory";
import { NFTPage, NFTClaim } from "./components/NFT";
import { useWindowSize } from "react-use";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import { useDisclosure, FormLabel, FormControl, Input } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { TX, ACC, NFTA, HASH, ICP, PWR, PRI, ANV } from "./components/Code";

const ICP_FEE = 10000n;

function PageTabs(p) {
  const address = useSelector((state) =>
    state.user.address ? state.user.address.toLowerCase() : null
  );
  const pro = useSelector((state) => state.user.pro);

  return (
    <Box {...p}>
      <ButtonGroup variant="outline" spacing="3">
        <Link disabled={!address} to={"/" + address}>
          <Button disabled={!address} variant="solid" colorScheme="gray">
            Inventory
          </Button>
        </Link>

        <Link to="/mint">
          <Button variant="solid" colorScheme="gray">
            Mint
          </Button>
        </Link>
      </ButtonGroup>
    </Box>
  );
}

function Warning({ title, children }) {
  return (
    <Alert status="error" mt={"20px"}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription display="block">{children}</AlertDescription>
      </Box>
    </Alert>
  );
}

function AlertTestNet() {
  const [alertVisible, setAlertVisible] = useState(true);
  if (!alertVisible) return null;
  return (
    <Center>
      <Alert status="error" mt={"20px"} w={"480px"}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Testnet! Warning!</AlertTitle>
          <AlertDescription display="block">
            All minted tokens will be periodically wiped out.
            <Text>
              Join{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://discord.gg/apPegYBhBC"
                style={{ color: "#77f" }}
              >
                <img
                  alt=""
                  style={{ display: "inline", width: "20px", height: "20px" }}
                  src="data:image/png;base64,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"
                />{" "}
                discord{" "}
              </a>{" "}
              &amp; follow
              <a
                rel="noreferrer"
                target="_blank"
                href="https://twitter.com/nftanvil"
                style={{ color: "#37f" }}
              >
                <img
                  alt=""
                  style={{ display: "inline", width: "20px", height: "20px" }}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAE20lEQVRoge3YW2yTdRgG8Odta8GBzh3KoIOd7BzxiGICISCi3GDigQQmEYMYgk4JckEGKGAaTTSiaAwCTsF5gSEuiiEGvSIalwWIohciCE4YbMDKtnbrTh3t9z5ebMWNfB/raRsXfe6+Nf+3v6f/r/2WP5BOOumkk04SkbF408LdVx5UkRVULiRlGkAniYtUHlEba3xr8g5BhGZrsz6+VBBY574QvbYsULa/290XyvA3vCihVMFLqvyZYeVuQJeREBIACBJg/wVIgsRREa5qfm3Kyeja7O3NswXGJqr86690rx+2wN1fdX1BSuYpZ0Y5ysVIFj9tR4ubDjks4PR+sCV+4FraCW4leS+IRSQLSPjtevWelg3FzTcs4PmB45z+nlaAEwF8OSl/wuqfF0gkUXxR9bnxRui2WoAPx4aH2WsRIZa0VeYfHDzbZvaG4/w99w/gQXJlc2P3gZlVzEi0QKR34tok8d0gl9t49VjWtguvZL3X9DpIsSxAgXvwYIBPdo0P1pXtDZbFrffSIYINSeABsJHA9jAclwFZB/btin7JTQuIoZ3/L44Okhm083hpdXsFvDRdZ5Z8V+s8ErlJ4EFiOsmpAJoiEXkqsOnOjuh8U0jYbjQMxV8bNIHEbk9Bx6/F1f55sRQQG+9LEj/wd/7uIGd1vjH1zOD5pgXO/JPZAEiD+SCA5ENiyC/FewK1hZ8FFqOGdqsCpM2VPB5nx4nzkdaNBZeun29+K3hFCe658ScHgJwr4IHCQNvloqq2qsJPrzxRsKs9a/AoobYmiQfJdl/l5G4zquVzwLOv7XZbxPEHiRJTvEUxgCRxhorTAjYaQB7IJYnjAYJ1wY0Fc82cDqsC9c/nBD3VHctBHgaQESMe7H/ClkFYpkR0QeL4/teCVk7TW6i0uuO5u6qDNYDhAvACSV+M+GR+Kq3wAHntf5/rY7EDbFFyKWBbGscnPzJ4EArWWxUw3QGbho8CCN8MeBIQ4nhcBU6vcnWS+t3NgCcZ7go7j8VVAADE4Fsk+sYYDwhq4XX3xF2g/qWcvwCuH1M8ACq+tTLesAAAnFudvZPK9QAiY4In+2yRyDcJFwCA8xU5H0Iwn2TdKOMBYH+X13MlqQKFVS1TDDXuEOhGAl4q/KOBJ6E2MbYP57N8Ekdjh71HaXytlIkkABkVPATY17XZc2I437A7cPbl7A6lvDNat80APkgxtgxni6kAAFzMzdkG8NBo4AFAicreLZ7GlBVAuRiRHn1Wge9HGg/yYGhr0ecxuWIuAMBXObm7eY3raSVXkWgYCTzJU71qrLA61DJLYidzNbS7mi7PgU3mULkMwIwU4M9D5dGQt7ghHkrMOzAk5WKEpe9PKksBPJAavP2xePFAAjvg/uBSbtiBCirWApiUAvwRux2LuzeX+OK1xFwg7yNfCYQLCH2clGdI3joUkhBeobqjl7ZN8BYnfP46tAApU3e2LIoAFSBzQbpITCajp3Sp+cIScgLUV0NvltQmCjcvMJD8T5pyIoZjM4DVKcVD6qn6dkiL98ErmizeskA0ee83T1Anl0CxkuR8AJIAPqDKHwnZG9pS+FM8P5FJFxiczHfPZ9lucc4W6iwRzlQin2Q2BDlUjCfZSSIA0KeUk4D+rWBtr6fot1Qcz6eTTjrppDMi+Q8fgF/hmeYFBwAAAABJRU5ErkJggg=="
                />{" "}
                twitter
              </a>
              . Airdrops soon!
            </Text>
          </AlertDescription>
        </Box>
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={() => {
            setAlertVisible(false);
          }}
        />
      </Alert>
    </Center>
  );
}

function ICPBOX({ mobile }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();
  const amountRef = React.useRef();

  const icp = useSelector((state) => state.user.icp);

  const transferOk = async () => {
    let to = initialRef.current.value;
    let amount = AccountIdentifier.icpToE8s(amountRef.current.value); // + ICP_FEE;

    onClose();

    await dispatch(transfer_icp({ to, amount }));
  };
  return (
    <>
      {mobile ? (
        <MenuItem onClick={onOpen}>
          <ICP>{icp}</ICP>
        </MenuItem>
      ) : (
        <Button onClick={onOpen} variant="solid">
          <ICP>{icp}</ICP>
        </Button>
      )}

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Send <ICP />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>To Address</FormLabel>
              <Input ref={initialRef} placeholder="50e3df3..." />
            </FormControl>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input ref={amountRef} placeholder="" type="number" />
              <Text mt="2" fontSize="13px">
                <ICP>{ICP_FEE * 1n}</ICP> in transfer fees paid to IC
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={transferOk}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ANVBOX({ mobile }) {
  const anv = useSelector((state) => state.user.anv);

  return (
    <>
      {mobile ? (
        <MenuItem>
          <ANV>{anv}</ANV>
        </MenuItem>
      ) : (
        <Tooltip hasArrow label="ANV governance tokens">
          <Button>
            <ANV>{anv}</ANV>
          </Button>
        </Tooltip>
      )}
    </>
  );
}

function LoginBox() {
  const address = useSelector((state) =>
    state.user.address ? state.user.address.toLowerCase() : null
  );
  const principal = useSelector((state) => state.user.principal);

  const pro = useSelector((state) => state.user.pro);

  const anonymous = useSelector((state) => state.user.anonymous);

  const { onCopy } = useClipboard(address);

  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useDispatch();
  return (
    <Box w={550} sx={{ textAlign: "right" }}>
      <ButtonGroup variant="outline" spacing="3">
        {anonymous ? (
          <>
            <Button
              variant="solid"
              rightIcon={
                <img
                  src={Dfinity}
                  style={{ width: "40px", height: "40px" }}
                  alt=""
                />
              }
              colorScheme="gray"
              onClick={() => dispatch(login())}
            >
              Authenticate
            </Button>
          </>
        ) : (
          <>
            <ICPBOX mobile={false} />
            {/* <ANVBOX mobile={false} /> */}

            <Popover trigger={"hover"}>
              <PopoverTrigger>
                <Button
                  colorScheme="gray"
                  variant="solid"
                  onClick={() => {
                    toast.info("Copied to clipboard", {
                      position: "bottom-right",
                    });
                    onCopy();
                  }}
                  rightIcon={<CopyIcon />}
                >
                  <ACC short={true}>{address}</ACC>
                </Button>
              </PopoverTrigger>
              <PopoverContent w={350} sx={{ textAlign: "left" }}>
                <PopoverArrow />
                <PopoverBody>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="red.400"
                  >
                    This is early alpha. We advise you to not keep more than 1
                    ICP in this wallet for long periods of time.
                  </Text>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="cyan.400"
                  >
                    When you send ICP to this address the dapp will
                    automatically wrap it for faster usage within the protocol.
                    That costs 0.0002 ICP in fees paid to IC. When you make a
                    transfer it gets automatically unwrapped.
                  </Text>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="gray.500"
                  >
                    Your address:
                  </Text>
                  <Text>
                    <ACC>{address}</ACC>
                  </Text>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="gray.500"
                  >
                    Supported non-fungible: <NFTA />
                  </Text>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="gray.500"
                  >
                    Supported fungible: <ICP />
                  </Text>
                  {/* {pro ? (
                    <>
                      <Text
                        casing="uppercase"
                        fontSize="xs"
                        mt="10px"
                        color="gray.500"
                      >
                        Your principal:
                      </Text>
                      <Text>
                        <PRI>{principal}</PRI>
                      </Text>
                    </>
                  ) : null} */}
                </PopoverBody>
                <PopoverFooter
                  border="0"
                  d="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  pb={4}
                >
                  <Box fontSize="sm"></Box>
                  <ButtonGroup size="sm">
                    <Button
                      colorScheme="teal"
                      onClick={() => {
                        dispatch(logout());
                      }}
                    >
                      Logout
                    </Button>
                  </ButtonGroup>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
          </>
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="solid"
          />
          <MenuList>
            <a
              href={"https://docs.nftanvil.com"}
              target="_blank"
              rel="noreferrer"
            >
              <MenuItem icon={<ExternalLinkIcon />}>Documentation</MenuItem>
            </a>
            <a
              href={"https://github.com/infu/nftanvil"}
              target="_blank"
              rel="noreferrer"
            >
              <MenuItem icon={<ExternalLinkIcon />}>Source code</MenuItem>
            </a>

            <a
              href={"https://discord.gg/apPegYBhBC"}
              target="_blank"
              rel="noreferrer"
            >
              <MenuItem icon={<ExternalLinkIcon />}>Discord</MenuItem>
            </a>

            {colorMode === "light" ? (
              <MenuItem icon={<SunIcon />} onClick={toggleColorMode}>
                Light
              </MenuItem>
            ) : (
              <MenuItem icon={<MoonIcon />} onClick={toggleColorMode}>
                Dark
              </MenuItem>
            )}

            <Link to="/dashboard">
              <MenuItem icon={<InfoOutlineIcon />}>Dashboard</MenuItem>
            </Link>
            <Link to="/history">
              <MenuItem>History</MenuItem>
            </Link>
            <Box align="left" pl="3" pt="1" pb="1">
              <ProToggle />
            </Box>
          </MenuList>
        </Menu>
      </ButtonGroup>
    </Box>
  );
}

export const ProToggle = () => {
  const dispatch = useDispatch();
  const pro = useSelector((state) => state.user.pro);

  return (
    <FormControl w={"110px"} ml="2px" display="inline-flex" alignItems="center">
      <FormLabel htmlFor="pro" mb="0">
        <Text>Advanced</Text>
      </FormLabel>
      <Switch
        id="pro"
        isChecked={pro}
        onChange={(e) => dispatch(proModeSet(e.target.checked))}
      />
    </FormControl>
  );
};

// <Spinner
// thickness="4px"
// speed="0.65s"
// emptyColor="gray.200"
// color="blue.500"
// size="xl"
// />
function Logo(props) {
  const theme = useColorModeValue("light", "dark");

  return (
    <Box {...props}>
      <Stack direction="horizontal" ml="6px" sx={{ position: "relative" }}>
        <img src={anvillogo} width="30px" />
        <Text
          mt="7px"
          ml="10px"
          sx={{
            fontFamily: "Greycliff",
            position: "absolute",
            top: "-5px",
            left: "30px",
            color: theme === "dark" ? "gray.300" : "gray.800",
          }}
        >
          NFT<b>ANVIL</b>
        </Text>
        <Text
          mt="7px"
          fontSize="11.4px"
          ml="10px"
          sx={{
            position: "absolute",
            left: "30px",
            top: "12px",
            width: "85px",
            fontFamily: "Greycliff",
            color: theme === "dark" ? "gray.300" : "gray.800",
          }}
        >
          mint a promise
        </Text>
      </Stack>
    </Box>
  );
}

function DesktopMenu() {
  const { width, height } = useWindowSize();

  if (width > 1500)
    return (
      <>
        <Flex>
          <Logo w={120} />
          <Spacer />
          <LoginBox />
        </Flex>
        <PageTabs
          sx={{
            position: "absolute",
            top: "17px",
            left: "50%",
            width: "280px",
            textAlign: "center",
            marginLeft: "-140px",
          }}
        />
      </>
    );

  return (
    <>
      <Flex>
        <Logo w={120} />
        <PageTabs sx={{ marginLeft: "20px" }} />
        <Spacer />
        <LoginBox />
      </Flex>
    </>
  );
}

function MobileMenu() {
  const address = useSelector((state) =>
    state.user.address ? state.user.address.toLowerCase() : null
  );
  const anonymous = useSelector((state) => state.user.anonymous);
  const pathname = useSelector((state) => state.router.location.pathname);
  const pro = useSelector((state) => state.user.pro);

  const myroot = "/" + address;

  const { onCopy } = useClipboard(address);
  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useDispatch();

  return (
    <>
      <Logo
        w={250}
        sx={{
          position: "absolute",
          top: "13px",
          left: "50%",
          width: "114px",
          marginLeft: "-62px",
        }}
      />
      <Flex>
        <IconButton
          icon={<ArrowBackIcon />}
          variant="solid"
          disabled={!address || myroot === pathname}
          onClick={() => {
            dispatch(push(myroot));
          }}
        />

        <Spacer />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="solid"
          />
          <MenuList>
            {address ? (
              <Link to={"/" + address}>
                <MenuItem>Inventory</MenuItem>
              </Link>
            ) : null}

            <Link to="/mint">
              <MenuItem>Mint</MenuItem>
            </Link>

            <Link to="/history">
              <MenuItem>History</MenuItem>
            </Link>
            <Link to="/dashboard">
              <MenuItem icon={<InfoOutlineIcon />}>Dashboard</MenuItem>
            </Link>
            {anonymous ? (
              <MenuItem onClick={() => dispatch(login())}>
                Authenticate
                <img
                  src={Dfinity}
                  alt=""
                  style={{ width: "40px", height: "23px" }}
                />
              </MenuItem>
            ) : (
              <>
                <ICPBOX mobile={true} />
                {/* <ANVBOX mobile={true} /> */}

                <MenuItem
                  onClick={() => {
                    toast.info("Copied to clipboard", {
                      position: "bottom-right",
                    });
                    onCopy();
                  }}
                  icon={<CopyIcon />}
                >
                  Your address <ACC short={true}>{address}</ACC>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    dispatch(logout());
                  }}
                >
                  Logout
                </MenuItem>
              </>
            )}
            <a
              href={"https://github.com/infu/nftanvil"}
              target="_blank"
              rel="noreferrer"
            >
              <MenuItem icon={<ExternalLinkIcon />}>Source code</MenuItem>
            </a>

            <a
              href={"https://discord.gg/apPegYBhBC"}
              target="_blank"
              rel="noreferrer"
            >
              <MenuItem icon={<ExternalLinkIcon />}>Discord</MenuItem>
            </a>
            {colorMode === "light" ? (
              <MenuItem icon={<SunIcon />} onClick={toggleColorMode}>
                Light
              </MenuItem>
            ) : (
              <MenuItem icon={<MoonIcon />} onClick={toggleColorMode}>
                Dark
              </MenuItem>
            )}
            <Box align="left" pl="3" pt="1" pb="1">
              <ProToggle />
            </Box>
          </MenuList>
        </Menu>
      </Flex>
    </>
  );
}

function MainMenu() {
  const { width, height } = useWindowSize();

  const isDesktop = width > 1100;
  // const [isDesktop] = useMediaQuery("(min-width: 480px)");

  return isDesktop ? <DesktopMenu /> : <MobileMenu />;
}
function App() {
  const mapLoaded = useSelector((state) => state.user.map.history);
  const dispatch = useDispatch();

  const theme = useColorModeValue("light", "dark");
  if (!mapLoaded) return null;

  // if (Cookies.get("admin") !== "true") return <Waiting />;

  return (
    <>
      <Box>
        <img
          src={anvillogowhite}
          alt=""
          style={{
            position: "fixed",
            maxWidth: "600px",
            bottom: "-60px",
            left: "50%",
            marginLeft: "-300px",
            opacity: "0.1",
            zIndex: "-1",
            pointerEvents: "none",
          }}
        />
        <Disclaimer />
        <MainMenu />
        {/* <AlertTestNet /> */}
        {/* <Button
          onClick={() => {
            dispatch(hw_auth());
          }}
        >
          HW AUTH
        </Button>{" "}
        <Button
          onClick={async () => {
            dispatch(hw_test());
            // let useData = { cooldown: 5111111 };
            // let memo = [12, 11, 5, 0, 0, 1, 7];
            // let { transactionId } = await dispatch(
            //   use({ id: "nftaafa74tu6jky7g9zb", use: useData, memo })
            // );
            // console.log({ transactionId });
          }}
        >
          HW TEST
        </Button> */}
        <Center>
          <RouterSwitch>
            <Route path="/mint" component={Mint} />
            <Route path="/history" exact component={HistoryRedirect} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/:tx(tx.*)" component={HistoryTx} />
            <Route path="/history/:canister/:from/:to" component={History} />
            <Route path="/:id(nfta.*)/:code" component={NFTPage} />
            <Route path="/:id(nfta.*)" component={NFTPage} />
            <Route
              path="/:address(.{64})/lg/:pageIdx?"
              component={InventoryLarge}
            />
            <Route path="/:address(.{64})/:pageIdx?" component={Inventory} />

            <Route path="/:code" component={NFTClaim} />

            <Route exact path="/">
              <Redirect to="/mint" />
            </Route>
          </RouterSwitch>
        </Center>
      </Box>
      <Box
        textAlign="center"
        mt="80px"
        mb="80px"
        sx={{
          fontFamily: "Hexaframe",
          fontSize: "10px",
          textTransform: "uppercase",
          color: theme === "dark" ? "gray.300" : "gray.700",
        }}
      >
        Web 3.0 | Made by VVV DAO
        <img
          style={{ margin: "10px auto" }}
          src={theme === "dark" ? PoweredDark : PoweredLight}
          alt=""
        />
      </Box>
      <Nftstorage />
      <ToastContainer theme={theme} />
    </>
  );
}

export default App;
