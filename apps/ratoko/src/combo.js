import fs from "fs";

let meta = JSON.parse(fs.readFileSync("./meta.json"));
let canisters = JSON.parse(fs.readFileSync("./canister_ids.json"));

const permanent = [1, 2, 4, 5, 7, 17];

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

const one = () => {
  let r = [];

  for (let group in meta) {
    let max = meta[group] + 1;
    let num = 0;
    if (permanent.indexOf(parseInt(group, 10)) !== -1)
      num = 1 + Math.floor(Math.random() * (max - 1));
    else num = Math.floor(Math.random() * max);

    r.push(num);
  }

  let hex = "00" + buf2hex(r);
  return hex;
};

let fin = [];

for (let i = 0; i < 20; i++) {
  let x = one();
  let url = `https://${canisters["nft"]["ic"]}.raw.ic0.app/` + x;

  console.log(url);
  let t = {
    quality: 0,
    name: "Ratoko test #" + i,
    lore: "Testing external SVG rendering",
    attributes: { attack: 9, defence: 0, airdrops: 0, harvest: 0, luck: 1 },
    authorShare: 100,
    content: url,
    thumb: url,
  };
  fin.push(t);
}

console.log(JSON.stringify(fin));
