/* global BigInt */
import { createSlice } from "@reduxjs/toolkit";
import authentication from "../identities";
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
  SerializableIC,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import {
  priceStorage,
  priceOps,
} from "@vvv-interactive/nftanvil-tools/cjs/pricing.js";

import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";

import { user_refresh_balances, user_refresh_config } from "./user";

export const nftSlice = createSlice({
  name: "nft",
  initialState: {},
  reducers: {
    loaded: (state, action) => {
      let busy = state[action.payload.id]?.busy;
      state[action.payload.id] = action.payload.meta;
      if (busy) state[action.payload.id].busy = busy;
    },
    setBusy: (state, action) => {
      state[action.payload.id].busy = action.payload.busy;
    },
  },
});

export const { loaded, setBusy } = nftSlice.actions;

export const nft_fetch = (id) => async (dispatch, getState) => {
  if (!id) return;
  let s = getState();

  let tid = tokenFromText(id);

  let { index, slot } = decodeTokenId(tid);

  let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

  let nftcan = nftCanister(canister, {
    agentOptions: authentication.getAgentOptions(false),
  });

  let resp = await nftcan.metadata(tid);

  if (!resp) throw Error("Can't fetch NFT meta");
  if (resp.err)
    throw Error("Fetching NFT meta error " + JSON.stringify(resp.err));
  let { bearer, data, vars } = SerializableIC(resp.ok);
  let now = Math.ceil(Date.now() / 1000 / 60);

  let meta = {
    bearer: AccountIdentifier.ArrayToText(bearer),

    // inherant
    tokenIndex: index,
    canister,

    // data

    domain: data.domain[0],
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
    rechargeable: data.rechargeable,
  };

  meta.transferable =
    meta.transfer.unrestricted === null ||
    (meta.transfer.bindsDuration && meta.boundUntil < now);

  if (meta.thumb.internal)
    meta.thumb.internal.url = tokenUrl(s.ic.anvil.space, tid, "thumb");
  if (meta.thumb.ipfs) meta.thumb.ipfs.url = ipfsTokenUrl(meta.thumb.ipfs.cid);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  if (meta.content?.internal) {
    if (meta.secret)
      meta.content.internal.url = await nft_media_get(s, {
        id,
        contentType: meta.content.internal.contentType,
        size: meta.content.internal.size,
        position: "content",
        subaccount,
      });
    else meta.content.internal.url = tokenUrl(s.ic.anvil.space, tid, "content");
  }
  if (meta.content?.ipfs)
    meta.content.ipfs.url = ipfsTokenUrl(meta.content.ipfs.cid);

  dispatch(loaded({ id, meta }));
  return meta;
};

export const nft_media_get = async (
  s,
  { id, contentType, size, position, subaccount = false }
) => {
  let tid = tokenFromText(id);
  const address = s.nft[id].bearer;

  let { index, slot } = decodeTokenId(tid);
  let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

  let nftcan = nftCanister(canister, {
    agentOptions: authentication.getAgentOptions(address),
  });

  let src = await nft_fetch_file(
    nftcan,
    size,
    contentType,
    index,
    position,
    subaccount
  );

  return src;
};

