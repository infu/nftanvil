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

export const AccountIcon = ({ address, provider, onClick }) => {
  const dispatch = useDispatch();

  const { onCopy } = useClipboard(address);

  return (
    <Popover trigger={"hover"} placement="top">
      <PopoverTrigger>
        <Box
          p={"10px"}
          w={"72px"}
          h={"72px"}
          sx={{ cursor: "pointer", position: "relative" }}
          onClick={onClick}
        >
          <Hashicon value={address} size={52} />
          <Text
            fontWeight="bold"
            color="gray.800"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              lineHeight: "72px",
              fontSize: "20px",
              textAlign: "center",
            }}
          >
            {provider === "vvv" ? "V" : provider === "ii" ? "II" : ""}
          </Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent bg={"gray.800"} w={350} sx={{ textAlign: "left" }}>
        <PopoverArrow bg={"gray.800"} />
        <PopoverBody>
          <Text mt={2} fontSize="sm">
            <ACC
              onClick={(x) => {
                toast.info("Copied to clipboard", {
                  position: "bottom-right",
                });
                onCopy();
              }}
            >
              {address}
            </ACC>
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
