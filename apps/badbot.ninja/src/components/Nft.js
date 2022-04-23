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
  nft_fetch,
} from "@vvv-interactive/nftanvil-react";
import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

export function NftSingle({ id }) {
  const meta = useAnvilSelector((state) => state.nft[id]);

  const dispatch = useAnvilDispatch();

  useEffect(() => {
    dispatch(nft_fetch(id));
  }, [id, dispatch]);

  if (!meta) return null;

  console.log("META", meta);

  let nft = [
    tokenFromText(id),
    meta.quality,
    meta.name,
    meta.lore,
    meta.attributes,
    meta.tags,
  ];

  return (
    <div>
      <NftThumb nft={nft} />
    </div>
  );
}

export function NftThumb({ nft, owner = false }) {
  let [id, quality, name, lore, attributes, tags] = nft;

  // attributes = [
  //   ["attack", 30],
  //   ["defence", 100],
  //   ["harvest", 40],
  //   ["airdrops", 40],
  // ];

  const map = useAnvilSelector((state) => state.user.map);
  if (!map.history) return null;
  let url = tokenUrl(map.space, id, "thumb");
  let qa = itemQuality.dark[quality];

  return (
    <div className="nft-sm">
      <div className="nft-img">
        <img src={url} alt="nft" />
      </div>
      <div className="nft-info">
        <div className="nft-name" style={{ color: qa.color }}>
          {name}
        </div>
        <div className="nft-quality">{qa.label}</div>
        <div className="nft-lore">{lore}</div>
        {/* {owner ? (
          <div className="actions">
            <button>Transfer</button>
            <button>Sell</button>
          </div>
        ) : null} */}
      </div>
      <div className="nft-attr-box">
        {attributes.map((attr, idx) => (
          <div className="nft-attr" key={idx}>
            <span className="label">{attr[0]}</span>{" "}
            <span className="val">+{attr[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
