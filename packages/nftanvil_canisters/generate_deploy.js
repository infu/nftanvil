const fs = require("fs");
const path = require("path");

let clusterFile = path.resolve("..", "..", "cluster.json");
let cluster = JSON.parse(fs.readFileSync(clusterFile));
let dfxd = "cp dfx_deploy.json dfx.json\n";

let r = {
  canisters: {},
  defaults: {
    build: {
      args: "",
      packtool: "vessel sources",
    },
  },
  dfx: "0.8.3",
  networks: {
    local: {
      bind: "127.0.0.1:8000",
      type: "ephemeral",
    },
  },
  version: 1,
};
let ci = {};

r.canisters["anv"] = {
  main: "mo/anv.mo",
  type: "motoko",
};
dfxd += `dfx deploy --network ic anv\n`;

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
  )}"}; _accesslist= vec {"${cluster.access.join(
    '";"'
  )}"}; _slot=${idx}; _router= principal "${
    cluster.router[0]
  }"; _debug_cannisterId=null}'\n`;
});

cluster.account.forEach((x, idx) => {
  r.canisters["account_" + idx] = {
    main: "mo/account.mo",
    type: "motoko",
  };
  ci["account_" + idx] = { ic: x };
  dfxd += `dfx deploy --network ic account_${idx} --argument 'record {_router= principal "${cluster.router[0]}"}'\n`;
});

cluster.access.forEach((x, idx) => {
  r.canisters["access_" + idx] = {
    main: "mo/access.mo",
    type: "motoko",
  };
  ci["access_" + idx] = { ic: x };
  dfxd += `dfx deploy --network ic access_${idx} --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "${cluster.router[0]}"}' \n`;
});

fs.writeFileSync("./dfx_deploy.json", JSON.stringify(r));

fs.writeFileSync("./canister_ids.json", JSON.stringify(ci));

fs.writeFileSync("./dfx_deploy.sh", dfxd);
