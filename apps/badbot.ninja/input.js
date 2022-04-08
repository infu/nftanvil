let x = [];

for (let i = 0; i < 100; i++) {
  x.push({
    // quality: 0,
    // tags: ["helmet " + i],
    name: "Leather of Lambskin #" + i,
    lore:
      "This leathery armor for the head provides protection to the head, but also reduces your ability to see #" +
      i,
    // attributes: { attack: i, defence: 0, airdrops: 0, harvest: 0, luck: 1 },
    // authorShare: 100,
    thumb: "./thumb.jpg",
    // content: i === 3 ? "./thumb.jpg" : null,
  });
}

module.exports = x;
