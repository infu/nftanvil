import basex from "base-x";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224";
import { Principal } from "@dfinity/candid/lib/cjs/idl";

var BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var bs58 = basex(BASE58);

export const bytesArrayToNumber = (a) => {
  let n = 0;
  for (let i = a.length - 1; i >= 0; i--) {
    n += Math.pow(256, a.length - i - 1) * a[i];
  }
  return n;
};

export const SerializableIC = (x) => {
  if (x === undefined || x === null) return x;
  if (typeof x === "bigint") return x.toString();
  if (ArrayBuffer.isView(x) || x instanceof ArrayBuffer)
    return [...x].map((y) => SerializableIC(y));

  if (Array.isArray(x)) {
    return x.map((y) => SerializableIC(y));
  }

  if (typeof x === "object") {
    if ("toText" in x) return x.toText();

    return Object.fromEntries(
      Object.keys(x).map((k) => {
        return [k, SerializableIC(x[k])];
      })
    );
  }
  return x;
};

export const BigIntToString = (x) => {
  if (typeof x === "bigint") return x.toString();
  if (Array.isArray(x)) {
    return x.map((y) => BigIntToString(y));
  }
  if (typeof x === "object")
    return Object.fromEntries(
      Object.keys(x).map((k) => {
        return [k, BigIntToString(x[k])];
      })
    );
  return x;
};

export const numberToBytesArray = (n, size) => {
  n = Number(n);
  // size in bytes
  const a = Array(size).fill(0);

  for (let i = 0; i < size; i++) {
    a[i] = n & 255;
    n = n >>> 8;
  }
  return new Uint8Array(a.reverse());
};

export const generateKeyHashPair = (getRandomValues = false) => {
  let key = getRandomValues
    ? getRandomValues(new Uint8Array(20))
    : window.crypto.getRandomValues(new Uint8Array(20));
  var hash = sha224(key);
  return { key, hash };
};

export const decodeLink = (code) => {
  let buf = bs58.decode(code);
  let slot = bytesArrayToNumber(buf.slice(0, 3));
  let tokenIndex = bytesArrayToNumber(buf.slice(3, 5));
  let key = buf.slice(5);
  return { slot, tokenIndex, key };
};

export const encodeLink = (slot, tokenIndex, key) => {
  let a = numberToBytesArray(slot, 3);
  let b = numberToBytesArray(tokenIndex, 2);
  let x = new Uint8Array([...a, ...b, ...key]);
  return bs58.encode(x);
};

export const bytesToBase58 = (bytes) => {
  return bs58.encode(new Uint8Array([...bytes]));
};

export const base58ToBytes = (x) => {
  return [...bs58.decode(x)];
};
export const encodeArrayBuffer = (file) => Array.from(new Uint8Array(file));

export const jsonToNat8 = async (json) => {
  const bl = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  const buffer = await bl.arrayBuffer();
  const arr = encodeArrayBuffer(buffer);
  return arr;
};

export const fromHexString = (hexString) =>
  hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));

export const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// export const toHexString = (byteArray) => {
//   return Array.from(byteArray, function (byte) {
//     return ("0" + (byte & 0xff).toString(16)).slice(-2);
//   }).join("");
// };

export const chunkBlob = async (url_or_blob) => {
  let blob;
  if (typeof url_or_blob === "string")
    blob = await fetch(url_or_blob).then((r) => r.blob());
  else blob = url_or_blob;

  let size = blob.size;
  let chunkSize = 1024 * 512;
  let chunks = Math.ceil(size / chunkSize);
  let r = [];
  for (let i = 0; i < chunks; i++) {
    r.push(blob.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return r;
};

export const err2text = (e) => {
  if (e === null || e === undefined) return e;
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (Object.keys(e).length === 1) {
    let key = Object.keys(e)[0];
    if (e[key] === null) return key;
    if (typeof e[key] === "string" || "toString" in e[key])
      return `${key}: ${e[key]}`;
    return key;
  }
};

export const blobPrepare = async (chunk) =>
  Array.from(new Uint8Array(await chunk.arrayBuffer()));

export const djb2xor = (str) => {
  // The normal djb2 from Text.hash is hard to do in js because overflow looses precision
  let len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
};

export const uploadFile = async (
  nft,
  tokenIndex,
  position,
  chunks,
  subaccount,
  tried = 0
) => {
  try {
    await Promise.all(
      chunks.map(async (chunk, idx) => {
        return nft.upload_chunk({
          subaccount,
          position: { [position]: null },
          chunkIdx: idx,
          tokenIndex,
          data: await blobPrepare(chunk),
        });
      })
    ).then((re) => {});
  } catch (e) {
    await delay(2000 + tried * 1000);

    if (tried < 3)
      return await uploadFile(
        nft,
        tokenIndex,
        position,
        chunks,
        subaccount,
        tried + 1
      );
    else throw e;
  }
};

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
