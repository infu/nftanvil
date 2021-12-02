import { bytesArrayToNumber, toHexString, fromHexString } from "./data";

export function TextToArray(x) {
  return fromHexString(x);
}

export function ArrayToText(x) {
  return toHexString(x);
}

export function e8sToIcp(x) {
  if (!x) return null;
  return (Number((BigInt(x) * 10000n) / 100000000n) / 10000).toFixed(4);
}

export function TextToSlot(aid, list) {
  return list[bytesArrayToNumber(fromHexString(aid).slice(0, 4)) % list.length];
}
