/* global BigInt */
import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import {
  chunkBlob,
  encodeLink,
  decodeLink,
  generateKeyHashPair,
  uploadFile,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { Principal } from "@dfinity/principal";

import { push } from "connected-react-router";
import { setNftStorageModal } from "./user";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import {
  priceStorage,
  priceOps,
} from "@vvv-interactive/nftanvil-tools/cjs/pricing.js";

import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";

import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import { toast } from "react-toastify";
import {
  TransactionToast,
  TransactionFailed,
} from "../components/TransactionToast";

import { refresh_balances, refresh_pwr_balance } from "./user";

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

  let tid = tokenFromText(id);
  let { index, slot } = decodeTokenId(tid);

  let canister = PrincipalFromSlot(s.user.map.space, slot).toText();
  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let resp = await nftcan.metadata(tid);
  if (!resp) throw Error("Can't fetch NFT meta");
  if (resp.err)
    throw Error("Fetching NFT meta error " + JSON.stringify(resp.err));

  let { bearer, data, vars } = resp.ok;
  let now = Math.ceil(Date.now() / 1000 / 60);

  let meta = {
    bearer: AccountIdentifier.ArrayToText(bearer),

    // inherant
    tokenIndex: index,
    canister,

    // data

    // domain: data.domain[0],
    // use: data.use[0],
    // hold: data.hold[0],
    thumb: data.thumb,
    content: data.content[0],
    created: data.created,
    quality: data.quality,
    lore: data.lore[0],
    name: data.name[0],
    custom: data.custom.length,
    author: AccountIdentifier.ArrayToText(data.author),
    secret: data.secret,
    entropy: data.entropy,
    attributes: data.attributes,
    transfer: data.transfer,
    authorShare: data.authorShare,
    tags: data.tags,
    //vars
    ttl: vars.ttl[0],
    cooldownUntil: vars.cooldownUntil[0],
    boundUntil: vars.boundUntil[0],
    pwr: [vars.pwrOps.toString(), vars.pwrStorage.toString()],
    sockets: vars.sockets.map((x) => tokenToText(x)), //TokenIdentifier.ArrayToText(x)),
    price: { ...vars.price, amount: vars.price.amount.toString() },
    history: vars.history,
  };

  meta.transferable =
    meta.transfer.unrestricted === null ||
    (meta.transfer.bindsDuration && meta.boundUntil < now);

  if (meta.thumb.internal)
    meta.thumb.internal.url = tokenUrl(s.user.map.space, tid, "thumb");
  if (meta.thumb.ipfs) meta.thumb.ipfs.url = ipfsTokenUrl(meta.thumb.ipfs.cid);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  if (meta.content?.internal) {
    if (meta.secret)
      meta.content.internal.url = await nftMediaGet(s, {
        id,
        contentType: meta.content.internal.contentType,
        size: meta.content.internal.size,
        position: "content",
        subaccount,
      });
    else meta.content.internal.url = tokenUrl(s.user.map.space, tid, "content");
  }
  if (meta.content?.ipfs)
    meta.content.ipfs.url = ipfsTokenUrl(meta.content.ipfs.cid);

  dispatch(nftSet({ id, meta }));
  return meta;
};

export const nftMediaGet = async (
  s,
  { id, contentType, size, position, subaccount = false }
) => {
  let identity = authentication.client.getIdentity();

  let tid = tokenFromText(id);
  let { index, slot } = decodeTokenId(tid);
  let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

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
          subaccount: subaccount ? subaccount : [],
        });
      })
  ).then((chunks) => {
    const blob = new Blob(
      chunks.map((chunk) => {
        return new Uint8Array(chunk[0]).buffer;
      }),
      { type: contentType }
    );

    return URL.createObjectURL(blob);
  });
};

export const nft_purchase =
  ({ id, amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    //let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    // let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    console.log("BUYING", id, amount);

    let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
      agentOptions: { identity },
    });

    let toastId = toast("Purchasing...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      isLoading: true,
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    let prez;
    try {
      prez = await pwr.nft_purchase(BigInt(slot), {
        token: tokenFromText(id),
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount,
        amount,
      });

      if (prez.err) throw new Error(JSON.stringify(prez.err));

      toast.update(toastId, {
        render: (
          <TransactionToast
            title="Purchase complete"
            transactionId={prez.ok.transactionId}
          />
        ),
        isLoading: false,
        type: toast.TYPE.SUCCESS,
      });
    } catch (e) {
      toast.update(toastId, {
        render: (
          <TransactionFailed title="Purchase failed" message={e.message} />
        ),
        isLoading: false,
        type: toast.TYPE.ERROR,
      });
    }

    dispatch(refresh_balances());
    dispatch(nftFetch(id));
    console.log("purchase result", prez);
  };

export const purchase_intent =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    //console.log("t", id, slot, tokenFromText(id));
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let t = await nftcan.purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tokenFromText(id),
      subaccount,
    });

    if (!("ok" in t)) throw t;

    return t.ok;
  };

export const set_price =
  ({ id, price }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();
    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    console.log("Setting price", id, { slot });
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let t = await nftcan.set_price({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      price: price,
      subaccount,
    });
    if (!("ok" in t)) throw t.err;
    dispatch(nftFetch(id));
  };

