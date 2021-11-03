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

import { itemQuality, itemTransfer, itemUse } from "../item_config";
import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import styled from "@emotion/styled";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 56px 56px;
  width: 616px;
  padding: 0px;
  position: fixed;
  border-radius: 8px;
  bottom: 20px;
  z-index: 100000;
`;

export const Inventory = (p) => {
  const address = p.match.params.address;
  const pageIdx = p.match.params.pageIdx;

  const acclist = useSelector((state) => state.user.acclist);

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

  return (
    <InventoryBox bg={useColorModeValue(itemgrid_light, itemgrid)}>
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
