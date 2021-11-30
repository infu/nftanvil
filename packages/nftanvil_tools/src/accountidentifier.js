import { bytesArrayToNumber, toHexString, fromHexString } from "./data";

export function TextToArray(x) {
  return fromHexString(x);
}

export function ArrayToText(x) {
  return toHexString(x);
}

export function TextToSlot(aid, list) {
  return list[bytesArrayToNumber(fromHexString(aid).slice(0, 4)) % list.length];
}
