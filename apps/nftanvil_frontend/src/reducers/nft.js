/* global BigInt */
import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
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
import { challenge, setNftSotrageModal } from "./user";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TokenIdentifier from "@vvv-interactive/nftanvil-tools/cjs/tokenidentifier.js";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";

import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import { toast } from "react-toastify";

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

  let { index, canister } = decodeTokenId(id);
  // console.log("FETCHING", { index, canister });
  let nftcan = nftCanister(canister, { agentOptions: { identity } });

  let resp = await nftcan.metadata(id);
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
    domain: data.domain[0],
    tags: data.tags,
    //vars
    cooldownUntil: vars.cooldownUntil[0],
    boundUntil: vars.boundUntil[0],
    sockets: vars.sockets.map((x) => TokenIdentifier.ArrayToText(x)),
    price: vars.price.toString(),
  };

  meta.transferable =
    meta.transfer.unrestricted === null ||
    (meta.transfer.bindsDuration && meta.boundUntil < now);

  if (meta.thumb.internal) meta.thumb.internal.url = tokenUrl(id, "thumb");
  if (meta.thumb.ipfs) meta.thumb.ipfs.url = ipfsTokenUrl(meta.thumb.ipfs.cid);

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
  if (meta.content?.ipfs)
    meta.content.ipfs.url = ipfsTokenUrl(meta.content.ipfs.cid);

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

  let { index, canister } = decodeTokenId(id);

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
    const blob = new Blob(
      chunks.map((chunk) => {
        return new Uint8Array(chunk[0]).buffer;
      }),
      { type: contentType }
    );

    return URL.createObjectURL(blob);
  });
};

export const buy =
  ({ id, intent }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;
    console.log("BUYING", id, intent);

    let ledger = ledgerCanister({ agentOptions: { identity } });

    let trez = await ledger.transfer({
      memo: 0,
      amount: { e8s: intent.price },
      fee: { e8s: 10000n },
      from_subaccount: [],
      to: intent.paymentAddress,
      created_at_time: [],
    });
    console.log("TREZ", trez);

    let claim = await nftcan.purchase_claim({
      token: id,
      user: { address: AccountIdentifier.TextToArray(address) },
    });

    console.log("CLAIM", claim);
    // let t = await nftcan.purchase_intent({
    //   user: { address: AccountIdentifier.TextToArray(address) },
    //   token: id,
    // });

    // if (!("ok" in t)) throw t;

    // return t.ok;
  };

export const purchase_intent =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: id,
    });

    if (!("ok" in t)) throw t;

    return t.ok;
  };

export const set_price =
  ({ id, price }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let e8s = BigInt(parseFloat(price) * 100000000);
    console.log("E8S", e8s);

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.set_price({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: id,
      price: e8s,
      subaccount: [],
    });

    if (!("ok" in t)) throw t;
  };

export const transfer =
  ({ id, toAddress }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.transfer({
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(toAddress) },
      token: id,
      amount: 1,
      memo: 0,
      subaccount: [],
    });
    if (!t.ok) throw t;
  };

export const plug =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(plug_id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.plug({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount: [],
      plug: plug_id,
      socket: socket_id,
    });
    if (t.ok !== null) throw t.err;
  };

export const unsocket =
  ({ plug_id, socket_id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(socket_id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let t = await nftcan.unsocket({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount: [],
      plug: plug_id,
      socket: socket_id,
    });
    if (t.ok !== null) throw t.err;
  };

export const burn =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    await nftcan.burn({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: id,
      amount: 1,
      memo: 0,
      subaccount: [],
    });
  };

export const use =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    await nftcan.use({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: id,
      memo: 0,
      subaccount: [],
    });
  };

export const transfer_link =
  ({ id }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let { index, canister } = decodeTokenId(id);

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let { key, hash } = generateKeyHashPair();

    let slot = await nftcan.transfer_link({
      from: { address: AccountIdentifier.TextToArray(address) },
      hash: Array.from(hash),
      token: id,
      amount: 1,
      subaccount: [],
    });
    slot = slot.ok;

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
    let { slot, tokenIndex, key } = decodeLink(code);
    let canister = await router.fetchNFTCan(slot);

    let identity = authentication.client.getIdentity();

    let nftcan = nftCanister(canister, { agentOptions: { identity } });
    let s = getState();

    let address = s.user.address;

    let id = encodeTokenId(canister, tokenIndex);

    let resp = await nftcan.claim_link({
      to: { address: AccountIdentifier.TextToArray(address) },
      key: Array.from(key),
      token: id,
    });

    return resp;
  };

export const nftEnterCode = (code) => async (dispatch, getState) => {
  let { slot, tokenIndex } = decodeLink(code);
  let canister = await router.fetchNFTCan(slot);

  let id = encodeTokenId(canister, tokenIndex);
  dispatch(push("/nft/" + id + "/" + code));
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
    dispatch(setNftSotrageModal(true));
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

  let available = await router.getAvailable();
  let canisterId = Principal.fromText(
    available[Math.floor(Math.random() * available.length)]
  );

  let identity = authentication.client.getIdentity();
  let nft = nftCanister(canisterId, { agentOptions: { identity } });

  let address = s.user.address;

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

    let mint = await nft.mintNFT({
      to: { address: AccountIdentifier.TextToArray(address) },
      metadata: vals,
    });

    if (mint?.err?.InsufficientBalance === null) {
      dispatch(challenge());
      throw Error("Insufficient Balance");
    }
    if (!("ok" in mint)) throw Error(JSON.stringify(mint.err));

    let tokenIndex = mint.ok;
    let tid = encodeTokenId(canisterId.toText(), tokenIndex);

    // Upload Internal
    if (vals?.content[0]?.internal?.url) {
      toast.update(toastId, {
        render: "Uploading content...",
      });
      await uploadFile(
        nft,
        tokenIndex,
        "content",
        await chunkBlob(vals.content[0].internal.url)
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
        await chunkBlob(vals.thumb.internal.url)
      );
    }

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      isLoading: false,
      render: (
        <div
          onClick={() => {
            dispatch(push("/nft/" + tid));
          }}
        >
          <div>Minting successfull.</div>
          <div style={{ fontSize: "10px" }}>{tid}</div>
        </div>
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
        <div>
          <div>Minting failed</div>
          <div style={{ fontSize: "10px" }}>{e.message}</div>
        </div>
      ),
      // autoClose: 9000,
    });

    console.error(e);
  }
};

export default nftSlice.reducer;