const nft_fetch_file = async (
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
        return nft.fetch_chunk({
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
  ({
    address,
    payment_token,
    payment_token_kind,
    id,
    amount,
    affiliate = [],
  }) =>
  async (dispatch, getState) => {
    let s = getState();

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    // console.log("BUYING", id, amount);

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.ic.anvil.space,
        AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(address),
      }
    );
    let req = {
      payment_token,
      payment_token_kind,
      token: tid,
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      affiliate,
      amount,
    };
    console.log(req);
    let prez = await pwr.nft_purchase(BigInt(slot), req);

    if (prez.err) throw prez.err;

    dispatch(user_refresh_balances(address));
    dispatch(nft_fetch(id));
    // console.log("purchase result", prez);
  };

// export const nft_purchase_intent =
//   ({ id }) =>
//   async (dispatch, getState) => {
//     let s = getState();

//     let tid = tokenFromText(id);
//     let { slot } = decodeTokenId(tid);
//     //console.log("t", id, slot, tokenFromText(id));
//     let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

//     let nftcan = nftCanister(canister, {
//       agentOptions: authentication.getAgentOptions(address),
//     });

//     let address = s.user.address;
//     let subaccount = [
//       AccountIdentifier.TextToArray(s.user.subaccount) || null,
//     ].filter(Boolean);

//     let t = await nftcan.purchase_intent({
//       user: { address: AccountIdentifier.TextToArray(address) },
//       token: tokenFromText(id),
//       subaccount,
//     });

//     if (!("ok" in t)) throw t;

//     return t.ok;
//   };

export const nft_set_price =
  ({ id, price }) =>
  async (dispatch, getState) => {
    let s = getState();
    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);

    // console.log("Setting price", id, { slot });

    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);
    const req = {
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      price: price,
      subaccount,
    };
    let t = await nftcan.set_price(req);
    if (!("ok" in t)) throw t.err;
    dispatch(nft_fetch(id));
  };

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

export const nft_transfer =
  ({ id, toAddress }) =>
  async (dispatch, getState) => {
    dispatch(setBusy({ id, busy: true }));
    let s = getState();

    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let t = await nftcan
      .transfer({
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(toAddress) },
        token: tid,
        amount: 1,
        memo: [],
        subaccount,
      })
      .catch((err) => {
        return { err };
      });
    dispatch(setBusy({ id, busy: false }));

    if (!t.ok) throw t.err;
    let { transactionId } = t.ok;

    dispatch(nft_fetch(id));

    return t;
  };

export const nft_plug =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let s = getState();

    const address = s.nft[plug_id].bearer;

    let { slot } = decodeTokenId(tokenFromText(plug_id));
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let t = await nftcan.plug({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      plug: tokenFromText(plug_id),
      socket: tokenFromText(socket_id),
      memo: [],
    });
    if (!t.ok) throw t.err;
    dispatch(nft_fetch(plug_id));
    dispatch(nft_fetch(socket_id));
    return t.ok;
  };

export const nft_unsocket =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let s = getState();

    const address = s.nft[socket_id].bearer;

    let { slot } = decodeTokenId(tokenFromText(socket_id));
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let t = await nftcan.unsocket({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      plug: tokenFromText(plug_id),
      socket: tokenFromText(socket_id),
      memo: [],
    });
    if (!t.ok) throw t.err;
    dispatch(nft_fetch(plug_id));
    dispatch(nft_fetch(socket_id));
    return t.ok;
  };

export const nft_recharge =
  ({ id, amount }) =>
  async (dispatch, getState) => {
    let s = getState();
    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);

    // let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    // let nftcan = nftCanister(canister, { agentOptions: authentication.getAgentOptions(address) });

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.ic.anvil.space,
        AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(address),
      }
    );

    let t = await pwr.nft_recharge(slot, {
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      subaccount,
      amount,
    });

    if (t.err) throw t.err;

    dispatch(user_refresh_balances(address));
    dispatch(nft_fetch(id));
  };

export const nft_burn =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();
    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let rez = await nftcan.burn({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      amount: 1,
      memo: [],
      subaccount,
    });

    if (rez.err) throw rez.err;

    dispatch(user_refresh_balances(address));
    let { transactionId } = rez.ok;
    return rez.ok;
  };

export const nft_use =
  ({ id, use, memo }) =>
  async (dispatch, getState) => {
    let s = getState();

    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let r = await nftcan.use({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: tid,
      memo,
      use,
      subaccount,
      customVar: [],
    });

    if (!r.ok) throw r.err;
    dispatch(user_refresh_balances(address));
    dispatch(nft_fetch(id));
    return r.ok;
  };

