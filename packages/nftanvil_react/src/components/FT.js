/* global BigInt */
import React, { useEffect, useState } from "react";

import {
  Text,
  useColorMode,
  Stack,
  Box,
  useColorModeValue,
  AbsoluteCenter,
  Select,
} from "@chakra-ui/react";

import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

import {
  nft_fetch,
  nft_enter_code,
  nft_burn,
  nft_transfer,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_plug,
  nft_unsocket,
  nft_approve,
  nft_set_price,
  nft_purchase,
  nft_recharge,
  nft_recharge_quote,
} from "../reducers/nft";

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import { move_item } from "../reducers/inventory";
import { verify_domain, verify_domain_twitter } from "../reducers/verify";

import {
  tokenFromText,
  fungibleUrl,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  ft_all_tokens,
  ft_fetch_meta,
  useFT,
} from "../index.js";

import styled from "@emotion/styled";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { useDrag } from "react-dnd";

const FTokenDiv = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  position: relative;
  box-overflow: hidden;
  .ftimage {
    position: absolute;
    top: -2px;
    left: -2px;
    width: 60px;
    height: 60px;
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

export const FTSelect = ({ onChange, value, initialValue = "1" }) => {
  const [allTokens, setAllTokens] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(ft_all_tokens()).then((at) => {
      let selected = at.find((x) => x.id === initialValue);
      setAllTokens(at);
      onChange(selected);
    });
  }, []);
  console.log(allTokens);
  if (!allTokens) return null;
  return (
    <Select
      value={value?.id}
      variant="filled"
      onChange={(e) => {
        let val = e.target.value;
        const selected_token = allTokens.find((x) => x.id === val);
        onChange(selected_token);
      }}
    >
      {/* <option key="false" value={false}>
        - Select token -
      </option> */}
      {allTokens
        .filter((x) => x.id === "1")
        .map((x, idx) => (
          <option key={idx} value={x.id}>
            {x.symbol.toUpperCase()} - {x.name}
          </option>
        ))}
    </Select>
  );
};

export const FT = ({ token, aid, bal, onClick }) => {
  const dispatch = useDispatch();
  const meta = useFT(token.id);

  const [{ opacity, dragging }, dragRef] = useDrag(
    () => ({
      type: "token",
      item: { token },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          dispatch(
            move_item({
              from_aid: aid,
              to_aid: dropResult.aid,
              token: item.token,
              pos: dropResult.pos,
            })
          );
        }
      },
      canDrag: (monitor) => !token.optimistic,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        dragging: monitor.isDragging(),
      }),
    }),
    [bal, token.optimistic]
  );

  const [mouseOver, setMouseOver] = useState(false);
  const popoverOpen = !dragging && mouseOver;

  return (
    <FTokenDiv
      ref={dragRef}
      style={{
        opacity: token.optimistic ? "0.3" : opacity,
        zIndex: popoverOpen ? 10 : 0,
      }}
      onMouseOver={() => {
        setMouseOver(true);
      }}
      onMouseDown={() => {
        setMouseOver(false);
      }}
      onMouseOut={() => {
        setMouseOver(false);
      }}
    >
      <FTImage id={token.id} />
      {meta ? (
        <div className="bal">
          {"fractionless" in meta.kind
            ? bal // Math.round(Number(BigInt(bal) / 10000000n) / 10)
            : AccountIdentifier.placeDecimal(bal, meta.decimals, 2)}
        </div>
      ) : null}
      <div className="border" />
      <Box
        sx={{
          position: "absolute",
          top: "8px",
          left: "10px",
          right: "10px",
          fontWeight: "bold",
          textAlign: "left",
          fontSize: "11px",

          textShadow: " 0px 0px 3px #000",
        }}
      >
        {meta?.symbol}
      </Box>
      {popoverOpen ? (
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: "56px",
            left: "56px",
            width: "400px",
          }}
        >
          {meta ? <FTMeta id={token.id} bal={token.bal} meta={meta} /> : null}
        </Box>
      ) : null}
    </FTokenDiv>
  );
};

const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);

export const FTMeta = ({ id, bal, meta }) => {
  const mode = useColorModeValue("light", "dark");

  const bg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const isDark = mode === "dark";
  let nowMinutes = Math.floor(Date.now() / 1000 / 60);
  let quantity = bal
    ? AccountIdentifier.placeDecimal(bal, meta.decimals, 8)
    : 0;
  return (
    <Box bg={bg} color={textColor} borderRadius="md" w={350} p={2}>
      <Stack spacing={0}>
        <Text key={"symbol"} color={"white"} fontSize="16px">
          {capitalize(meta.symbol)}
        </Text>
        <Text key={"name"} color={"white"} fontSize="16px">
          {capitalize(meta.name)}
        </Text>
        {meta.desc.length ? (
          <Text
            key="desc"
            fontSize="14px"
            color={isDark ? "yellow" : "yellow.600"}
          >
            "{capitalize(meta.desc)}"
          </Text>
        ) : null}
        <Text key={"ts"} color={"white"} fontSize="14px">
          Total supply:{" "}
          {AccountIdentifier.placeDecimal(meta.total_supply, meta.decimals, 0)}
        </Text>
      </Stack>
    </Box>
  );
};

export const FTImage = ({ id, style = {} }) => {
  const map = useSelector((state) => state.ic.anvil);

  let imgsrc = fungibleUrl(map, id);
  return <img className="ftimage" alt="" src={imgsrc} style={style} />;
};

export const FTAbstract = ({ id, aid, bal, onClick }) => {
  const dispatch = useDispatch();
  const meta = useFT(id);

  const [mouseOver, setMouseOver] = useState(false);
  const popoverOpen = mouseOver;
  if (!meta) return null;

  return (
    <FTokenDiv
      bal={bal}
      style={{
        zIndex: popoverOpen ? 10 : 0,
      }}
      onMouseOver={() => {
        setMouseOver(true);
      }}
      onMouseDown={() => {
        setMouseOver(false);
      }}
      onMouseOut={() => {
        setMouseOver(false);
      }}
    >
      <FTImage id={id} />
      {bal ? (
        <div className="bal">
          {"fractionless" in meta.kind
            ? bal
            : AccountIdentifier.placeDecimal(bal, meta.decimals, 4)}
        </div>
      ) : null}
      <div className="border" />
      <Box
        sx={{
          position: "absolute",
          top: "8px",
          left: "10px",
          right: "10px",
          fontWeight: "bold",
          textAlign: "left",
          fontSize: "11px",

          textShadow: " 0px 0px 3px #000",
        }}
      >
        {meta.symbol}
      </Box>
      {popoverOpen ? (
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: "56px",
            left: "56px",
            width: "400px",
          }}
        >
          <FTMeta id={id} meta={meta} />
        </Box>
      ) : null}
    </FTokenDiv>
  );
};
