import * as AccountIdentifier from "./accountidentifier.js";

export const calcRate = (amountDec, { left, right, swap_fee }) => {
  let amount = Number(
    AccountIdentifier.removeDecimal(amountDec, left.decimals)
  );

  let rate_zero = Number(left.reserve) / Number(right.reserve);

  let rate = (Number(left.reserve) + Number(amount)) / Number(right.reserve);

  let afterfee = left.decimals === 0 ? amount : amount - amount * swap_fee;

  let price_change = rate_zero / rate;

  let recieve = afterfee / rate;
  if (right.decimals === 0) {
    recieve = recieve - recieve * swap_fee;
  }
  let give = amount;

  if (right.decimals === 0) {
    let whole = Math.round(recieve);
    let leftover = recieve - whole;
    if (leftover !== 0) {
      return calcRateRev(whole, { left, right, swap_fee });
    }
  }
  let give_decimal = give;
  let recieve_decimal = recieve;

  give =
    left.decimals > 0
      ? AccountIdentifier.placeDecimal(Math.round(give), left.decimals, 4)
      : give;

  recieve =
    right.decimals > 0
      ? AccountIdentifier.placeDecimal(Math.round(recieve), right.decimals, 4)
      : recieve;

  return {
    rate,

    give,
    recieve,
    price_change,
    give_decimal,
    recieve_decimal,
  };
};

export const calcRateRev = (amountDec, { left, right, swap_fee }) => {
  let recieve = Number(
    AccountIdentifier.removeDecimal(amountDec, right.decimals)
  );
  let rate_zero = Number(left.reserve) / Number(right.reserve);

  let rate = Number(left.reserve) / (Number(right.reserve) - Number(recieve));

  let price_change = rate_zero / rate;

  let give = recieve * rate;

  if (left.decimals !== 0) give += give * swap_fee;
  else give = Math.round(give);

  if (right.decimals !== 0) recieve -= recieve * swap_fee;

  let give_decimal = Math.round(give);
  let recieve_decimal = Math.round(recieve);

  give =
    left.decimals > 0
      ? AccountIdentifier.placeDecimal(Math.round(give), left.decimals, 4)
      : give;

  recieve =
    right.decimals > 0
      ? AccountIdentifier.placeDecimal(Math.round(recieve), right.decimals, 4)
      : recieve;

  return {
    rate,
    give,
    recieve,
    price_change,
    give_decimal,
    recieve_decimal,
  };
};
