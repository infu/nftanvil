import React, { useEffect, useState } from "react";
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
import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

const ATTR = ["luck", "attack", "defense", "airdrops", "harvest"];

export function Collection({ nfts, mine }) {
  const [page, setPage] = React.useState(0);
  const [filterQuality, setFilterQuality] = React.useState(-1);
  const [sortBy, setSortBy] = React.useState(false);
  const [showMine, setShowMine] = React.useState(false);

  let nftcut = showMine
    ? nfts.filter((x) => {
        return mine.indexOf(x[0]) !== -1;
      })
    : nfts;

  let filtered = nftcut.filter((x) => x[1] >= filterQuality);

  let sorted = !sortBy
    ? filtered
    : filtered.sort((a, b) => {
        let q = a[4] ? a[4].find((z) => z[0] === sortBy) : false;
        q = q ? q[1] : 0;
        let m = b[4] ? b[4].find((z) => z[0] === sortBy) : false;
        m = m ? m[1] : 0;
        return m - q;
      });

  let slice = sorted.slice(page * 30, (page + 1) * 30);

  const pagination = (
    <div className="c-actions">
      <button
        disabled={page == 0}
        onClick={() => {
          setPage(page - 1);
        }}
      >
        Prev
      </button>
      <button
        disabled={slice.length == 0}
        onClick={() => {
          setPage(page + 1);
        }}
      >
        Next
      </button>
    </div>
  );

  const filters = (
    <div className="filters">
      <select
        onChange={(e) => {
          setFilterQuality(e.target.value);
          setPage(0);
        }}
      >
        {itemQuality.dark.map(({ label, color }, idx) => (
          <option key={label} value={idx}>
            >= {label}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => {
          setSortBy(e.target.value);
          setPage(0);
        }}
      >
        <option value={false}>---</option>
        {ATTR.map((att, idx) => (
          <option key={idx} value={att}>
            with {att}
          </option>
        ))}
      </select>
      <input
        checked={showMine}
        type="checkbox"
        id="mine"
        onChange={() => {
          setShowMine(!showMine);
        }}
      />
      <label htmlFor="mine">owned</label>
    </div>
  );

  return (
    <>
      {filters}

      {pagination}
      <div className="collection">
        {slice.map((nft, idx) => {
          return <NftThumb nft={nft} key={nft[0]} />;
        })}
      </div>
      {pagination}
    </>
  );
}
