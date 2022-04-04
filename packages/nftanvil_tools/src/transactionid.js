import { Principal } from "@dfinity/principal";
import { bytesArrayToNumber, numberToBytesArray } from "./data.js";
import basex from "base-x";

var bs = basex("812345679abcdefghijkmnopqrstuvwxyz");

export function encode(slot, idx) {
  // console.log("ENCODE", slot, idx);
  return [...numberToBytesArray(slot, 8), ...numberToBytesArray(idx, 4)];
}

export function decode(p) {
  //let p = fromText(tx);
  let idx = bytesArrayToNumber(p.slice(-4));
  let slot = bytesArrayToNumber(p.slice(0, -4));
  return { slot, idx };
}

export function toText(bytes) {
  return "tx" + bs.encode(new Uint8Array([...bytes]));
}

export function fromText(t) {
  return [...bs.decode(t.slice(2).toLowerCase())];
}
