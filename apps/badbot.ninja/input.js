let x = [];

for (let i = 0; i < 100; i++) {
  x.push({
    quality: 0,
    tags: ["helmet " + i],
    name: "Leather of Lambskin",
    lore: "This leathery armor for the head provides protection to the head, but also reduces your ability to see",
    attributes: { attack: i, defence: 0, airdrops: 0, harvest: 0, luck: 1 },
    authorShare: 100,
    thumb: "./thumb.jpg",
  });
}

module.exports = x;
