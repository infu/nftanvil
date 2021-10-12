import logo from "./logo.svg";
import "./App.css";

import { useSelector, useDispatch } from "react-redux";
import { login, logout, mint } from "./reducers/user";
import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
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
} from "@chakra-ui/react";
import { useClipboard, useColorMode } from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  AddIcon,
  WarningIcon,
} from "@chakra-ui/icons";

import Dfinity from "./assets/dfinity.svg";

import { Zap } from "./icons";
import { Switch, Route } from "react-router";

import { Link } from "react-router-dom";
function PageTabs() {
  const address = useSelector((state) => state.user.address);

  return (
    <Box>
      <ButtonGroup variant="outline" spacing="3">
        <Link to={"/address/" + address}>
          <Button variant="solid" colorScheme="gray">
            Items
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

function LoginBox() {
  const address = useSelector((state) => state.user.address);
  const anonymous = useSelector((state) => state.user.anonymous);
  const { onCopy } = useClipboard(address);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const dispatch = useDispatch();
  return (
    <Box w={250}>
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
  return <Box w={250}>NFTPKG</Box>;
}

function App() {
  return (
    <Box>
      <Flex>
        <Logo />
        <Spacer />
        <PageTabs />
        <Spacer />
        <LoginBox />
      </Flex>
      <Center>
        <Switch>
          <Route path="/mint" component={MintBox} />
          <Route path="/address/:id" component={InventoryBox} />
        </Switch>
      </Center>
    </Box>
  );
}

function InventoryBox() {
  return (
    <Box
      bg={useColorModeValue("white", "gray.600")}
      borderRadius="md"
      border={1}
      mt={"80px"}
      w={480}
      h={400}
    >
      Mine
    </Box>
  );
}

function MintBox() {
  const dispatch = useDispatch();

  return (
    <Box
      bg={useColorModeValue("white", "gray.600")}
      borderRadius="md"
      border={1}
      mt={"80px"}
      w={480}
      h={400}
    >
      Mint NFTS
      <Button onClick={() => dispatch(mint())}>mint</Button>
    </Box>
  );
}

export default App;
