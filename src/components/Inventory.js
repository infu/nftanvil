import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
  Wrap,
  useColorModeValue,
} from "@chakra-ui/react";
import { itemQuality, itemTransfer, itemUse } from "../item_config";

import { NFT } from "./NFT";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import { useEffect } from "react";

export const Inventory = (p) => {
  const address = p.match.params.address;
  const pageIdx = p.match.params.pageIdx;

  const acclist = useSelector((state) => state.user.acclist);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!acclist?.length) return null;
    dispatch(loadInventory(address));
  }, [address, acclist]);

  const items = useSelector(
    (state) => state.inventory[address] && state.inventory[address][pageIdx]
  );

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRadius="md"
      border={1}
      sx={{ position: "fixed", bottom: "100px" }}
      w={648}
      p="2"
    >
      <Wrap direction={"horizontal"}>
        {items && items.map((id) => <NFT id={id} key={id} />)}
      </Wrap>
    </Box>
  );
};
