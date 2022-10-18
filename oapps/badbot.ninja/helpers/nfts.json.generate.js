const x = require("../input.js");
const fs = require("fs");

let minted = JSON.parse(fs.readFileSync("./minted.json"));

let re = x
  .map((a, idx) => {
    //[id, quality, name, lore, attributes, tags]
    let id = minted[idx];
    if (!id) {
      console.log("not minted : skipping idx", idx);
      return false;
    }

    return [
      id,
      a.quality || 1,
      a.name,
      a.lore,
      a.attributes
        ? Object.keys(a.attributes).map((att) => {
            return [att, a.attributes[att]];
          })
        : [],
      a.tags || [],
    ];
  })
  .filter(Boolean);

fs.writeFileSync("./src/nfts.json", JSON.stringify(re));
