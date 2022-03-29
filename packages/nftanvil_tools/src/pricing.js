export const QUALITY_PRICE = 1000n; // max quality price per min
export const STORAGE_KB_PER_MIN = 8n; // prices are in cycles
export const AVG_MESSAGE_COST = 4000000n; // prices are in cycles
export const FULLY_CHARGED_MINUTES = 8409600n; //(16 * 365 * 24 * 60) 16 years
export const FULLY_CHARGED_MESSAGES = 5840n; // 1 message per day

export const priceStorage = ({ custom, content, thumb, quality, ttl }) => {
  // WARNING: Has to mirror motoko calulcations in nft_interface

  let cost_per_min = STORAGE_KB_PER_MIN * 100n;
  cost_per_min += (BigInt(custom) * STORAGE_KB_PER_MIN) / 1024n;

  if (content && content.internal)
    cost_per_min +=
      (BigInt(content.internal.size) * STORAGE_KB_PER_MIN) / 1024n;

  if (thumb && thumb.internal)
    cost_per_min += (BigInt(thumb.internal.size) * STORAGE_KB_PER_MIN) / 1024n;

  cost_per_min += BigInt(Math.pow(quality, 3)) * QUALITY_PRICE;

  return 2n * cost_per_min * (ttl ? BigInt(ttl) : FULLY_CHARGED_MINUTES);
};

export const priceOps = ({ ttl }) => {
  return (
    2n *
    (ttl
      ? AVG_MESSAGE_COST * 100n + (BigInt(ttl) * AVG_MESSAGE_COST) / 60n / 24n
      : FULLY_CHARGED_MESSAGES * AVG_MESSAGE_COST)
  );
};
