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
    <Popover trigger={"hover"}>
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
        {/* <Button
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
            </Button> */}
      </PopoverTrigger>
      <PopoverContent w={350} sx={{ textAlign: "left" }}>
        <PopoverArrow />
        <PopoverBody>
          {/* <Text casing="uppercase" fontSize="xs" mt="10px" color="gray.500">
              Your address:
            </Text> */}
          <Text mt={2}>
            <ACC>{address}</ACC>
          </Text>
        </PopoverBody>
        <PopoverFooter
          border="0"
          d="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* <ButtonGroup size="sm">
              <Button
                colorScheme="teal"
                onClick={() => {
                  dispatch(user_logout());
                }}
              >
                Logout
              </Button>
            </ButtonGroup> */}
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
