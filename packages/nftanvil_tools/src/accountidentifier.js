import { bytesArrayToNumber, toHexString, fromHexString } from "./data";

export function TextToArray(x) {
  if (!x || !x.length) return null;
  return fromHexString(x);
}

export function ArrayToText(x) {
  return toHexString(x);
}

export function e8sToIcp(x) {
  if (!x) return null;
  return (Number((BigInt(x) * 10000n) / 100000000n) / 10000).toFixed(4);
}

export function icpToE8s(x) {
  try {
    return BigInt(Math.round(x * 100000000));
  } catch (e) {
    return 0n;
  }
}

export function createBigIntDecimal(dec) {
  return BigInt("1" + "".padStart(dec, 0));
}

export function placeDecimal(x, dec, precision) {
  if (!x) return null;
  if (precision > dec) precision = dec;
  let precisionTmp = createBigIntDecimal(precision);

  return (
    Number((BigInt(x) * precisionTmp) / createBigIntDecimal(dec)) /
    Number(precisionTmp)
  ).toFixed(precision);
}

export function removeDecimal(x, dec) {
  try {
    return BigInt(Math.round(x * Number(createBigIntDecimal(dec))));
  } catch (e) {
    return 0n;
  }
}

// PWR
export function e8sToPwr(x) {
  if (!x) return null;
  return (Number((BigInt(x) * 100n) / 100000n) / 100).toFixed(2);
}

export function pwrToE8s(x) {
  try {
    return BigInt(Math.round(x * 100000));
  } catch (e) {
    return 0n;
  }
}
// ANV

export function eToAnv(x) {
  if (!x) return null;
  return (Number((BigInt(x) * 10000n) / 100000000n) / 10000).toFixed(4);
}

export function anvToE(x) {
  try {
    return BigInt(Math.round(x * 100000000));
  } catch (e) {
    return 0n;
  }
}

// export function eToAnv(x) {
//   if (!x) return null;
//   return (Number((BigInt(x) * 100n) / 100000n) / 100).toFixed(2);
// }

// export function anvToE(x) {
//   try {
//     return BigInt(Math.round(x * 100000));
//   } catch (e) {
//     return 0n;
//   }
// }

export function TextToSlot(aid, range) {
  return (
    Number(range[0]) +
    (bytesArrayToNumber(fromHexString(aid).slice(-4)) %
      (1 + Number(range[1] - range[0])))
  );
}
