/* global BigInt */
import React, { useEffect, useState } from "react";

import {
  Text,
  useClipboard,
  useColorMode,
  Stack,
  Box,
  useColorModeValue,
  AbsoluteCenter,
  ButtonGroup,
  MenuItem,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import Dfinity from "../assets/dfinity.svg";

import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

import {
  nft_fetch,
  nft_enter_code,
  nft_burn,
  nft_transfer,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_plug,
  nft_unsocket,
  nft_approve,
  nft_set_price,
  nft_purchase,
  nft_recharge,
  nft_recharge_quote,
} from "../reducers/nft";

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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  Center,
  Tooltip,
  CloseButton,
  Switch,
} from "@chakra-ui/react";

import { user_transfer_icp, user_logout, user_login } from "../reducers/user";

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import { verify_domain, verify_domain_twitter } from "../reducers/inventory";
import { NftHistory } from "./History";
import { Spinner } from "@chakra-ui/react";
import Confetti from "./Confetti";
import { LoginRequired } from "./LoginRequired";
import lodash from "lodash";
import { tokenFromText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";

import {
  Button,
  Wrap,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  Tag,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { VerifiedIcon } from "../icons";
import moment from "moment";
import styled from "@emotion/styled";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { Principal } from "@dfinity/principal";
import {
  TransactionToast,
  TransactionFailed,
} from "../components/TransactionToast";
import { TX, ACC, NFTA, HASH, ICP, ANV, PWR } from "./Code";
import { toHexString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { MARKETPLACE_AID, MARKETPLACE_SHARE, ANVIL_SHARE } from "../config.js";
import {
  AVG_MESSAGE_COST,
  FULLY_CHARGED_MINUTES,
} from "@vvv-interactive/nftanvil-tools/cjs/pricing.js";

const ICP_FEE = 10000n;

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

    await dispatch(user_transfer_icp({ to, amount }));
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

export function Wallet() {
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
    <Box>
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
              onClick={() => dispatch(user_login())}
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
                    color="cyan.400"
                  >
                    Use NNS wallet for long term storage
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
                    <ANV />
                  </Text>
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
                        dispatch(user_logout());
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
      </ButtonGroup>
    </Box>
  );
}
