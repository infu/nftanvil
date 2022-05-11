/* global BigInt */

import React, { useEffect, useState, useRef } from "react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
} from "@vvv-interactive/nftanvil-react";
import { NftThumb } from "./Nft";
import {
  HStack,
  Center,
  Flex,
  Box,
  Select,
  Checkbox,
  Switch,
} from "@chakra-ui/react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

const ATTR = ["luck", "attack", "defense", "airdrops", "harvest"];

function standardDeviation(numArray) {
  const mean = numArray.reduce((s, n) => s + n[6], 0) / numArray.length;
  const variance =
    numArray.reduce((s, n) => s + (n[6] - mean) ** 2, 0) /
    (numArray.length - 1);
  const std = Math.sqrt(variance);

  return { mean, variance, std };
}

export function Collection({ nfts, mine, only, prices }) {
  const actionsRef = useRef(null);

  const [page, setPage] = React.useState(0);
  const [filterQuality, setFilterQuality] = React.useState(6);
  const [sortBy, setSortBy] = React.useState("priceasc");
  const [showMine, setShowMine] = React.useState(false);

  let nftcut = showMine
    ? nfts.filter((x) => {
        return mine.indexOf(x[0]) !== -1;
      })
    : nfts;

  let filtered = nftcut.filter((x) => {
    if (filterQuality <= 0) return true;
    return x[1] == filterQuality;
  });

  let priced = filtered
    .map((x) => {
      let pr = prices[x[0]][1];
      if (sortBy === "priceasc" && !pr) return false;
      if (sortBy === "pricedesc" && !pr) return false;
      return [...x, pr];
    })
    .filter(Boolean);

  let price_min = false;
  let price_max = false;

  let sorted = !sortBy
    ? priced
    : priced.sort((a, b) => {
        if (sortBy === "priceasc") return a[6] - b[6];
        if (sortBy === "pricedesc") return b[6] - a[6];

        let q = a[4] ? a[4].find((z) => z[0] === sortBy) : false;
        q = q ? q[1] : 0;

        let m = b[4] ? b[4].find((z) => z[0] === sortBy) : false;
        m = m ? m[1] : 0;

        return m - q;
      });

  sorted.forEach((x) => {
    if (!x[6]) return;
    if (price_min === false || x[6] < price_min) price_min = x[6];
    if (price_max === false || x[6] > price_max) price_max = x[6];
  });

  const { mean, std } = standardDeviation(sorted.filter((x) => x[6] !== 0));

  let slice = sorted.slice(page * 30, (page + 1) * 30);
  const pagination = (
    <div className="c-actions">
      <button
        className="old"
        disabled={page == 0}
        onClick={() => {
          setPage(page - 1);
          actionsRef.current.scrollIntoView();
        }}
      >
        Prev
      </button>
      <button
        className="old"
        disabled={slice.length == 0}
        onClick={() => {
          setPage(page + 1);
          actionsRef.current.scrollIntoView();
        }}
      >
        Next
      </button>
    </div>
  );

  const filters = (
    <div className="filters" ref={actionsRef}>
      <Center>
        <Flex align="center">
          <Box mw={200} p={2}>
            <Select
              onChange={(e) => {
                setFilterQuality(e.target.value);
                setPage(0);
              }}
              defaultValue={filterQuality}
            >
              {itemQuality.dark.map(({ label, color }, idx) => (
                <option key={label} value={idx}>
                  {label == "Poor" ? "all" : label}
                </option>
              ))}
            </Select>
          </Box>
          <Box mw={200} p={2}>
            <Select
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              defaultValue="priceasc"
            >
              <option value={false}>all</option>
              <option key={"priceasc"} value="priceasc">
                price asc
              </option>
              <option key={"pricedesc"} value="pricedesc">
                price desc
              </option>
              {ATTR.map((att, idx) => (
                <option key={idx} value={att}>
                  with {att}
                </option>
              ))}
            </Select>
          </Box>
          <Box p={2}>
            <Switch
              checked={showMine}
              type="checkbox"
              id="mine"
              onChange={() => {
                setShowMine(!showMine);
              }}
            >
              Owned
            </Switch>
          </Box>
        </Flex>
      </Center>
    </div>
  );

  return (
    <>
      {filters}
      <div className="priceinfo">
        <span>Items: {filtered.length}</span>
        {price_min !== false && price_max !== false && mean && std ? (
          <>
            <span>Floor: {AccountIdentifier.e8sToIcp(price_min)} ICP</span>

            <span>
              Std low:
              {AccountIdentifier.e8sToIcp(BigInt(Math.round(mean - std)))} ICP
            </span>
            <span>
              Mean: {AccountIdentifier.e8sToIcp(BigInt(Math.round(mean)))} ICP
            </span>
            <span>
              Std high:
              {AccountIdentifier.e8sToIcp(BigInt(Math.round(mean + std)))} ICP
            </span>
          </>
        ) : null}
      </div>
      {pagination}
      <div className="collection">
        {slice.map((nft, idx) => {
          return (
            <NftThumb
              nft={nft}
              key={nft[0]}
              owner={showMine ? true : false}
              mine={mine}
            />
          );
        })}
      </div>
      {pagination}
    </>
  );
}
