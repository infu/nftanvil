import { Principal } from "@dfinity/principal";
import { bytesArrayToNumber, numberToBytesArray } from "./data";

export const PrincipalFromIdx = (idx) => {
  return Principal.fromUint8Array([...numberToBytesArray(idx, 8), 1, 1]);
};
export const PrincipalFromSlot = (space, idx) => {
  let start = Number(space[0][0]);
  return PrincipalFromIdx(start + Number(idx));
};

export const PrincipalToIdx = (p) => {
  let a = [...p.toUint8Array()].slice(0, -2);
  let idx = bytesArrayToNumber(a);
  return idx;
};

export const PrincipalToSlot = (space, p) => {
  let idx = PrincipalToIdx(p);
  let start = Number(space[0][0]);
  return idx - start;
};

// let can = "pfrbz-maaaa-aaaai-qcmiq-cai";

// console.log(can, PrincipalToIdx(Principal.fromText(can)));