export const transfer =
  ({ id, toAddress }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let toastId = toast("Sending...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    let t;
    try {
      t = await nftcan.transfer({
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(toAddress) },
        token: tid,
        amount: 1,
        memo: [],
        subaccount,
      });
      if (!t.ok) throw t.err;
      let { transactionId } = t.ok;
      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Transfer successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("Transfer error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed
            title="Transfer failed"
            message={JSON.stringify(e)}
          />
        ),
      });
    }

    dispatch(nftFetch(id));

    return t;
  };

export const plug =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let { slot } = decodeTokenId(tokenFromText(plug_id));
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let t = await nftcan.plug({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      plug: tokenFromText(plug_id),
      socket: tokenFromText(socket_id),
      memo: [],
    });
    if (!t.ok) throw t.err;
    dispatch(nftFetch(plug_id));
    dispatch(nftFetch(socket_id));
    return t.ok;
  };

export const unsocket =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let { slot } = decodeTokenId(tokenFromText(socket_id));
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let t = await nftcan.unsocket({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      plug: tokenFromText(plug_id),
      socket: tokenFromText(socket_id),
      memo: [],
    });
    if (!t.ok) throw t.err;
    dispatch(nftFetch(plug_id));
    dispatch(nftFetch(socket_id));
    return t.ok;
  };

export const recharge =
  ({ id, amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    // let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    // let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
      agentOptions: { identity },
    });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let toastId = toast("Recharging...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    let t;
    try {
      let t = await pwr.nft_recharge(slot, {
        user: { address: AccountIdentifier.TextToArray(address) },
        token: tid,
        subaccount,
        amount,
      });

      if (!("ok" in t)) throw t.err;

      let { transactionId } = { transactionId: 0 }; //t.ok;

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Recharge successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });

      dispatch(refresh_balances());
      dispatch(nftFetch(id));
      return t.ok;
    } catch (e) {
      console.error("Recharge error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed
            title="Recharge failed"
            message={JSON.stringify(e)}
          />
        ),
      });
    }
  };

export const burn =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let rez = await nftcan.burn({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      amount: 1,
      memo: [],
      subaccount,
    });

    if (rez.err) throw rez.err;

    dispatch(refresh_balances());
    let { transactionId } = rez.ok;
    dispatch(push("/" + TransactionId.toText(transactionId)));
    return rez.ok;
  };

export const approve =
  ({ id, spender }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();
    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let rez = await nftcan.approve({
      token: tid,
      allowance: 1,
      subaccount,
      spender,
    });
    if (rez.err) throw rez.err;
    dispatch(nftFetch(id));

    return rez.ok;
  };

export const use =
  ({ id, use, memo }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    console.log("use");
    let r = await nftcan.use({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      memo,
      use,
      subaccount,
      customVar: [],
    });

    if (!r.ok) throw r.err;
    dispatch(refresh_balances());
    dispatch(nftFetch(id));
    return r.ok;
  };

export const transfer_link =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let tid = tokenFromText(id);
    let { index, slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.user.map.space, slot).toText();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let { key, hash } = generateKeyHashPair();

    let rez = await nftcan.transfer_link({
      from: { address: AccountIdentifier.TextToArray(address) },
      hash: Array.from(hash),
      token: tid,
      amount: 1,
      subaccount,
    });
    if (rez.err) throw rez.err;

    let code = encodeLink(slot, index, key);

    return code;
  };

export const uploadIPFS = async (token, up) => {
  let blob = await fetch(up).then((r) => r.blob());
  const client = new NFTStorage({ token });
  const cid = await client.storeBlob(blob);
  return cid;
};
// export const uploadIPFS = async (up) => {

//   if (typeof up === "string" && up.indexOf("blob:") === 0)
//     up = await fetch(up).then((r) => r.blob());

//   return fetch("https://nftpkg.com/nft/upload", {
//     method: "POST",
//     mode: "cors",
//     body: up,
//   })
//     .then((d) => {
//       return d.json();
//     })
//     .then((x) => {
//       return x;
//     });
// };

// export const pinIPFS = async (tokenid, cid, secret) => {
//   return fetch(
//     "https://nftpkg.com/nft/pin/" + tokenid + "/" + cid + "/" + secret,
//     {
//       method: "POST",
//       mode: "cors",
//     }
//   )
//     .then((d) => {
//       return d.json();
//     })
//     .then((x) => {
//       return x;
//     });
// };

export const claim_link =
  ({ code }) =>
  async (dispatch, getState) => {
    let s = getState();
    let { slot, tokenIndex, key } = decodeLink(code);

    let canister = PrincipalFromSlot(s.user.map.space, slot);

    let identity = authentication.client.getIdentity();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });

    let address = s.user.address;

    let tid = encodeTokenId(slot, tokenIndex);

    let resp = await nftcan.claim_link({
      to: { address: AccountIdentifier.TextToArray(address) },
      key: Array.from(key),
      token: tid,
    });

    dispatch(nftFetch(tokenToText(tid)));

    return resp;
  };

