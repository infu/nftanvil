const fs = require("fs");
const { Principal } = require("@dfinity/principal");
const config = require("./config.js");
const {
  PrincipalFromIdx,
  PrincipalFromSlot,
  PrincipalToIdx,
} = require("@vvv-interactive/nftanvil-tools/cjs/principal.js");

console.log(config);

let dfx = {
  canisters: {},
  defaults: {
    build: {
      args: "",
      packtool: "vessel sources",
    },
  },
  dfx: "0.8.4",
  networks: {
    local: {
      bind: "127.0.0.1:8000",
      type: "ephemeral",
    },
  },
  version: 1,
};

let canister_ids = {};

const TOTAL_NFT = 3;
const TOTAL_ACCOUNT = 3;
const TOTAL_HISTORY = 1;

for (let i = 0; i < TOTAL_NFT; i++) {
  let slot = config.nft[0] + i;
  canister_ids["nft_" + i] = {
    ic: PrincipalFromSlot(config.space, slot).toText(),
  };
  dfx.canisters["nft_" + i] = {
    main: "mo/nft.mo",
    type: "motoko",
  };
  console.log("NFT SLOT", slot);
}

for (let i = 0; i < TOTAL_ACCOUNT; i++) {
  let slot = config.account[0] + i;
  canister_ids["account_" + i] = {
    ic: PrincipalFromSlot(config.space, slot).toText(),
  };
  dfx.canisters["account_" + i] = {
    main: "mo/account.mo",
    type: "motoko",
  };
  console.log("ACCOUNT SLOT", slot);
}

for (let i = 0; i < TOTAL_HISTORY; i++) {
  let slot = config.history_space[0] + i;
  canister_ids["history_" + i] = {
    ic: PrincipalFromSlot(config.space, slot).toText(),
  };
  dfx.canisters["history_" + i] = {
    main: "mo/history.mo",
    type: "motoko",
  };
  console.log("HISTORY SLOT", slot);
}

canister_ids["pwr"] = {
  ic: PrincipalFromSlot(config.space, config.pwr).toText(),
};

dfx.canisters["pwr"] = {
  main: "mo/pwr.mo",
  type: "motoko",
};

canister_ids["anv"] = {
  ic: PrincipalFromSlot(config.space, config.anv).toText(),
};

dfx.canisters["anv"] = {
  main: "mo/anv.mo",
  type: "motoko",
};

canister_ids["treasury"] = {
  ic: PrincipalFromSlot(config.space, config.treasury).toText(),
};

dfx.canisters["treasury"] = {
  main: "mo/treasury.mo",
  type: "motoko",
};

canister_ids["router"] = {
  ic: PrincipalFromSlot(config.space, config.router).toText(),
};

dfx.canisters["router"] = {
  main: "mo/router.mo",
  type: "motoko",
};

console.log(dfx);
console.log(canister_ids);

fs.writeFileSync("dfx.json", JSON.stringify(dfx));
fs.writeFileSync("canister_ids.json", JSON.stringify(canister_ids));
