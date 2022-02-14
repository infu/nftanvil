import fs from "fs";
import fetch from "node-fetch";

import {
  Principal,
  routerCanister,
  nftCanister,
  pwrCanister,
  encodeTokenId,
  getMap,
  refreshMap,
} from "./internal.js";

import {
  uploadFile,
  chunkBlob,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

import pLimit from "p-limit";
const limit = pLimit(
  process.env.MINT_CONCURRENCY ? parseInt(process.env.MINT_CONCURRENCY, 10) : 20
); // Number of concurrent async requests. Don't get it too high or network may block you
import { blobFrom } from "fetch-blob/from.js";
import { NFTStorage } from "nft.storage";

export const easyMint = async (arr) => {
  return await Promise.all(
    arr.map((a) => {
      return limit(() => easyMintOne(a));
    })
  );
};

const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};
export const uploadIPFS = async (token, up) => {
  let blob = await fetch(up).then((r) => r.blob());
  const client = new NFTStorage({ token });
  const cid = await client.storeBlob(blob);
  return cid;
};

export const easyMintOne = async ({ user, subaccount, metadata }) => {
  const onetry = async (tryidx) => {
    let ipfs_pins = [];
    if (metadata?.content[0]?.ipfs?.path) {
      let blob = await blobFrom(metadata.content[0].ipfs.path);
      let size = getFilesizeInBytes(metadata.content[0].ipfs.path);
      let { ok, cid, secret } = await uploadIPFS(
        process.env.NFT_STORAGE_IPFS_API_KEY,
        blob
      );
      ipfs_pins.push({ cid, secret, size });
      metadata.content[0].ipfs.cid = cid;
      metadata.content[0].ipfs.size = size;
    }

    if (metadata?.thumb?.ipfs?.path) {
      let blob = await blobFrom(metadata.thumb.ipfs.path);
      let size = getFilesizeInBytes(metadata.thumb.ipfs.path);
      let { ok, cid, secret } = await uploadIPFS(
        process.env.NFT_STORAGE_IPFS_API_KEY,
        blob
      );
      ipfs_pins.push({ cid, secret, size });
      metadata.thumb.ipfs.cid = cid;
      metadata.thumb.ipfs.size = size;
    }

    let { router } = await routerCanister();

    // let available = await router.getAvailable();

    let map = await getMap();

    let available = map.nft_avail;
    let slot = available[Math.floor(Math.random() * available.length)];

    let pwr = pwrCanister(PrincipalFromSlot(map.space, map.pwr));

    let nftcan = PrincipalFromSlot(map.space, slot);

    let nft = nftCanister(nftcan);

    if (metadata?.content[0]?.internal?.path)
      metadata.content[0].internal.size = getFilesizeInBytes(
        metadata.content[0].internal.path
      );

    if (metadata?.thumb?.internal?.path)
      metadata.thumb.internal.size = getFilesizeInBytes(
        metadata.thumb.internal.path
      );

    let s = await pwr.nft_mint(slot, { user, subaccount, metadata });
    if (s.err && s.err.OutOfMemory === null) {
      console.log("canister full, retrying");
      await refreshMap();
      return easyMintOne({ user, subaccount, metadata });
    }
    if (s.ok) {
      let { tokenIndex, transactionId } = s.ok;

      let tid = encodeTokenId(slot, tokenIndex);

      console.log("minted", tokenIndex, tid);

      for (let { cid, secret } of ipfs_pins) {
        let { ok, err } = await pinIPFS(tid, cid, secret);
        if (err) throw Error("Couldn't pin to IPFS");
      }

      if (metadata?.content[0]?.internal?.path)
        await uploadFile(
          nft,
          tokenIndex,
          "content",
          await chunkBlob(
            await blobFrom(metadata.content[0].internal.path),
            fetch
          ),
          subaccount
        );

      if (metadata?.thumb?.internal?.path)
        await uploadFile(
          nft,
          tokenIndex,
          "thumb",
          await chunkBlob(await blobFrom(metadata.thumb.internal.path), fetch),
          subaccount
        );

      return tid;
    } else {
      throw s && s.err;
    }
  };

  let lasterr = null;
  for (let tt = 0; tt < 10; tt++) {
    try {
      let re = await onetry(tt);
      return re;
    } catch (e) {
      console.log("err", e);
      lasterr = e;
    }
    await refreshMap();

    await delay(1000 + tt * 3000);
  }
  console.log("ERROR! giving up nft");
  throw lasterr;
};

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
