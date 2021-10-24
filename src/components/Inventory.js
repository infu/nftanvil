import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { Text, Stack, useColorModeValue } from "@chakra-ui/react";
import { itemQuality, itemTransfer, itemUse } from "../item_config";

import { NFT } from "./NFT";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import { useEffect } from "react";

export const Inventory = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    //componentDidMount like
    dispatch(loadInventory());
  }, []);

  return (
    <Box
      bg={useColorModeValue("white", "gray.600")}
      borderRadius="md"
      border={1}
      mt={"80px"}
      w={480}
      h={400}
    >
      <Button onClick={() => dispatch(test())}>Tst</Button>
    </Box>
  );
};
