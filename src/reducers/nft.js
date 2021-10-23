import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";
import { encodeTokenId, decodeTokenId } from "../purefunc/token";
import { nftCanister } from "../canisters/nft";
import { chunkBlob, blobPrepare } from "../purefunc/data";
import { dropship } from "../canisters/dropship";
import { Principal } from "@dfinity/principal";

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

  data.minter[0] = data.minter[0].toText();
  if (data.extensionCanister[0])
    data.extensionCanister[0] = data.extensionCanister[0].toText();

  console.log("METADATA RESP", resp);
  let meta = { tokenIndex: index, ...data, ...vars };
  dispatch(nftSet({ id, meta }));
  return meta;
};

export const nftMediaGet = (id, type) => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();
  let meta = s.nft.meta[id];
  if (!meta) return null;
  let { index, canister, token } = decodeTokenId(id);

  if (!meta[type] || !meta[type][0].internal) return null;

  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let size = meta[type][0].internal.size;
  let contentType = meta[type][0].internal.contentType;
  let src = await fetchFile(nftcan, size, contentType, index, "content");
  console.log("RECIEVED FILE", src);

  return src;
};

const fetchFile = async (nft, size, contentType, tokenIndex, position) => {
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

  if (vals?.content[0]?.internal?.url)
    await uploadFile(nft, tokenIndex, "content", vals.content[0].internal.url);
  if (vals?.thumb[0]?.internal?.url)
    await uploadFile(nft, tokenIndex, "thumb", vals.thumb[0].internal.url);

  let tid = encodeTokenId(canisterId.toText(), tokenIndex);
  console.log("MINTED ", tid);
  await dispatch(nftFetchMeta(tid));
  await dispatch(nftMediaGet(tid, "content"));
};

export default nftSlice.reducer;
