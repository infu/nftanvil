const fs = require("fs");
const path = require("path");
const dev = process.env.NODE_ENV !== "production";

let canistersFile = path.resolve(
  dev ? "./.dfx/local/canister_ids.json" : "./canister_ids.json"
);

let dfxFile = path.resolve("./dfx.json");

let canisters;
try {
  canisters = JSON.parse(fs.readFileSync(canistersFile));
} catch (e) {
  canisters = {};
}
let dfx = JSON.parse(fs.readFileSync(dfxFile));

let cans = { nft: [], account: [] };
let dfxd = "#!/bin/sh\n\n";

const network_target = dev ? "" : "--network ic";

for (let name in dfx.canisters) {
  let id,
    slot = 0;

  try {
    id = canisters[name][dev ? "local" : "ic"];
  } catch (e) {
    console.log("Canister " + name + " not found in " + canistersFile);
  }

  let m = /(\w*)\_(\d+)/gm.exec(name);
  if (m) {
    let prefix = m[1];
    slot = m[2];
    if (!cans[prefix]) cans[prefix] = [];
    if (id) cans[prefix].push(id);
  } else {
    cans[name] = id ? id : "aaaaa-aa";
  }
}

for (let can in cans) {
  let subs = typeof cans[can] == "object";

  if (subs) {
    dfxd += `dfx generate ${can}_0\n`;
  } else {
    dfxd += `dfx generate ${can}\n`;
  }
}

fs.writeFileSync("./dfx_generate_idl.sh", dfxd);
