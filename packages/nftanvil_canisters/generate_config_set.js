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
let postproc = [];

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

  postproc.push({ name, slot });
}

for (let { name, slot } of postproc) {
  dfxd += config_set(name, slot);
  dfxd += oracle_set(name);
}

function config_set(name, slot) {
  return `dfx canister --wallet=$(dfx identity ${network_target} get-wallet) ${network_target} call ${name} config_set ${config(
    { slot }
  )} & \n`;
}

function oracle_set(name) {
  return `dfx canister --wallet=$(dfx identity ${network_target} get-wallet) ${network_target} call ${name} oracle_set ${oracle()} & \n`;
}

function oracle() {
  return `'(record {cycle_to_pwr = 0.000003703703703704})'`;
}

function config({ slot }) {
  return `'(record {
    nft= vec { ${cans["nft"].map((x) => `principal "${x}"`).join("; ")} };
    nft_avail = vec { ${cans["nft"]
      .map((x) => `principal "${x}"`)
      .join("; ")} };
    account= vec { ${cans["account"]
      .map((x) => `principal "${x}"`)
      .join("; ")} };
    pwr= principal "${cans["pwr"]}";
    anv= principal "${cans["anv"]}";
    history= principal "${cans["history"]}";
    treasury= principal "${cans["treasury"]}";
    router= principal "${cans["router"]}";
    slot=${slot}:nat;
  })'`;
}

fs.writeFileSync("./dfx_config_set.sh", dfxd);
