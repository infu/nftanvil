import { Principal } from "@dfinity/principal";
import { bytesArrayToNumber, numberToBytesArray } from "./data.js";

export function encode(can, idx) {
  let p = Principal.fromText(can);
  return [...p.toUint8Array(), ...numberToBytesArray(idx, 4)];
}

export function decode(tx) {
  let p = Principal.fromText(tx).toUint8Array();
  let idx = bytesArrayToNumber(p.slice(-4));
  let can = Principal.fromUint8Array(p.slice(0, -4));
  return { can, idx };
}

export function toText(x) {
  return Principal.fromUint8Array(x).toText();
}
