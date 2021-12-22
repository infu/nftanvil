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

for (let name in dfx.canisters) {
  let id;
  try {
    id = canisters[name][dev ? "local" : "ic"];
  } catch (e) {
    console.log("Canister " + name + " not found in " + canistersFile);
  }
  let m = /(\w*)\_\d/gm.exec(name);
  if (m) {
    let prefix = m[1];
    if (!cans[prefix]) cans[prefix] = [];
    if (id) cans[prefix].push(id);
  } else {
    cans[name] = id ? id : "aaaaa-aa";
  }
}

const network_target = dev ? "" : "--network ic";
console.log(cans);
let dfxd = "";
//dfxd += `dfx deploy ${network_target} anv\n`;

dfxd += `dfx deploy ${network_target} router --argument '
record {
  _nft_canisters= vec { ${cans["nft"]
    .map((x) => `record {principal "${x}"; false}`)
    .join("; ")} };
  _account_canisters= vec { ${cans["account"]
    .map((x) => `principal "${x}"`)
    .join("; ")} };
  _pwr= principal "${cans["pwr"]}";
  _anv= principal "${cans["anv"]}";
  _collection= principal "${cans["collection"]}";
  _treasury= principal "${cans["treasury"]}";
}
'\n`;

for (let slot = 0; slot < cans["nft"].length; slot++) {
  dfxd += `dfx deploy ${network_target} nft_${slot} --argument '
record {
  _nft_canisters= vec { ${cans["nft"]
    .map((x) => `principal "${x}"`)
    .join("; ")} };
  _account_canisters= vec { ${cans["account"]
    .map((x) => `principal "${x}"`)
    .join("; ")} };
  _router= principal "${cans["router"]}";
  _pwr= principal "${cans["pwr"]}";
  _anv= principal "${cans["anv"]}";
  _collection= principal "${cans["collection"]}";
  _treasury= principal "${cans["treasury"]}";
  _slot=${slot}
}
'\n`;
}

//${idx ? "_" + idx : ""}
console.log("\n\n>>>", dfxd);
// cluster.nft.forEach((x, idx) => {
//   dfxd += `dfx deploy ${network_target} nft_${idx} --argument 'record {_acclist= vec {"${cluster.account.join(
//     '";"'
//   )}"};  _slot=${idx}; _router= principal "${
//     cluster.router[0]
//   }"; _debug_cannisterId=null}'\n`;
// });

// cluster.account.forEach((x, idx) => {
//   dfxd += `dfx deploy ${network_target} account_${idx} --argument 'record {_router= principal "${cluster.router[0]}"}'\n`;
// });

fs.writeFileSync("./dfx_deploy.sh", dfxd);