export const nft_transfer_link =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();
    const address = s.nft[id].bearer;

    let tid = tokenFromText(id);
    let { index, slot } = decodeTokenId(tid);
    let canister = PrincipalFromSlot(s.ic.anvil.space, slot).toText();

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let { key, hash } = generateKeyHashPair();

    let rez = await nftcan.transfer_link({
      from: { address: AccountIdentifier.TextToArray(address) },
      hash: Array.from(hash),
      token: tid,
      subaccount,
    });
    if (rez.err) throw rez.err;

    let code = encodeLink(slot, index, key);

    return code;
  };

export const nft_claim_link =
  ({ address, code }) =>
  async (dispatch, getState) => {
    let s = getState();
    let { slot, tokenIndex, key } = decodeLink(code);

    let canister = PrincipalFromSlot(s.ic.anvil.space, slot);

    let nftcan = nftCanister(canister, {
      agentOptions: authentication.getAgentOptions(address),
    });

    let tid = encodeTokenId(slot, tokenIndex);

    let resp = await nftcan.claim_link({
      to: { address: AccountIdentifier.TextToArray(address) },
      key: Array.from(key),
      token: tid,
    });

    dispatch(nft_fetch(tokenToText(tid)));

    return resp;
  };

export const nft_enter_code = (code) => async (dispatch, getState) => {
  let s = getState();

  let { slot, tokenIndex } = decodeLink(code);

  if (!s.ic.anvil.space) throw Error("Map not loaded");

  let id = encodeTokenId(slot, tokenIndex);
  return "/" + tokenToText(id) + "/" + code;
};

export const nft_recharge_quote =
  ({ id }) =>
  async (dispatch, getState) => {
    let s = getState();
    const icpCycles = BigInt(s.ic.oracle.icpCycles);

    let nft = s.nft[id];

    const ops = priceOps({ ttl: null }) / icpCycles;

    const transfer = BigInt(s.ic.oracle.pwrFee);

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
    let diff = full - current + BigInt(s.ic.oracle.pwrFee); //+ 500000n
    if (diff < 30000n) diff = 0n;
    return diff;
  };

export const nft_mint_quote = (vals) => async (dispatch, getState) => {
  let s = getState();

  const icpCycles = BigInt(s.ic.oracle.icpCycles);
  const transfer = BigInt(s.ic.oracle.pwrFee);
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

export const nft_mint = (address, vals) => async (dispatch, getState) => {
  let s = getState();

  let available = s.ic.anvil.nft_avail;
  let slot = available[Math.floor(Math.random() * available.length)];

  console.log(available, slot);
  let canisterId = PrincipalFromSlot(s.ic.anvil.space, slot);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) || null,
  ].filter(Boolean);

  let nft = nftCanister(canisterId, {
    agentOptions: authentication.getAgentOptions(address),
  });

  let pwr = pwrCanister(
    PrincipalFromSlot(
      s.ic.anvil.space,
      AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
    ),
    {
      agentOptions: authentication.getAgentOptions(address),
    }
  );

  if (!address) throw Error("Annonymous cant mint"); // Wont let annonymous mint

  try {
    // console.log("mint vals", slot, vals);
    let mrez = await pwr.nft_mint(BigInt(slot), {
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
      metadata: vals,
    });

    if (mrez?.err?.OutOfMemory === null) {
      await dispatch(user_refresh_config());
      await dispatch(nft_mint(vals));
      return;
    }

    if (mrez?.err?.InsufficientBalance === null) {
      throw Error("Insufficient Balance");
    }
    // console.log("REZ", mrez);
    if (!("ok" in mrez)) throw Error(mrez.err);

    let { tokenIndex, transactionId } = mrez.ok;
    let id = tokenToText(encodeTokenId(slot, tokenIndex));

    if (vals?.content[0]?.internal?.url) {
      await uploadFile(
        nft,
        tokenIndex,
        "content",
        await chunkBlob(vals.content[0].internal.url),
        subaccount
      );
    }

    if (vals?.thumb?.internal?.url) {
      await uploadFile(
        nft,
        tokenIndex,
        "thumb",
        await chunkBlob(vals.thumb.internal.url),
        subaccount
      );
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  dispatch(user_refresh_balances(address));
};

export default nftSlice.reducer;
