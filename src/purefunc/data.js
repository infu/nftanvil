import basex from "base-x";
import { sha224 } from "@dfinity/principal/lib/esm/utils/sha224";

var BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var bs58 = basex(BASE58);

const bytesArrayToNumber = (a) => {
  let n = 0;
  for (let i = a.length - 1; i >= 0; i--) {
    n += Math.pow(256, a.length - i - 1) * a[i];
  }
  return n;
};

const numberToBytesArray = (n, size) => {
  const a = Array(size).fill(0);

  for (let i = 0; i < size; i++) {
    a[i] = n & 255;
    n = n >>> 8;
  }
  return new Uint8Array(a.reverse());
};

export const generateKeyHashPair = () => {
  var key = new Uint8Array(20);
  window.crypto.getRandomValues(key);
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

export const encodeArrayBuffer = (file) => Array.from(new Uint8Array(file));

export const jsonToNat8 = async (json) => {
  const bl = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  const buffer = await bl.arrayBuffer();
  const arr = encodeArrayBuffer(buffer);
  return arr;
};

export const chunkBlob = async (url) => {
  let blob = await fetch(url).then((x) => x.blob());
  let size = blob.size;
  let chunkSize = 1024 * 512;
  let chunks = Math.ceil(size / chunkSize);
  let r = [];
  for (let i = 0; i < chunks; i++) {
    r.push(blob.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return r;
};

export const blobPrepare = async (chunk) =>
  Array.from(new Uint8Array(await chunk.arrayBuffer()));

export const aid2acccan = (aid, acclist) => {
  return acclist[djb2xor(aid) % acclist.length];
};

export const djb2xor = (str) => {
  // The normal djb2 from Text.hash is hard to do in js because overflow looses precision
  let len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
};
