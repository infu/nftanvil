import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";
import { encodeTokenId, decodeTokenId, tokenUrl } from "../purefunc/token";
import { nftCanister } from "../canisters/nft";
import { chunkBlob, blobPrepare } from "../purefunc/data";
import { dropship } from "../canisters/dropship";
import { Principal } from "@dfinity/principal";
import { produce } from "immer";

export const nftSlice = createSlice({
  name: "nft",
  initialState: {
    meta: {},
  },
  reducers: {
    nftSet: (state, action) => {
      return {
        ...state,
        meta: { ...state.meta, [action.payload.id]: action.payload.meta },
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { nftSet } = nftSlice.actions;

export const nftFetchMeta = (id) => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();
  let s = getState();

  let { index, canister, token } = decodeTokenId(id);

  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let resp = await nftcan.metadata(id);
  let { data, vars } = resp.ok;

  let meta = {
    // inherant
    tokenIndex: index,
    canister,

    // data
    ttl: data.ttl[0],
    use: data.use[0],
    thumb: data.thumb,
    content: data.content[0],
    created: data.created,
    extensionCanister:
      data.extensionCanister[0] && data.extensionCanister[0].toText(),
    quality: data.quality,
    hold: data.hold[0],
    lore: data.lore[0],
    name: data.name[0],
    minter: data.minter.toText(),
    secret: data.secret,
    entropy: data.entropy,
    attributes: data.attributes,
    transfer: data.transfer[0],

    //vars
    cooldownUntil: vars.cooldownUntil[0],
    boundUntil: vars.boundUntil[0],
  };

  if (meta.thumb.internal) meta.thumb.internal.url = tokenUrl(id, "thumb");

  if (meta.content?.internal) {
    if (meta.secret)
      meta.content.internal.url = await nftMediaGet({
        id,
        contentType: meta.content.internal.contentType,
        size: meta.content.internal.size,
        position: "content",
        subaccount: s.user.subaccount,
      });
    else meta.content.internal.url = tokenUrl(id, "content");
  }

  // if (meta.content[0].internal)
  //   meta.content[0].internal.url = await nftMediaGet({
  //     ...meta.content[0].internal,
  //     id,
  //     position: "content",
  //   });

  // console.log("METADATA RESP", meta);

  dispatch(nftSet({ id, meta }));
  return meta;
};

export const nftMediaGet = async ({
  id,
  contentType,
  size,
  position,
  subaccount = false,
}) => {
  let identity = authentication.client.getIdentity();

  let { index, canister, token } = decodeTokenId(id);

  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let src = await fetchFile(
    nftcan,
    size,
    contentType,
    index,
    position,
    subaccount
  );

  return src;
};

const fetchFile = async (
  nft,
  size,
  contentType,
  tokenIndex,
  position,
  subaccount = false
) => {
  let chunkSize = 1024 * 512;
  let chunks = Math.ceil(size / chunkSize);

  return await Promise.all(
    Array(chunks)
      .fill(0)
      .map((_, chunkIdx) => {
        return nft.fetchChunk({
          tokenIndex,
          chunkIdx,
          position: { [position]: null },
          subaccount: subaccount ? [subaccount] : [],
        });
      })
  ).then((chunks) => {
    console.log("BLOB RECIEVED", chunks);

    const blob = new Blob(
      chunks.map((chunk) => {
        return new Uint8Array(chunk[0]).buffer;
      }),
      { type: contentType }
    );

    return URL.createObjectURL(blob);
  });
};

const uploadFile = async (nft, tokenIndex, position, url) => {
  let chunks = await chunkBlob(url);
  await Promise.all(
    chunks.map(async (chunk, idx) => {
      return nft.uploadChunk({
        position: { [position]: null },
        chunkIdx: idx,
        tokenIndex,
        data: await blobPrepare(chunk),
      });
    })
  ).then((re) => {
    console.log("UPLOAD RESULT", re);
  });
};

export const mint = (vals) => async (dispatch, getState) => {
  let canisterId = await dropship.getAvailable();
  let identity = authentication.client.getIdentity();
  let nft = nftCanister(canisterId, { agentOptions: { identity } });

  let s = getState();

  let address = s.user.address;
  let principal = s.user.principal;

  if (!address) throw Error("Annonymous cant mint"); // Wont let annonymous mint

  let mint = await nft.mintNFT({
    to: { address },
    metadata: vals,
  });

  let tokenIndex = mint.ok;
  let tid = encodeTokenId(canisterId.toText(), tokenIndex);

  console.log("Minted", { address, tokenIndex, tid });
  if (vals?.content[0]?.internal?.url)
    await uploadFile(nft, tokenIndex, "content", vals.content[0].internal.url);
  if (vals?.thumb?.internal?.url)
    await uploadFile(nft, tokenIndex, "thumb", vals.thumb.internal.url);

  // await dispatch(nftFetchMeta(tid));
  // await dispatch(nftMediaGet(tid, "content"));
};

export default nftSlice.reducer;
