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

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 72px 72px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: 28px;
  padding: 0px;
  border-radius: 8px;
`;

export const Inventory = ({ address }) => {
  const maxItems = 100;

  const acc = useSelector((state) => state.user.map.account);
  const { width, height } = useWindowSize();
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
  const meta = useSelector((state) => state.inventory[address + "meta"]);

  if (!items) return null;

  const cols = Math.min(Math.floor((width - 50) / 72), 10);
  const rows = Math.ceil(maxItems / cols);

  return (
    <Stack mt="8">
      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        setPageIdx={setPageIdx}
      />

      <Center>
        <InventoryBox width={cols * 72} height={rows * 72} bg={bg}>
          {isLoading ? (
            <Box h="72px">
              <Center>
                <Spinner size="lg" mt="11px" />
              </Center>
            </Box>
          ) : (
            <Wrap direction={"horizontal"} spacing="0">
              {items &&
                items.map((id) => (
                  <a
                    key={id}
                    href={"https://nftanvil.com/" + id}
                    target="_anvil"
                  >
                    <NFT id={id} />
                  </a>
                ))}
            </Wrap>
          )}
        </InventoryBox>
      </Center>

      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        setPageIdx={setPageIdx}
      />

      {/* {meta ? (
        <NftHistory transactions={meta.transactions} showThumb={true} />
      ) : null} */}
    </Stack>
  );
};

export const InventoryLarge = ({ address }) => {
  const maxItems = 40;

  const acc = useSelector((state) => state.user.map.account);
  // const { width, height } = useWindowSize();
  const [pageIdx, setPageIdx] = useState(0);

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(load_inventory(address, pageIdx, maxItems)).catch((e) => {
      console.log(e);
    });
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

  const meta = useSelector((state) => state.inventory[address + "meta"]);

  if (!items) return null;

  console.log({ items, meta, address, pageIdx, maxItems });

  return (
    <Stack mt="8">
      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        lg={true}
        setPageIdx={setPageIdx}
      />

      <Center>
        <Box mt="4" mb="4" w={"100%"} bg={bg}>
          {isLoading ? (
            <Box h="72px">
              <Center>
                <Spinner size="lg" mt="11px" />
              </Center>
            </Box>
          ) : (
            <Wrap direction={"horizontal"} spacing="5" justify="center">
              {items && items.map((id) => <NFTLarge id={id} key={id} />)}
            </Wrap>
          )}
        </Box>
      </Center>

      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        lg={true}
        setPageIdx={setPageIdx}
      />

      {/* {meta ? (
        <NftHistory transactions={meta.transactions} showThumb={true} />
      ) : null} */}
    </Stack>
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