export const nftEnterCode = (code) => async (dispatch, getState) => {
  let s = getState();

  let { slot, tokenIndex } = decodeLink(code);

  if (!s.user.map.space) throw Error("Map not loaded");

  let canister = PrincipalFromSlot(s.user.map.space, slot);

  let id = encodeTokenId(slot, tokenIndex);
  dispatch(push("/" + tokenToText(id) + "/" + code));
};

export const recharge_quote =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();
    const icpCycles = BigInt(s.user.oracle.icpCycles);

    let nft = s.nft[id];

    const ops = priceOps({ ttl: null }) / icpCycles;

    const transfer = BigInt(s.user.oracle.pwrFee);

    const storage =
      priceStorage({
        custom: nft.custom || 0,
        content: nft.content,
        thumb: nft.thumb,
        quality: nft.quality,
        ttl: null,
      }) / icpCycles;

    let full = ops + transfer + storage;

    let current = BigInt(nft.pwr[0]) + BigInt(nft.pwr[1]);
    let diff = full - current + BigInt(s.user.oracle.pwrFee);
    if (diff < 30000n) diff = 0n;

    //console.log({ full, current, diff });

    return diff;
  };

export const mint_quote = (vals) => async (dispatch, getState) => {
  let s = getState();

  const icpCycles = BigInt(s.user.oracle.icpCycles);
  const transfer = BigInt(s.user.oracle.pwrFee);
  const ops = priceOps({ ttl: vals.ttl }) / icpCycles;

  const storage =
    priceStorage({
      custom: 0, //NOTE: this frontend doesn't support custom data. If someone wants to add such, it should be done with scripts
      content: vals.content,
      thumb: vals.thumb,
      quality: vals.quality,
      ttl: vals.ttl,
    }) / icpCycles;

  return { transfer, ops, storage };
};

export const mint = (vals) => async (dispatch, getState) => {
  let s = getState();
  const key_nftstorage = s.user.key_nftstorage;

  let toastId = toast("", {
    isLoading: true,
    type: toast.TYPE.INFO,
    position: "bottom-right",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
  });

  if (
    (vals?.content[0]?.ipfs?.url || vals?.thumb?.ipfs?.url) &&
    !key_nftstorage?.length
  ) {
    dispatch(setNftStorageModal(true));
    return;
  }

  if (vals?.content[0]?.ipfs?.url) {
    toast.update(toastId, {
      render: "Uploading content...",
    });

    vals.content[0].ipfs.cid = await uploadIPFS(
      key_nftstorage,
      vals.content[0].ipfs.url
    );
  }

  if (vals?.thumb?.ipfs?.url) {
    toast.update(toastId, {
      render: "Uploading thumb...",
    });

    vals.thumb.ipfs.cid = await uploadIPFS(key_nftstorage, vals.thumb.ipfs.url);
  }

  let available = s.user.map.nft_avail;
  let slot = available[Math.floor(Math.random() * available.length)];

  let canisterId = PrincipalFromSlot(s.user.map.space, slot);

  let identity = authentication.client.getIdentity();

  let nft = nftCanister(canisterId, { agentOptions: { identity } });

  let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
    agentOptions: { identity },
  });

  let address = s.user.address;
  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  if (!address) throw Error("Annonymous cant mint"); // Wont let annonymous mint

  try {
    toast.update(toastId, {
      render: (
        <div>
          <div>Minting request sent.</div>
          <div style={{ fontSize: "10px" }}>Waiting for response...</div>
        </div>
      ),
    });

    console.log("mint vals", slot, vals);
    let mint = await pwr.nft_mint(BigInt(slot), {
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      metadata: vals,
    });

    if (mint?.err?.InsufficientBalance === null) {
      throw Error("Insufficient Balance");
    }
    console.log("REZ", mint);
    if (!("ok" in mint)) throw mint.err;

    let { tokenIndex, transactionId } = mint.ok;
    let id = tokenToText(encodeTokenId(slot, tokenIndex));

    if (vals?.content[0]?.internal?.url) {
      toast.update(toastId, {
        render: "Uploading content...",
      });
      await uploadFile(
        nft,
        tokenIndex,
        "content",
        await chunkBlob(vals.content[0].internal.url),
        subaccount
      );
    }

    if (vals?.thumb?.internal?.url) {
      toast.update(toastId, {
        render: "Uploading thumb...",
      });
      await uploadFile(
        nft,
        tokenIndex,
        "thumb",
        await chunkBlob(vals.thumb.internal.url),
        subaccount
      );
    }

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      isLoading: false,
      render: (
        <TransactionToast
          title="Minting successfull"
          tokenId={id}
          transactionId={transactionId}
        />
      ),
      autoClose: 9000,
      pauseOnHover: true,
    });
  } catch (e) {
    toast.update(toastId, {
      type: toast.TYPE.ERROR,
      isLoading: false,

      closeOnClick: true,

      render: (
        <TransactionFailed title="Minting failed" message={JSON.stringify(e)} />
      ),
      // autoClose: 9000,
    });

    console.error(e);
  }

  dispatch(refresh_balances());
};

export default nftSlice.reducer;
