const fs = require("fs");
const path = require("path");
const dev = process.env.NODE_ENV !== "production";
const { Principal } = require("@dfinity/principal");
const {
  PrincipalFromIdx,
  PrincipalFromSlot,
  PrincipalToIdx,
} = require("@vvv-interactive/nftanvil-tools/cjs/principal.js");

// const ic_config = require("./config.js");

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
let pidxs = [];

let acc_from = 9999999999;
let acc_to = -1;
let nft_from = 9999999999;
let nft_to = -1;
let history_from = 9999999999;
let history_to = -1;
let conf = {};

for (let name in dfx.canisters) {
  let id;

  try {
    id = canisters[name][dev ? "local" : "ic"];
  } catch (e) {
    console.log("Canister " + name + " not found in " + canistersFile);
  }
  let p = Principal.fromText(id);
  let pidx = PrincipalToIdx(p);

  let m = /(\w*)\_(\d+)/gm.exec(name);
  if (m) {
    let prefix = m[1];
    slot = m[2];
    if (prefix === "nft") {
      if (pidx <= nft_from) nft_from = pidx;
      if (pidx >= nft_to) nft_to = pidx;
    }
    if (prefix === "account") {
      if (pidx <= acc_from) acc_from = pidx;
      if (pidx >= acc_to) acc_to = pidx;
    }
    if (prefix === "history") {
      if (pidx <= history_from) history_from = pidx;
      if (pidx >= history_to) history_to = pidx;
    }
  } else {
    conf[name] = pidx;
  }

  pidxs.push(pidx);
  postproc.push({ name, slot: pidx });
}

pidxs = pidxs.sort((a, b) => a - b);
let range_start = pidxs[0];
let range_end = pidxs[pidxs.length - 1];

conf.nft = [nft_from, nft_to];
conf.account = [acc_from, acc_to];
conf.space = [[range_start, range_end]];
conf.nft_avail = [];
conf.history = history_to;
for (let i = nft_from; i <= nft_to; i++) {
  conf.nft_avail.push(i);
}

const LATEST_HISTORY_IDX = 0;

console.log(conf);

for (let { name, slot } of postproc) {
  dfxd += config_set(name);
  dfxd += oracle_set(name);
}

function config_set(name) {
  return `dfx canister --wallet=$(dfx identity ${network_target} get-wallet) ${network_target} call ${name} config_set ${config()} & \n`;
}

function oracle_set(name) {
  return `dfx canister --wallet=$(dfx identity ${network_target} get-wallet) ${network_target} call ${name} oracle_set ${oracle()} & \n`;
}

function oracle() {
  return `'(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})'`;
}

function config() {
  let r = `'(record {
    nft= record { ${conf.nft[0] - range_start}:nat64; ${
    conf.nft[1] - range_start
  }:nat64 };
    nft_avail = vec { ${conf["nft_avail"]
      .map((x) => ` ${x - range_start}:nat64`)
      .join("; ")} };
    account= record { ${conf.account[0] - range_start}:nat64; ${
    conf.account[1] - range_start
  }:nat64 };
    pwr= ${conf["pwr"] - range_start}:nat64;
    anv= ${conf["anv"] - range_start}:nat64;
    history= ${conf["history"] - range_start}:nat64;
    treasury= ${conf["treasury"] - range_start}:nat64;
    router=  ${conf["router"] - range_start}:nat64;
    space= vec { vec {${conf.space[0][0]}:nat64; ${conf.space[0][1]}:nat64 }}
  })'`;

  return r;
}

fs.writeFileSync("./dfx_config_set.sh", dfxd);
