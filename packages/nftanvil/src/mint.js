import fs from "fs";
import fetch from "node-fetch";

import {
  Principal,
  routerCanister,
  nftCanister,
  encodeTokenId,
} from "./internal.js";

import {
  uploadFile,
  chunkBlob,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import pLimit from "p-limit";
const limit = pLimit(
  process.env.MINT_CONCURRENCY ? parseInt(process.env.MINT_CONCURRENCY, 10) : 20
); // Number of concurrent async requests. Don't get it too high or network may block you
import { blobFrom } from "fetch-blob/from.js";

export const easyMint = async (arr) => {
  await Promise.all(
    arr.map((a) => {
      return limit(() => easyMintOne(a));
    })
  );
};

export const easyMintOne = async ({ to, metadata }) => {
  let { router } = await routerCanister();
  let nftcan = await router.getAvailable();
  let nft = nftCanister(nftcan);

  if (
    metadata.extensionCanister[0] &&
    typeof metadata.extensionCanister[0] === "string"
  )
    metadata.extensionCanister[0] = Principal.fromText(
      metadata.extensionCanister[0]
    );

  if (metadata?.content[0]?.internal?.path)
    metadata.content[0].internal.size = getFilesizeInBytes(
      metadata.content[0].internal.path
    );

  if (metadata?.thumb?.internal?.path)
    metadata.thumb.internal.size = getFilesizeInBytes(
      metadata.thumb.internal.path
    );

  let s = await nft.mintNFT({ to, metadata });
  if (s.ok) {
    let tokenIndex = s.ok;

    if (metadata?.content[0]?.internal?.path)
      await uploadFile(
        nft,
        tokenIndex,
        "content",
        await chunkBlob(
          await blobFrom(metadata.content[0].internal.path),
          fetch
        )
      );

    if (metadata?.thumb?.internal?.path)
      await uploadFile(
        nft,
        tokenIndex,
        "thumb",
        await chunkBlob(await blobFrom(metadata.thumb.internal.path), fetch)
      );

    let tid = encodeTokenId(nftcan.toText(), tokenIndex);
    return tid;
  } else {
    throw s && s.err;
  }
};

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
