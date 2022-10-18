import React from "react";

import { Hashicon } from "@emeraldpay/hashicon-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  useClipboard,
  Box,
  Text,
} from "@chakra-ui/react";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";

import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";

import { toast } from "react-toastify";

export const AccountIcon = ({ address }) => {
  const dispatch = useDispatch();

  const { onCopy } = useClipboard(address);

  return (
    <Popover trigger={"hover"} placement="top">
      <PopoverTrigger>
        <Box
          p={"10px"}
          w={"72px"}
          h={"72px"}
          sx={{ cursor: "pointer" }}
          onClick={() => {
            toast.info("Copied to clipboard", {
              position: "bottom-right",
            });
            onCopy();
          }}
        >
          <Hashicon value={address} size={52} />
        </Box>
      </PopoverTrigger>
      <PopoverContent bg={"gray.800"} w={350} sx={{ textAlign: "left" }}>
        <PopoverArrow bg={"gray.800"} />
        <PopoverBody>
          <Text mt={2} fontSize="sm">
            <ACC>{address}</ACC>
          </Text>
        </PopoverBody>
        <PopoverFooter
          border="0"
          d="flex"
          alignItems="center"
          justifyContent="space-between"
        ></PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
