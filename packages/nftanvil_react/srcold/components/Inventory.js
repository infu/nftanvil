import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Stack,
  Text,
  IconButton,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import React, { useEffect, useState } from "react";

import { NFTLarge, NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import { load_inventory } from "../reducers/inventory";
import styled from "@emotion/styled";
import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";
import { NftHistory } from "./History";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token";
import { useDrop, useDrag } from "react-dnd";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 72px 72px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: 28px;
  padding: 0px;
  border-radius: 8px;
  cursor: pointer;
`;

const NFTEmpty = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background-color: ${(props) => (props.isOver ? "rgba(0,30,60,0.4)" : "")};
`;

// const cols = Math.min(Math.floor((width - 50) / 72), 10);
// const rows = Math.ceil(maxItems / cols);

export const Inventory = ({ address, onOpenNft, cols, rows }) => {
  const maxItems = cols * rows;

  const acc = useSelector((state) => state.user.map.account);
  const [pageIdx, setPageIdx] = useState(0);

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(load_inventory(address, pageIdx, maxItems));
    setLoading(false);
  };
  let bg = useColorModeValue(itemgrid_light, itemgrid);

  useEffect(() => {
    if (!acc?.length) return null;
    load();
  }, [address, acc, pageIdx]);

  const items = useSelector(
    (state) => state.inventory[address] && state.inventory[address][pageIdx]
  );

  if (!items) return null;

  const grid = Array(rows * cols)
    .fill(0)
    .map((x, idx) => {
      let id = items[idx];
      if (id) {
        return <NFT id={id} key={id} />;
      } else return <Empty key={"S" + idx} cell={idx} />;
    });

  return (
    <Stack mt="8">
      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        setPageIdx={setPageIdx}
      />

      <Center>
        {isLoading ? (
          <Box h="72px">
            <Center>
              <Spinner size="lg" mt="11px" />
            </Center>
          </Box>
        ) : (
          <InventoryBox width={cols * 72} height={rows * 72} bg={bg}>
            <Wrap direction={"horizontal"} spacing="0">
              {grid}
            </Wrap>
          </InventoryBox>
        )}
      </Center>

      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        setPageIdx={setPageIdx}
      />
    </Stack>
  );
};

export const Empty = ({ cell }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    // The type (or types) to accept - strings or symbols
    accept: "nft",
    // Props to collect
    drop: () => ({ cell }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <>
      <NFTEmpty ref={drop} isOver={isOver}></NFTEmpty>
    </>
  );
};

const Pagination = ({ address, pageIdx, setPageIdx, end, lg = false }) => {
  return (
    <Text fontSize="11px" textAlign="center">
      <ACC short={true}>{address}</ACC>

      <IconButton
        ml="2"
        size="xs"
        icon={<ChevronLeftIcon />}
        variant="solid"
        disabled={pageIdx - 1 < 0}
        onClick={() => {
          setPageIdx(pageIdx - 1);
        }}
      />

      <IconButton
        ml="2"
        size="xs"
        icon={<ChevronRightIcon />}
        variant="outline"
        disabled={end}
        onClick={() => {
          setPageIdx(pageIdx + 1);
        }}
      />
    </Text>
  );
};
