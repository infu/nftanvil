let x = [
  ...Array(500)
    .fill(0)
    .map((x, idx) => {
      return {
        domain: "nftanvil.com/ratoko",
        quality: 0,
        tags: ["ticket", idx + 1 + "/500"],
        name: "Ratoko ticket",
        lore: "Zraham's sacred animal",
        authorShare: 100,
        ttl: 43200,
        rechargeable: false,
        content:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/ratoko_ticket.png",
        thumb:
          "https://ucoxm-piaaa-aaaai-qjrza-cai.raw.ic0.app/zraham/ratoko_ticket_thumb.jpeg",
      };
    }),
];

module.exports = x;
