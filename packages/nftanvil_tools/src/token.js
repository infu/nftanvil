import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224";
import { Principal } from "@dfinity/principal";
import { toHexString, numberToBytesArray, bytesArrayToNumber } from "./data.js";
import { PrincipalFromSlot } from "./principal.js";
import basex from "base-x";

//var token_base = basex("0123456789abcdefghijkmnopqrstuvwxyz");
var token_base = basex("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ");

export const neuronStakeAccountIdentifier = (p, s) => {
  const padding = [
    12, 110, 101, 117, 114, 111, 110, 45, 115, 116, 97, 107, 101,
  ]; // Buffer("\x0Cneuron-stake");
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(p).toUint8Array(),
    ...getSubAccountArray(s),
  ]);
  const hash = sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([...checksum, ...hash]);
  return toHexString(array2);
};

export const principalToAccountIdentifier = (p, s) => {
  const padding = [10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100]; //Buffer("\x0Aaccount-id");
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(p).toUint8Array(),
    ...getSubAccountArray(s),
  ]);
  const hash = sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([...checksum, ...hash]);
  return toHexString(array2);
};

export const getSubAccountArray = (s) => {
  if (Array.isArray(s)) {
    return s.concat(Array(32 - s.length).fill(0));
  } else {
    return Array(28)
      .fill(0)
      .concat(to32bits(s ? s : 0));
  }
};

const to32bits = (num) => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
};
export const encodeTokenId = (slot, index) => {
  let t = (Number(slot) << 16) | Number(index);
  return t;
};

export const decodeTokenId = (t) => {
  t = Number(t);
  let slot = t >> 16;
  let index = t & 65535; // 16 bits
  return { slot, index };
};

export const tokenToText = (tid) => {
  if (tid === 0n || tid === 0) return false;
  let p = new Uint8Array([
    ...numberToBytesArray(getCrc32(numberToBytesArray(tid, 8)) & 65535, 2),
    ...numberToBytesArray(tid, 8),
  ]);

  return ("NFTA" + token_base.encode(p)).toLowerCase();
};

export const tokenFromText = (str) => {
  str = str.toUpperCase();
  if (str.slice(0, 4) !== "NFTA") return null;
  let p = [...token_base.decode(str.slice(4))];
  let t = bytesArrayToNumber(p.splice(-8));
  // console.log(
  //   str,
  //   t,
  //   decodeTokenId(t),
  //   encodeTokenId(5, 1),
  //   tokenToText(encodeTokenId(5, 1))
  // );
  return t;
};

// console.log(
//   4294967295,
//   tokenToText(4294967295),
//   tokenFromText(tokenToText(4294967295))
// );
// console.log(123, tokenToText(123), tokenFromText(tokenToText(123)));

// export const encodeTokenId = (principal, index) => {
//   const padding = Buffer("\x0Atid");
//   const array = new Uint8Array([
//     ...padding,
//     ...Principal.fromText(principal).toUint8Array(),
//     ...to32bits(index),
//   ]);
//   return Principal.fromUint8Array(array).toText();
// };

export const tokenFromBlob = (b) => {
  return Principal.fromUint8Array(b).toText();
};

// export const decodeTokenId = (tid) => {
//   var p = [...Principal.fromText(tid).toUint8Array()];
//   var padding = p.splice(0, 4);
//   if (toHexString(padding) !== toHexString(Buffer("\x0Atid"))) {
//     return {
//       index: 0,
//       canister: tid,
//       token: encodeTokenId(tid, 0),
//     };
//   } else {
//     return {
//       index: from32bits(p.splice(-4)),
//       canister: Principal.fromUint8Array(p).toText(),
//       token: tid,
//     };
//   }
// };

const from32bits = (ba) => {
  var value;
  for (var i = 0; i < 4; i++) {
    value = (value << 8) | ba[i];
  }
  return value;
};

const bitShiftLeft = (x, l) => {
  return (x << l) >>> 0;
};

const bitShiftRight = (x, l) => {
  return x >>> l;
};

const bitUnsignedFix = (x) => {
  return x >>> 0;
};

export const encodeChunkId = (tokenIndex, chunkIndex, ctype) => {
  let r = bitUnsignedFix(
    bitShiftLeft(tokenIndex, 16) |
      bitUnsignedFix(bitShiftRight(chunkIndex & 255, 2) | ctype)
  ); // 0 - content , 1 - thumb
  //console.log({ tokenIndex, chunkIndex, ctype }, r);
  return r;
};

export const ipfsTokenUrl = (cid) => {
  return "https://ipfs.io/ipfs/" + cid;
};

export const fungibleUrl = (map, tid) => {
  let key = tid.toString(16).padStart(5, 0); // bitUnsignedFix(bitShiftRight(tid, 16));

  let canister = PrincipalFromSlot(map.space, map.tokenregistry).toText();

  if (process.env.REACT_APP_LOCAL_BACKEND) {
    return "http://" + map.tokenregistry + ".lvh.me:8453/" + key;
  } else {
    return "https://" + canister + ".raw.ic0.app/" + key;
  }
};

export const tokenUrl = (space, tid, type) => {
  let { index, slot } = decodeTokenId(tid);
  let canister = PrincipalFromSlot(space, slot).toText();
  if (process.env.REACT_APP_LOCAL_BACKEND) {
    return (
      "http://" +
      slot +
      ".lvh.me:8453/" +
      encodeChunkId(index, 0, type === "content" ? 0 : 1).toString(16)
    );
  } else {
    return (
      "https://" +
      canister +
      ".raw.ic0.app/" +
      encodeChunkId(index, 0, type === "content" ? 0 : 1).toString(16)
    );
  }
};
