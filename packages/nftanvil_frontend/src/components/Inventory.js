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
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import {
  itemQuality,
  itemTransfer,
  itemUse,
} from "@vvv-interactive/nftanvil-tools/cjs/items.js";
import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import styled from "@emotion/styled";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 56px 56px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: 28px;
  padding: 0px;
  border-radius: 8px;
`;

export const Inventory = (p) => {
  const address = p.match.params.address;
  const pageIdx = p.match.params.pageIdx;

  const acclist = useSelector((state) => state.user.acclist);
  const { width, height } = useWindowSize();

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(loadInventory(address));
    setLoading(false);
  };

  useEffect(() => {
    if (!acclist?.length) return null;
    load();
  }, [address, acclist]);

  const items = useSelector(
    (state) => state.inventory[address] && state.inventory[address][pageIdx]
  );

  const cols = Math.min(Math.floor((width - 30) / 56), 10);
  const rows = Math.ceil(120 / cols);
  return (
    <InventoryBox
      width={cols * 56}
      height={rows * 56}
      bg={useColorModeValue(itemgrid_light, itemgrid)}
    >
      {isLoading ? (
        <Box h="56px">
          <Center>
            <Spinner size="lg" mt="11px" />
          </Center>
        </Box>
      ) : (
        <Wrap direction={"horizontal"} spacing="0">
          {items && items.map((id) => <NFT id={id} key={id} />)}
        </Wrap>
      )}
    </InventoryBox>
  );
};
