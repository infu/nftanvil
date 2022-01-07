import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import styled from "@emotion/styled";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 72px 72px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: 28px;
  padding: 0px;
  border-radius: 8px;
`;

export const Inventory = (p) => {
  const address = p.match.params.address;
  const pageIdx = p.match.params.pageIdx;

  const acclist = useSelector((state) => state.user.map.acclist);
  const { width, height } = useWindowSize();

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(loadInventory(address, pageIdx));
    setLoading(false);
  };

  useEffect(() => {
    if (!acclist?.length) return null;
    load();
  }, [address, acclist]);

  const items = useSelector(
    (state) => state.inventory[address] && state.inventory[address][pageIdx]
  );

  const cols = Math.min(Math.floor((width - 50) / 72), 10);
  const rows = Math.ceil(120 / cols);

  return (
    <InventoryBox
      width={cols * 72}
      height={rows * 72}
      bg={useColorModeValue(itemgrid_light, itemgrid)}
    >
      {isLoading ? (
        <Box h="72px">
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
