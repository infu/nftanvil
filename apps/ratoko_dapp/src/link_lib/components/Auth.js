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

export function Auth() {
  const accounts = useSelector((state) => state.user.accounts);
  const not_logged = accounts.length !== 0;

  const dispatch = useDispatch();

  return (
    <Box>
      {not_logged ? (
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
      ) : null}
    </Box>
  );
}
