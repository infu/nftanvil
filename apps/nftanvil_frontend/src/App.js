import anvillogo from "./assets/anvillogo.svg";
import anvillogowhite from "./assets/anvillogowhite.svg";
import blueflame from "./assets/blueflame.svg";

import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { login, logout, transfer_icp, create_canister } from "./reducers/user";
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
} from "@chakra-ui/react";
import { useClipboard, useColorMode } from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  HamburgerIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import { toast } from "react-toastify";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import Dfinity from "./assets/dfinity.svg";

import { Switch, Route, Redirect } from "react-router";

import { Link } from "react-router-dom";

import { Nftstorage } from "./components/Nftstorage";

import { Mint } from "./components/Mint";
import { HistoryRedirect, History, HistoryTx } from "./components/History";

import { Inventory } from "./components/Inventory";
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

function PageTabs() {
  const address = useSelector((state) => state.user.address);

  return (
    <Box>
      <ButtonGroup variant="outline" spacing="3">
        <Link disabled={!address} to={"/address/0/" + address}>
          <Button disabled={!address} variant="solid" colorScheme="gray">
            Inventory
          </Button>
        </Link>

        <Link to="/mint">
          <Button variant="solid" colorScheme="gray">
            Mint
          </Button>
        </Link>

        <Link to="/history">
          <Button variant="solid" colorScheme="gray">
            History
          </Button>
        </Link>
      </ButtonGroup>
    </Box>
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

function ICP({ mobile }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();
  const amountRef = React.useRef();

  const icp = AccountIdentifier.e8sToIcp(
    useSelector((state) => state.user.icp)
  );

  const transferOk = async () => {
    let to = AccountIdentifier.TextToArray(initialRef.current.value);
    let amount = AccountIdentifier.icpToE8s(amountRef.current.value);

    onClose();
    let toastId = toast("Sending...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    try {
      let r = await dispatch(transfer_icp({ to, amount }));
      if ("Err" in r) throw r["Err"];

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <div>
            <div>
              Transfer of {AccountIdentifier.e8sToIcp(amount)} ICP successfull.
            </div>
            <div>Block height: {r["Ok"]}</div>
          </div>
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("Transfer error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <div>
            <div>Transfer failed.</div>
            <div style={{ fontSize: "10px" }}>{e}</div>
          </div>
        ),
      });
    }
  };
  return (
    <>
      {mobile ? (
        <MenuItem onClick={onOpen}>{icp} ICP</MenuItem>
      ) : (
        <Tooltip hasArrow label="Internet Computer main currency">
          <Button onClick={onOpen}>{icp} ICP</Button>
        </Tooltip>
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
          <ModalHeader>Send ICP</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>To Address</FormLabel>
              <Input ref={initialRef} placeholder="50e3df3..." />
            </FormControl>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input ref={amountRef} placeholder="" type="number" />
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

function LoginBox() {
  const address = useSelector((state) =>
    state.user.address ? state.user.address.toLowerCase() : null
  );
  const principal = useSelector((state) => state.user.principal);
  const pwr = useSelector((state) => state.user.pwr);

  const pro = useSelector((state) => state.user.pro);

  const anonymous = useSelector((state) => state.user.anonymous);

  const { onCopy } = useClipboard(address);

  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useDispatch();
  return (
    <Box w={380} sx={{ textAlign: "right" }}>
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
            <ICP mobile={false} />
            <Tooltip hasArrow label="PWR tokens used for minting">
              <Button>
                {AccountIdentifier.e8sToIcp(pwr)}
                <img
                  src={blueflame}
                  style={{ marginLeft: "4px", width: "13px", height: "13px" }}
                  alt=""
                />
              </Button>
            </Tooltip>
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
                  {address.substring(0, 4).toLowerCase() +
                    "..." +
                    address.slice(-4).toLowerCase()}
                </Button>
              </PopoverTrigger>
              <PopoverContent w={350} sx={{ textAlign: "left" }}>
                <PopoverArrow />
                <PopoverBody>
                  <Text
                    casing="uppercase"
                    fontSize="xs"
                    mt="10px"
                    color="gray.500"
                  >
                    Your address:
                  </Text>
                  <Text>{address.toLowerCase()}</Text>
                  {pro ? (
                    <>
                      <Text
                        casing="uppercase"
                        fontSize="xs"
                        mt="10px"
                        color="gray.500"
                      >
                        Your principal:
                      </Text>
                      <Text>{principal}</Text>
                    </>
                  ) : null}
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
        {colorMode === "light" ? (
          <IconButton
            colorScheme="gray"
            variant="solid"
            icon={<SunIcon />}
            onClick={toggleColorMode}
          />
        ) : (
          <IconButton
            colorScheme="gray"
            variant="solid"
            icon={<MoonIcon />}
            onClick={toggleColorMode}
          />
        )}
      </ButtonGroup>
    </Box>
  );
}

// <Spinner
// thickness="4px"
// speed="0.65s"
// emptyColor="gray.200"
// color="blue.500"
// size="xl"
// />
function Logo(props) {
  return (
    <Box {...props}>
      <Stack direction="horizontal" ml="6px">
        <img src={anvillogo} width="30px" />
        <Text mt="7px" ml="10px" sx={{ fontFamily: "Greycliff" }}>
          NFT<b>ANVIL</b>
        </Text>
      </Stack>
    </Box>
  );
}

function DesktopMenu() {
  return (
    <Flex>
      <Logo w={380} />
      <Spacer />
      <PageTabs />
      <Spacer />
      <LoginBox />
    </Flex>
  );
}

function MobileMenu() {
  const address = useSelector((state) =>
    state.user.address ? state.user.address.toLowerCase() : null
  );
  const anonymous = useSelector((state) => state.user.anonymous);
  const pathname = useSelector((state) => state.router.location.pathname);
  const myroot = "/address/0/" + address;

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
          variant="outline"
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
            variant="outline"
          />
          <MenuList>
            {address ? (
              <Link to={"/address/0/" + address}>
                <MenuItem>Inventory</MenuItem>
              </Link>
            ) : null}

            <Link to="/mint">
              <MenuItem>Mint</MenuItem>
            </Link>

            <Link to="/history">
              <MenuItem>History</MenuItem>
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
                <ICP mobile={true} />

                <MenuItem>0 PWR</MenuItem>

                <MenuItem
                  onClick={() => {
                    toast.info("Copied to clipboard", {
                      position: "bottom-right",
                    });
                    onCopy();
                  }}
                  icon={<CopyIcon />}
                >
                  Your address{" "}
                  {address.substring(0, 4).toLowerCase() +
                    "..." +
                    address.slice(-4).toLowerCase()}
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

            {colorMode === "light" ? (
              <MenuItem icon={<SunIcon />} onClick={toggleColorMode}>
                Light
              </MenuItem>
            ) : (
              <MenuItem icon={<MoonIcon />} onClick={toggleColorMode}>
                Dark
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Flex>
    </>
  );
}

function MainMenu() {
  const { width, height } = useWindowSize();

  const isDesktop = width > 930;
  // const [isDesktop] = useMediaQuery("(min-width: 480px)");

  return isDesktop ? <DesktopMenu /> : <MobileMenu />;
}
function App() {
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

        <MainMenu />
        <AlertTestNet />
        <Center>
          <Switch>
            <Route path="/mint" component={Mint} />
            <Route path="/history" exact component={HistoryRedirect} />
            <Route path="/tx/:tx" component={HistoryTx} />
            <Route path="/history/:canister/:from/:to" component={History} />
            <Route path="/nft/:id/:code" component={NFTPage} />
            <Route path="/nft/:id" component={NFTPage} />
            <Route path="/address/:pageIdx/:address" component={Inventory} />
            <Route path="/:code" component={NFTClaim} />

            <Route exact path="/">
              <Redirect to="/mint" />
            </Route>
          </Switch>
        </Center>
      </Box>

      <Nftstorage />
      <ToastContainer theme={useColorModeValue("light", "dark")} />
    </>
  );
}

export default App;
