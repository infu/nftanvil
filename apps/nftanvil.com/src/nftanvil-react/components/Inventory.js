import React, { useEffect, useState } from "react";

import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Stack,
  Text,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { SelectIcon } from "../icons";

import {
  HamburgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { AccountIcon } from "./AccountIcon";

import { FT } from "./FT";
import { NFTLarge, NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_tmp from "../assets/itemgrid_tmp.png";

import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  dialog_open,
  user_set_main_account,
} from "../index.js";

import { load_inventory } from "../reducers/inventory";
import { user_login, user_logout, anvil_ready } from "../reducers/user";
import styled from "@emotion/styled";
import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";
import { NftHistory } from "./History";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token";
import { useDrop, useDrag } from "react-dnd";

import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  ArrowBackIcon,
  ExternalLinkIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import { ButtonGroup } from "@chakra-ui/react";

const InventoryBox = styled.div`
  background: url(${(props) => props.bg});
  background-size: 72px 72px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  padding: 0px;

  border-radius: 8px;
  cursor: auto;
`;

const EmptyDiv = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background-color: ${(props) => (props.isOver ? "rgba(0,30,60,0.4)" : "")};
`;

const ArrPrev = styled.div`
  cursor: pointer;
  width: 28px;
  height: 62px;
  margin: 5px 0px 5px 5px;
  border-radius: 6px;
  background-color: rgba(70, 70, 70, 0.3);
  line-height: 60px;
  text-align: center;
  color: #777;
`;
const ArrNext = styled.div`
  cursor: pointer;
  width: 28px;
  height: 62px;
  margin: 5px 0px 5px 5px;
  border-radius: 6px;
  background-color: rgba(70, 70, 70, 0.3);
  line-height: 60px;
  text-align: center;
  color: #777;
`;

const PageDiv = styled.div`
  cursor: pointer;
  width: 62px;
  height: 62px;
  margin: 5px;
  border-radius: 6px;
  background-color: ${(props) =>
    props.isOver ? "rgba(20, 20, 20, 0.6)" : "rgba(70, 70, 70, 0.3)"};
  border: ${(props) =>
    props.selected ? "2px solid rgb(0,130,90)" : "2px solid rgba(0,0,0,0)"};
  .num {
    margin-top: 17px;
    text-align: center;
    font-weight: bold;
    color: #555;
  }
`;

const PageIcon = ({ aid, from, to, idx, onClick, selected }) => {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      // The type (or types) to accept - strings or symbols
      accept: "token",
      // Props to collect
      drop: () => ({ pos: from, aid }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [aid]
  );

  return (
    <PageDiv ref={drop} isOver={isOver} onClick={onClick} selected={selected}>
      <div className="num">{idx}</div>
    </PageDiv>
  );
};

export const Empty = ({ pos, aid }) => {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      // The type (or types) to accept - strings or symbols
      accept: "token",
      // Props to collect
      drop: () => ({ pos, aid }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [aid]
  );

  return (
    <>
      <EmptyDiv ref={drop} isOver={isOver}></EmptyDiv>
    </>
  );
};

const InventoryGrid = ({
  bg,
  address,
  pageFrom,
  rows,
  cols,
  items,
  onClickNft,
}) => {
  return (
    <InventoryBox width={cols * 72} height={rows * 72} bg={bg}>
      <Wrap direction={"horizontal"} spacing="0" overflow="visible">
        {Array(rows * cols)
          .fill(0)
          .map((x, idx) => {
            let token = items ? items[pageFrom + idx] : false;
            if (token) {
              if (token.t === 0)
                return (
                  <NFT
                    token={token}
                    key={token.id}
                    aid={address}
                    onClick={() => onClickNft(token.id)}
                  />
                );
              else
                return (
                  <FT
                    token={token}
                    key={token.id}
                    bal={token.bal}
                    aid={address}
                  />
                );
            } else
              return (
                <Empty
                  key={"S" + pageFrom + idx}
                  pos={pageFrom + idx}
                  aid={address}
                />
              );
          })}
      </Wrap>
    </InventoryBox>
  );
};

export const Inventory = ({
  onClickNft,
  cols,
  rows,
  pagination = true,
  address,
  onChangeAddress = () => {},
}) => {
  const maxItems = cols * rows;

  // console.log("INVENTORY ADDRESS", address);

  const temporary = address?.indexOf("tmp") === 0;
  const ready = useSelector(anvil_ready);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageRoot, setPageRoot] = useState(0);
  const main_account = useSelector((s) => s.user.main_account);

  let bg = useColorModeValue(itemgrid_light, itemgrid);

  const dispatch = useDispatch();
  const onSelectAccount = () => {
    dispatch(
      dialog_open({
        name: "select_account",
      })
    ).then((address) => {
      if (!main_account) dispatch(user_set_main_account(address));
      onChangeAddress(address);
    });
  };

  const onSelectAnotherAccount = () => {
    dispatch(
      dialog_open({
        name: "select_another_account",
      })
    ).then(onChangeAddress);
  };

  useEffect(() => {
    if (address && ready && !temporary) dispatch(load_inventory(address));
  }, [address, ready, temporary]);

  const provider = useSelector(
    (state) => state.user.accounts[address]?.provider
  );

  const items = useSelector((state) => state.inventory[address]?.content);
  const tmp_address = "tmp.attached." + address;
  const items_tmp = useSelector(
    (state) => state.inventory[tmp_address]?.content
  );
  const extended = items_tmp !== undefined && Object.keys(items_tmp).length > 0;
  const pageFrom = pageIdx * maxItems;

  if (!address || !ready)
    return (
      <Box
        mt="8"
        mr={4}
        p={1}
        sx={{
          border: "3px solid #111",
          borderRadius: "10px",
        }}
        w={cols * 72}
        h={(rows + 1) * 72 + 18}
        position="relative"
      >
        <Center mt={"300px"}>
          <Stack>
            <Button
              onClick={onSelectAccount}
              variant="outline"
              rightIcon={<SelectIcon />}
            >
              My account
            </Button>
            <Button
              onClick={onSelectAnotherAccount}
              size="sm"
              variant="outline"
            >
              Another account
            </Button>
          </Stack>
        </Center>
      </Box>
    );

  return (
    <>
      <Stack
        mt="8"
        mr={4}
        p={1}
        sx={{ border: "3px solid #111", borderRadius: "10px" }}
      >
        {pagination ? (
          <Stack direction="horizontal" mb={-1}>
            <AccountIcon
              address={address}
              provider={provider}
              onClick={onSelectAccount}
            />

            {Array(3)
              .fill(0)
              .map((_, idx) => {
                let ridx = pageRoot + idx;
                return (
                  <PageIcon
                    key={ridx}
                    aid={address}
                    idx={ridx + 1}
                    from={ridx * maxItems}
                    to={(ridx + 1) * maxItems}
                    selected={pageIdx === ridx}
                    onClick={() => setPageIdx(ridx)}
                  />
                );
              })}
            <ArrPrev
              onClick={() => setPageRoot(pageRoot - 3 >= 0 ? pageRoot - 3 : 0)}
            >
              &lt;
            </ArrPrev>
            <ArrNext onClick={() => setPageRoot(pageRoot + 3)}>&gt;</ArrNext>
          </Stack>
        ) : null}

        <InventoryGrid
          key={"base-" + address}
          bg={bg}
          address={address}
          pageFrom={pageFrom}
          rows={rows}
          cols={cols}
          items={items}
          onClickNft={onClickNft}
        />

        {extended ? (
          <InventoryGrid
            key={"extended-" + address}
            bg={itemgrid_tmp}
            address={tmp_address}
            pageFrom={0}
            rows={2}
            onClickNft={onClickNft}
            cols={cols}
            items={items_tmp}
          />
        ) : null}
      </Stack>
    </>
  );
};
