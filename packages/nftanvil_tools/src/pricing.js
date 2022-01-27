const QUALITY_PRICE = 10000n; // max quality price per min
const STORAGE_KB_PER_MIN = 8n; // prices are in cycles
const AVG_MESSAGE_COST = 3000000n; // prices are in cycles
const FULLY_CHARGED_MINUTES = 8409600n; //(16 * 365 * 24 * 60) 16 years
const FULLY_CHARGED_MESSAGES = 5840n; // 1 message per day

export const priceStorage = ({ custom, content, thumb, quality, ttl }) => {
  // WARNING: Has to mirror motoko calulcations in nft_interface

  let cost_per_min = 0n;
  cost_per_min += BigInt(Math.ceil(custom / 1024)) * STORAGE_KB_PER_MIN;
  if (content?.internal)
    cost_per_min +=
      BigInt(Math.ceil(content.internal.size / 1024)) * STORAGE_KB_PER_MIN;
  if (thumb.internal)
    cost_per_min +=
      BigInt(Math.ceil(thumb.internal.size / 1024)) * STORAGE_KB_PER_MIN;
  cost_per_min += BigInt(Math.pow(quality, 2)) * QUALITY_PRICE;

  return cost_per_min * (ttl ? BigInt(ttl) : FULLY_CHARGED_MINUTES);
};

export const priceOps = ({ ttl }) => {
  return ttl
    ? AVG_MESSAGE_COST * 100n + (BigInt(ttl) * AVG_MESSAGE_COST) / 60n / 24n
    : FULLY_CHARGED_MESSAGES * AVG_MESSAGE_COST;
};