import {
  useDisclosure,
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Button,
  Stack,
  Text,
  IconButton,
  FormLabel,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

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
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import { useSelector, useDispatch } from "react-redux";
import { loadInventory } from "../reducers/inventory";
import styled from "@emotion/styled";
import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";
import { NftHistory } from "./History";
import { useDrop, useDrag } from "react-dnd";
import { positionSave } from "../reducers/inventory";
import { transfer_token } from "../reducers/user";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 72px 72px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: 28px;
  padding: 0px;
  border-radius: 8px;
`;

const NFTEmpty = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background-color: ${(props) => (props.isOver ? "rgba(0,30,60,0.4)" : "")};
`;

const FTokenDiv = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  position: relative;
  box-overflow: hidden;
  .cimg {
    width: 56px;
    height: 56px;
    margin: 8px;
  }
  .bal {
    position: absolute;
    bottom: 8px;
    right: 10px;
    text-shadow: 0px 0px 10px #000;
    color: #fff;
    font-size: 12px;
  }
  .border {
    top: 0px;
    left: 0px;
    position: absolute;
    background: url(${thumb_bg});
    background-size: 72px 72px;
    width: 72px;
    height: 72px;

    &:hover {
      background-image: url(${thumb_over});
    }
  }
`;

export const NFTSpot = ({ cell }) => {
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

export const TransferModal = ({ id, onClose, isOpen }) => {
  const dispatch = useDispatch();
  const initialRef = React.useRef();
  const amountRef = React.useRef();

  const transferOk = async () => {
    let to = initialRef.current.value;
    let amount = AccountIdentifier.icpToE8s(amountRef.current.value); // + ICP_FEE;

    onClose();

    await dispatch(transfer_token({ id, to, amount }));
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
      size={"xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>To Address</FormLabel>
            <Input ref={initialRef} placeholder="50e3df3..." />
          </FormControl>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input ref={amountRef} placeholder="" type="number" />
            <Text mt="2" fontSize="13px">
              0.01 transfer fee
            </Text>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button ml={3} onClick={transferOk}>
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const positioned = (positions, items) => {
  let r = {};
  for (let id of items) {
    if (positions[id]) r[positions[id]] = id;
  }
  for (let id of items) {
    if (!positions[id]) {
      let idx = 0;
      while (true) {
        if (!r[idx]) {
          r[idx] = id;
          break;
        }
        idx++;
      }
    }
  }

  return r;
};

export const FToken = ({ id, bal }) => {
  const dispatch = useDispatch();
  const modal = useDisclosure();

  const [{ opacity, dragging }, dragRef] = useDrag(
    () => ({
      type: "nft",
      item: { id },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          dispatch(positionSave({ id: item.id, pos: dropResult.cell }));
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        dragging: monitor.isDragging(),
      }),
    }),
    []
  );

  let amount = Number(AccountIdentifier.e8sToIcp(bal)).toFixed(2);

  return (
    <FTokenDiv
      id={id}
      bal={bal}
      ref={dragRef}
      style={{
        opacity,
      }}
      onClick={modal.onOpen}
    >
      <img className="cimg" alt="" />
      <div className="bal">{amount}</div>
      <div className="border" />
      <TransferModal id={id} {...modal} />
    </FTokenDiv>
  );
};

const EmptySpot = () => {
  return (
    <Box
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: "4px",
        width: "100%",
        marginTop: "100px",
        marginBottom: "40px",
      }}
    ></Box>
  );
};

export const InventoryPage = (p) => {
  const address = p.match.params.address;
  const pageIdx =
    (p.match.params.pageIdx && parseInt(p.match.params.pageIdx, 10)) || 0;

  const meta = useSelector((state) => state.inventory[address + "meta"]);

  return (
    <Box>
      <Stack direction="horizontal">
        <Inventory address={address} pageIdx={pageIdx} cols={4} rows={10} />
        <EmptySpot />
        {/* <Inventory address={address} pageIdx={pageIdx} cols={4} rows={10} /> */}
      </Stack>
      <Box>
        {meta ? (
          <NftHistory transactions={meta.transactions} showThumb={true} />
        ) : null}
      </Box>
    </Box>
  );
};

export const Inventory = ({ cols, rows, address, pageIdx }) => {
  const maxItems = cols * rows;

  const positions = useSelector((state) => state.inventory.positions);
  const ft = useSelector((state) => state.user.ft);

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

  if (!items) return null;

  // const cols = Math.min(Math.floor((width - 50) / 72), 10);
  // const rows = Math.ceil(maxItems / cols);

  if (isLoading || !items) return null;

  let items_pos = positioned(positions, [...items, ...Object.keys(ft)]);

  const grid = Array(rows * cols)
    .fill(0)
    .map((x, idx) => {
      let id = items_pos[idx];
      if (id) {
        if (id.indexOf("nft") !== 0)
          return <FToken id={id} bal={ft[id]} key={id} />;
        else return <NFT id={id} key={id} />;
      } else return <NFTSpot key={"S" + idx} cell={idx} />;
    });

  return (
    <Stack mt="8">
      <Pagination
        address={address}
        pageIdx={pageIdx}
        end={items_pos.length < maxItems}
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
        end={items_pos.length < maxItems}
      />
    </Stack>
  );
};

export const InventoryLarge = (p) => {
  const address = p.match.params.address;
  const pageIdx =
    (p.match.params.pageIdx && parseInt(p.match.params.pageIdx, 10)) || 0;
  const maxItems = 40;

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
        <IconButton mr="2" size="xs" icon={<HamburgerIcon />} variant="solid" />
      </Link>
      <ACC short={true}>{address}</ACC>

      {prev_page ? (
        <Link to={prev_page}>
          <IconButton
            ml="2"
            size="xs"
            icon={<ChevronLeftIcon />}
            variant="solid"
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
