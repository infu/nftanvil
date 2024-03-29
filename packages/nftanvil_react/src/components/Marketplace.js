/* global BigInt */

import React, { useEffect, useState, useRef } from "react";
import {
  HStack,
  Center,
  Flex,
  Box,
  Select,
  Checkbox,
  Switch,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { NftThumb } from "./NFT";

import {
  useAnvilSelector,
  useAnvilDispatch,
  nft_fetch,
  load_inventory,
  load_author,
} from "../index.js";

import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

export function MarketplaceLoad({ author, children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const maxItems = 40;

  const dispatch = useAnvilDispatch();

  const load = async () => {
    let it = await dispatch(load_author(author)).catch((e) => {
      console.log(e);
    });
    setItems(it);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return children(items);
}

function standardDeviation(numArray) {
  const mean = numArray.reduce((s, n) => s + n[1], 0) / numArray.length;
  const variance =
    numArray.reduce((s, n) => s + (n[1] - mean) ** 2, 0) /
    (numArray.length - 1);
  const std = Math.sqrt(variance);

  return { mean, variance, std };
}

export function MarketplaceFilters({
  items,
  attributes = [],
  tags = [],
  filterTags = [],
  children,
}) {
  const [page, setPage] = React.useState(0);
  const [filterQuality, setFilterQuality] = React.useState(0);
  const [sortBy, setSortBy] = React.useState("priceasc");
  const [selectedTags, setTag] = useState({});
  if (!items || !items.length) return null;

  let filtered = items
    .filter((x) => {
      if (filterQuality <= 0) return true;
      return x[2] == filterQuality;
    })
    .filter((x) => {
      let pass = true;
      for (let z of filterTags) {
        if (!x[4] || x[4].indexOf(z) === -1) {
          pass = false;
          break;
        }
      }
      return pass;
    })
    .filter((x) => {
      let pass = true;
      for (let tl in selectedTags) {
        let z = selectedTags[tl];
        if (z && z !== "all") {
          if (!x[4] || x[4].indexOf(z) === -1) {
            pass = false;
            break;
          }
        }
      }
      return pass;
    });

  let tagsLeft = []
    .concat(...filtered.map((x) => x[4]))
    .filter((x) => filterTags.indexOf(x) === -1 && x?.indexOf("#") !== 0)
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter(Boolean);

  if (tagsLeft.length <= 1) tagsLeft = [];

  // auto attributes
  let derived_attributes = attributes;
  let seenQualities = [];

  for (let nf of items) {
    if (seenQualities.indexOf(nf[2]) === -1) seenQualities.push(nf[2]);
  }
  seenQualities = seenQualities.filter(Boolean);
  if (seenQualities.length <= 1) seenQualities = [];

  for (let nf of filtered) {
    if (!nf[3]) continue;
    if (!attributes.length) {
      for (let pair of nf[3]) {
        if (derived_attributes.indexOf(pair[0]) === -1)
          derived_attributes.push(pair[0]);
      }
    }
  }
  derived_attributes = derived_attributes.map((x) => [
    x,
    capitalizeFirstLetter(x.toString()),
  ]);

  let price_min = false;
  let price_max = false;

  let sorted = !sortBy
    ? filtered
    : filtered.sort((a, b) => {
        if (sortBy === "priceasc") return a[1] - b[1];
        if (sortBy === "pricedesc") return b[1] - a[1];

        let q = a[3] ? a[3].find((z) => z[0] === sortBy) : false;
        q = q ? q[1] : 0;

        let m = b[3] ? b[3].find((z) => z[0] === sortBy) : false;
        m = m ? m[1] : 0;

        return m - q;
      });

  sorted.forEach((x) => {
    if (!x[1]) return;
    if (price_min === false || x[1] < price_min) price_min = x[1];
    if (price_max === false || x[1] > price_max) price_max = x[1];
  });

  const { mean, std } = standardDeviation(sorted.filter((x) => x[1] !== 0));

  let slice = sorted.slice(page * 20, (page + 1) * 20);

  const goPageBack = (
    <Button
      disabled={page === 0}
      onClick={() => {
        setPage(page - 1);
      }}
    >
      Prev
    </Button>
  );

  const goPageNext = (
    <Button
      disabled={slice.length == 0}
      onClick={() => {
        setPage(page + 1);
      }}
    >
      Next
    </Button>
  );

  const fTags = tags.map((taglist, idx) => (
    <Select
      key={idx}
      onChange={(e) => {
        setTag({ ...selectedTags, [idx]: e.target.value });
      }}
    >
      <option value="all">all</option>
      {taglist.map((tag, tagidx) => (
        <option key={tagidx} value={tag}>
          {tag}
        </option>
      ))}
    </Select>
  ));

  const fQuality = seenQualities.length ? (
    <Select
      onChange={(e) => {
        setFilterQuality(e.target.value);
        setPage(0);
      }}
      defaultValue={filterQuality}
    >
      <option value={0}>All</option>
      {itemQuality.dark
        .filter(({ label, color }, idx) => seenQualities.indexOf(idx) !== -1)
        .map(({ label, color }, idx) => (
          <option key={label} value={idx}>
            {label}
          </option>
        ))}
    </Select>
  ) : null;

  const fOrder = (
    <Select
      onChange={(e) => {
        setSortBy(e.target.value);
        setPage(0);
      }}
      defaultValue="priceasc"
    >
      <option key={"priceasc"} value="priceasc">
        ↗ Price
      </option>
      <option key={"pricedesc"} value="pricedesc">
        ↘ Price
      </option>
      {derived_attributes.map(([k, v]) => (
        <option key={k} value={k}>
          ↘ {v}
        </option>
      ))}
    </Select>
  );

  const stats =
    price_min !== false && price_max !== false && mean && std
      ? {
          stdLow: AccountIdentifier.e8sToIcp(BigInt(Math.round(mean - std))),
          floor: AccountIdentifier.e8sToIcp(price_min),
          mean: AccountIdentifier.e8sToIcp(BigInt(Math.round(mean))),
          high: AccountIdentifier.e8sToIcp(BigInt(Math.round(mean + std))),
        }
      : null;

  return children({
    goPageBack,
    goPageNext,
    stats,
    fOrder,
    fQuality,
    fTags,
    slice,
    tagsLeft,
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
