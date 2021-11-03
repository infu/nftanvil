import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import {
  chunkBlob,
  blobPrepare,
  encodeLink,
  decodeLink,
  generateKeyHashPair,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { Principal } from "@dfinity/principal";
import { produce } from "immer";
import { Spinner } from "@chakra-ui/react";
import { push } from "connected-react-router";
import { challenge } from "./user";
import { createStandaloneToast } from "@chakra-ui/react";
import { theme } from "../theme.js";

export const nftSlice = createSlice({
  name: "nft",
  initialState: {},
  reducers: {
    nftSet: (state, action) => {
      return {
        ...state,
        [action.payload.id]: action.payload.meta,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { nftSet } = nftSlice.actions;

export const nftFetch = (id) => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();
  let s = getState();

  let { index, canister, token } = decodeTokenId(id);

  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let resp = await nftcan.metadata(id);
  let { bearer, data, vars } = resp.ok;

  let meta = {
    bearer,

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
    transfer: data.transfer,

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
    //console.log("BLOB RECIEVED", chunks);

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
    //console.log("UPLOAD RESULT", re);
  });
};

export const transfer =
  ({ id, toAddress }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { index, canister, token } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.transfer({
      from: { address },
      to: { address: toAddress },
      token: id,
      amount: 1,
      memo: [],
      notify: false,
      subaccount: [],
    });
    if (!t.ok) throw t;
  };

export const burn =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { index, canister, token } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    await nftcan.burn({
      user: { address },
      token: id,
      amount: 1,
      memo: [],
      notify: false,
      subaccount: [],
    });
  };

export const use =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { index, canister, token } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    await nftcan.use({
      user: { address },
      token: id,
      memo: [],
      subaccount: [],
    });
  };

export const transfer_link =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { index, canister, token } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let { key, hash } = generateKeyHashPair();

    let slot = await nftcan.transfer_link({
      from: { address },
      hash: Array.from(hash),
      token: id,
      amount: 1,
      subaccount: [],
    });

    let code = encodeLink(slot, index, key);

    return code;
  };

export const claim_link =
  ({ code }) =>
  async (dispatch, getState) => {
    let { slot, tokenIndex, key } = decodeLink(code);
    let canister = await router.fetchNFTCan(slot);

    let identity = authentication.client.getIdentity();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let id = encodeTokenId(canister, tokenIndex);

    let resp = await nftcan.claim_link({
      to: { address },
      key: Array.from(key),
      token: id,
    });

    return resp;
  };

export const nftEnterCode = (code) => async (dispatch, getState) => {
  let { slot, tokenIndex, key } = decodeLink(code);
  let canister = await router.fetchNFTCan(slot);
  let id = encodeTokenId(canister, tokenIndex);
  dispatch(push("/nft/" + id + "/" + code));
};

export const mint = (vals) => async (dispatch, getState) => {
  let canisterId = await router.getAvailable();
  let identity = authentication.client.getIdentity();
  let nft = nftCanister(canisterId, { agentOptions: { identity } });

  let s = getState();

  let address = s.user.address;
  let principal = s.user.principal;

  if (!address) throw Error("Annonymous cant mint"); // Wont let annonymous mint

  const toast = createStandaloneToast({ theme });

  toast({
    title: "Sent for minting",
    status: "info",
    duration: 2000,
    isClosable: true,
  });

  try {
    let mint = await nft.mintNFT({
      to: { address },
      metadata: vals,
    });

    if (mint?.err?.InsufficientBalance === null) {
      dispatch(challenge());
      return;
    }
    if (!("ok" in mint)) throw Error(JSON.stringify(mint.err));

    let tokenIndex = mint.ok;
    let tid = encodeTokenId(canisterId.toText(), tokenIndex);

    // console.log("Minted", { address, tokenIndex, tid });

    if (vals?.content[0]?.internal?.url)
      await uploadFile(
        nft,
        tokenIndex,
        "content",
        vals.content[0].internal.url
      );
    if (vals?.thumb?.internal?.url)
      await uploadFile(nft, tokenIndex, "thumb", vals.thumb.internal.url);

    toast({
      title: "Minting successfull",
      description: "Token id " + tid,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (e) {
    toast({
      title: "Minting failed",
      description: e.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    console.error(e);
  }

  // await dispatch(nftFetchMeta(tid));
  // await dispatch(nftMediaGet(tid, "content"));
};

export default nftSlice.reducer;
