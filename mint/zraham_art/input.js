let x = [
  ...Array(50)
    .fill(0)
    .map((x, idx) => {
      return {
        domain: "twitter.com/nftanvil/status/1517859055276068864",
        quality: 5,
        tags: ["concept art", idx + 1 + "/50"],
        name: "Zraham City - Ratcorn",
        lore: "It's like a unicorn, but better",
        authorShare: 100,
        content:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/z1.jpeg",
        thumb: "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/z1t.png",
      };
    }),
  ...Array(50)
    .fill(0)
    .map((x, idx) => {
      return {
        domain: "twitter.com/nftanvil/status/1517859055276068864",
        quality: 5,
        tags: ["concept art", idx + 1 + "/50"],
        name: "Zraham City - Neon Ratcorn",
        lore: "It's like a unicorn, but better",
        authorShare: 100,
        content:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/z2.jpeg",
        thumb: "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/z2t.png",
      };
    }),
  ...Array(50)
    .fill(0)
    .map((x, idx) => {
      return {
        domain: "twitter.com/nftanvil/status/1517859055276068864",
        quality: 5,
        tags: ["concept art", idx + 1 + "/50"],
        name: "Blacksmith - Peace And Hard Work",
        lore: "A man's gotta do what a man's gotta do",
        authorShare: 100,
        content:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/hard.jpeg",
        thumb:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/hard_thumb.jpeg",
      };
    }),
];

module.exports = x;
