import fs from "fs";

let meta = JSON.parse(fs.readFileSync("./meta.json"));
let canisters = JSON.parse(fs.readFileSync("./canister_ids.json"));

const map = [
  //poor
  {
    1: 100,
    2: 100,
    3: 100,
    4: 100,
    5: 100,
    7: 100,
    16: 90,
    17: 100,
    12: 20,
    11: 30,
  },
  //common
  {
    1: 100,
    2: 100,
    3: 100,
    4: 100,
    5: 100,
    7: 100,
    16: 90,
    17: 100,
    12: 20,
    11: 30,
  },
  //uncommon
  {
    1: 100,
    2: 100,
    3: 90,
    4: 100,
    5: 100,
    7: 100,
    16: 80,
    17: 100,
    12: 20,
    11: 30,
  },

  //rare
  {
    1: 100,
    2: 100,
    3: 70,
    4: 100,
    5: 100,
    7: 100,
    16: 50,
    17: 100,
    12: 20,
    11: 30,
  },

  //epic
  {
    1: 100,
    2: 100,
    3: 0,
    4: 100,
    5: 100,
    7: 100,
    16: 0,
    17: 100,
    12: 20,
    11: 30,
  },

  //legendary
  {
    1: 100,
    2: 100,
    3: 0,
    4: 100,
    5: 100,
    7: 100,
    16: 0,
    17: 100,
    12: 20,
    11: 30,
  },

  //artifact
  {
    1: 100,
    2: 100,
    3: 0,
    4: 100,
    5: 100,
    7: 100,
    16: 0,
    17: 100,
    12: 20,
    11: 30,
  },
];

const qa = [4000, 3000, 1350, 1000, 400, 200, 50];

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

const one = (quality = 6) => {
  let r = [];

  for (let group in meta.groups) {
    let g = parseInt(group, 10);
    let max = meta.groups[group] + 1;

    let my = map[quality];
    let visibleChance = my[g] || 50;

    let visible = Math.round(Math.random() * 100) <= visibleChance;

    if (!visible) {
      r.push(0);
    } else {
      let chosen = 0;
      if (g == 17) chosen = quality + 1;
      else chosen = 1 + Math.floor(Math.random() * (max - 1));
      r.push(chosen);
    }
  }
  // console.log(r);
  let hex = "00" + buf2hex(r);
  return hex;
};

let fin = [];
let nftnumber = 1;
for (let [quality, amount] of qa.entries())
  for (let i = 0; i < amount; i++) {
    let x = one(quality);
    let url = `https://${canisters["nft"]["ic"]}.raw.ic0.app/` + x;

    // console.log(url);
    let t = {
      quality: quality,
      name: "Ratoko",
      tags: ["#" + nftnumber],
      //lore: "Testing external SVG rendering",
      //attributes: { attack: 9, defence: 0, airdrops: 0, harvest: 0, luck: 1 },
      authorShare: 100,
      content: url,
      thumb: url,
    };
    nftnumber++;
    fin.push(t);
  }

let str = "let x = " + JSON.stringify(fin) + " ; \n export default x;";

fs.writeFileSync("./input.js", str);
