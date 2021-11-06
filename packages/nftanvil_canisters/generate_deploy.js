const fs = require("fs");
const path = require("path");

let clusterFile = path.resolve("..", "..", "cluster.json");
let cluster = JSON.parse(fs.readFileSync(clusterFile));
let dfxd = "";

let r = {
  canisters: {},
  defaults: {
    build: {
      args: "",
      packtool: "vessel sources",
    },
  },
  dfx: "0.8.2",
  networks: {
    local: {
      bind: "127.0.0.1:8000",
      type: "ephemeral",
    },
  },
  version: 1,
};
let ci = {};

cluster.router.forEach((x, idx) => {
  r.canisters["router" + (idx ? "_" + idx : "")] = {
    main: "mo/router.mo",
    type: "motoko",
  };
  ci["router" + (idx ? "_" + idx : "")] = { ic: x };
  dfxd += `dfx deploy --network ic router${idx ? "_" + idx : ""}\n`;
});

cluster.nft.forEach((x, idx) => {
  r.canisters["nft_" + idx] = {
    main: "mo/nft.mo",
    type: "motoko",
  };
  ci["nft_" + idx] = { ic: x };
  dfxd += `dfx deploy --network ic nft_${idx} --argument 'record {_acclist= vec {"${cluster.account.join(
    '";"'
  )}"}; _slot=${idx}; _accesscontrol_can="${"zhhlp-riaaa-aaaai-qa24q-cai"}"; _debug_cannisterId=null}'\n`;
});

cluster.account.forEach((x, idx) => {
  r.canisters["account_" + idx] = {
    main: "mo/account.mo",
    type: "motoko",
  };
  ci["account_" + idx] = { ic: x };
  dfxd += `dfx deploy --network ic account_${idx}\n`;
});

fs.writeFileSync("./dfx_deploy.json", JSON.stringify(r));

fs.writeFileSync("./canister_ids.json", JSON.stringify(ci));

fs.writeFileSync("./dfx_deploy.sh", dfxd);
