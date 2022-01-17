import { Principal } from "@dfinity/principal";
import { bytesArrayToNumber, numberToBytesArray } from "./data.js";
import basex from "base-x";

var bs = basex("0123456789abcdefghijkmnopqrstuvwxyz");

export function encode(can, idx) {
  let p = Principal.fromText(can);
  return [...p.toUint8Array(), ...numberToBytesArray(idx, 4)];
}

export function decode(tx) {
  let p = fromText(tx);
  let idx = bytesArrayToNumber(p.slice(-4));
  let can = Principal.fromUint8Array(p.slice(0, -4));
  return { can, idx };
}

export function toText(bytes) {
  return bs.encode(new Uint8Array([...bytes]));
}

export function fromText(t) {
  return bs.decode(t);
}
