import anvillogo from "./assets/anvillogo.svg";
import anvillogowhite from "./assets/anvillogowhite.svg";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { login, logout, owned, challenge } from "./reducers/user";
import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
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
  AddIcon,
  WarningIcon,
} from "@chakra-ui/icons";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import Dfinity from "./assets/dfinity.svg";

import { Zap } from "./icons";
import { Switch, Route, Redirect } from "react-router";

import { Link } from "react-router-dom";
import { Challenge } from "./components/Challenge";

import { Mint } from "./components/Mint";
import { Inventory } from "./components/Inventory";
import { NFTPage, NFTClaim } from "./components/NFT";
function PageTabs() {
  const address = useSelector((state) => state.user.address);

  return (
    <Box>
      <ButtonGroup variant="outline" spacing="3">
        <Link to={"/address/0/" + address}>
          <Button variant="solid" colorScheme="gray">
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

function LoginBox() {
  const address = useSelector((state) => state.user.address);
  const anonymous = useSelector((state) => state.user.anonymous);
  const accesstokens = useSelector((state) => state.user.accesstokens);

  const { onCopy } = useClipboard(address);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useDispatch();
  return (
    <Box w={270}>
      <ButtonGroup variant="outline" spacing="3">
        {anonymous ? (
          <>
            <Button
              variant="solid"
              rightIcon={
                <img src={Dfinity} style={{ width: "40px", height: "40px" }} />
              }
              colorScheme="gray"
              onClick={() => dispatch(login())}
            >
              Authenticate
            </Button>
          </>
        ) : (
          <>
            <Tooltip
              hasArrow
              label="Temporary access tokens. Rewarded for proving personhood"
            >
              <Button
                onClick={() => {
                  dispatch(challenge());
                }}
              >
                {accesstokens}
              </Button>
            </Tooltip>
            <Popover trigger={"hover"}>
              <PopoverTrigger>
                <Button
                  colorScheme="gray"
                  variant="solid"
                  onClick={() => {
                    toast({
                      title: "Copied to clipboard",
                      position: "top",
                      isClosable: true,
                    });
                    onCopy();
                  }}
                  rightIcon={<CopyIcon />}
                >
                  {address.substring(0, 4) + "..." + address.slice(-4)}
                </Button>
              </PopoverTrigger>
              <PopoverContent w={350}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Your address</PopoverHeader>
                <PopoverBody>{address}</PopoverBody>
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
function Logo() {
  return (
    <Box w={250}>
      <Stack direction="horizontal" ml="6px">
        <img src={anvillogo} width="30px" />
        <Text mt="7px" ml="10px">
          NFT<b>ANVIL</b>
        </Text>
      </Stack>
    </Box>
  );
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
            width: "600px",
            bottom: "-60px",
            left: "50%",
            marginLeft: "-300px",
            opacity: "0.1",
            zIndex: "-1",
          }}
        />
        <Flex>
          <Logo />
          <Spacer />
          <PageTabs />
          <Spacer />
          <LoginBox />
        </Flex>
        <AlertTestNet />
        <Center>
          <Switch>
            <Route path="/mint" component={Mint} />
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
      <Challenge />
    </>
  );
}

export default App;
