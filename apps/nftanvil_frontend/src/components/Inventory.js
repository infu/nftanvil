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
import { Link } from "react-router-dom";

import {
  HamburgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import { useEffect, useState } from "react";

import { NFTLarge, NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import styled from "@emotion/styled";
import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";
import { NftHistory } from "./History";

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
  const pageIdx =
    (p.match.params.pageIdx && parseInt(p.match.params.pageIdx, 10)) || 0;
  const maxItems = 100;

  const acc = useSelector((state) => state.user.map.account);
  const { width, height } = useWindowSize();

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(loadInventory(address, pageIdx, maxItems));
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
              {items && items.map((id) => <NFT id={id} key={id} />)}
            </Wrap>
          )}
        </InventoryBox>
      </Center>

      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
      />

      {meta ? <NftHistory transactions={meta.transactions} /> : null}
    </Stack>
  );
};

export const InventoryLarge = (p) => {
  const address = p.match.params.address;
  const pageIdx =
    (p.match.params.pageIdx && parseInt(p.match.params.pageIdx, 10)) || 0;
  const maxItems = 20;

  const acc = useSelector((state) => state.user.map.account);
  const { width, height } = useWindowSize();

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    await dispatch(loadInventory(address, pageIdx, maxItems));
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

  return (
    <Stack mt="8">
      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items.length < maxItems}
        lg={true}
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
      />

      {meta ? <NftHistory transactions={meta.transactions} /> : null}
    </Stack>
  );
};

const Pagination = ({ address, pageIdx, end, lg = false }) => {
  let prev_page =
    pageIdx <= 0
      ? false
      : "/" + address + "/" + (lg ? "lg/" : "") + (pageIdx - 1);
  let next_page = end
    ? false
    : "/" + address + "/" + (lg ? "lg/" : "") + (pageIdx + 1);

  return (
    <Text fontSize="11px" textAlign="center">
      <Link to={"/" + address + "/" + (lg ? "" : "lg/")}>
        <IconButton
          mr="2"
          size="xs"
          icon={<HamburgerIcon />}
          variant="outline"
        />
      </Link>
      <ACC short={true}>{address}</ACC>

      {prev_page ? (
        <Link to={prev_page}>
          <IconButton
            ml="2"
            size="xs"
            icon={<ChevronLeftIcon />}
            variant="outline"
          />
        </Link>
      ) : null}
      {next_page ? (
        <Link to={next_page}>
          <IconButton
            ml="2"
            size="xs"
            icon={<ChevronRightIcon />}
            variant="outline"
          />
        </Link>
      ) : null}
    </Text>
  );
};
