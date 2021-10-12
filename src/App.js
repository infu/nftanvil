import logo from "./logo.svg";
import "./App.css";

import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./reducers/user";
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

function PageTabs() {
  return (
    <Box>
      <ButtonGroup variant="outline" spacing="3">
        <Button colorScheme="gray">Owned</Button>
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
    <Box>
      <ButtonGroup variant="outline" spacing="3">
        {anonymous ? (
          <>
            <Button
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
                  onClick={() => {
                    toast({
                      title: "copied to clipboard",
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
          <IconButton icon={<SunIcon />} onClick={toggleColorMode} />
        ) : (
          <IconButton icon={<MoonIcon />} onClick={toggleColorMode} />
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
  return <Box>NFTPKG</Box>;
}

function App() {
  return (
    <Flex>
      <Logo />
      <Spacer />
      <PageTabs />
      <Spacer />
      <LoginBox />
    </Flex>
  );
}

export default App;
