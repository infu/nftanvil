import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity,
  walletProxy,
} from "@infu/icblast";
import { print, dfx_canisters, canisterMgr, delay } from "./tools.mjs";
import {
  PrincipalToIdx,
  PrincipalFromIdx,
} from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { TextToArray } from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { Principal } from "@dfinity/principal";
import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { exit } from "yarn-audit-fix";

// let identity = await internetIdentity();
let identity = await fileIdentity(0);
print.notice("Anvil cluster upgrade");

print.notice("Script principal: " + identity.getPrincipal().toText());
// let ic = icblast({ local: true, identity });
let ic = icblast({ identity });
let aaa = await ic("aaaaa-aa", "ic");

let wallet = await ic("vlgg5-pyaaa-aaaai-qaqba-cai", "wallet");
// let wallet = await ic("ryjl3-tyaaa-aaaaa-aaaba-cai", "wallet");
let mgr = canisterMgr(aaa, wallet);

let canisters = dfx_canisters();
// let router_id = canisters.router.local;
let router_id = canisters.router.ic;
let router = await ic(router_id);

// console.log(router_id);
// process.exit();

print.loading("Get config");
let conf = await router.config_get();

// modifying it here in case it losts its values
// conf.tokenregistry = 24;
// conf.tokenregistry = 5005;
//console.log(conf);

//process.exit();

// conf = {
//   nft: [0, 20],
//   pwr: [27, 29],
//   anvil: 26,
//   history: 30,
//   nft_avail: [0, 1, 2],
//   space: [[5, 54]],
//   tokenregistry: 24,
//   account: [21, 22],
//   history_range: [30, 50],
//   router: Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai"),
//   treasury: 25,
// };

print.loading("Upgrading router");
await mgr.upgrade(router_id, "./build/router.wasm");

// refresh router IDL after installing it
// ic = icblast({ local: true, identity });
ic = icblast({ identity });

router = await ic(router_id);

print.loading("Set proper config");
await walletProxy(wallet, router).config_set(conf);

// print.loading("Stop All");
// await walletProxy(wallet, router).stop_all();

print.loading("Set WASM");

await walletProxy(wallet, router).wasm_set({
  name: "nft",
  wasm: await file("./build/nft.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "account",
  wasm: await file("./build/account.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "pwr",
  wasm: await file("./build/pwr.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "history",
  wasm: await file("./build/history.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "anvil",
  wasm: await file("./build/anvil.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "treasury",
  wasm: await file("./build/treasury.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "tokenregistry",
  wasm: await file("./build/tokenregistry.wasm"),
});

print.loading("Install new canisters");
// await walletProxy(wallet, router).install_one({
//   slot: 24,
//   wasm: { tokenregistry: null },
//   mode: { install: null },
// });
// await walletProxy(wallet, router).install_one({
//   slot: 5005,
//   wasm: { tokenregistry: null },
//   mode: { install: null },
// });

print.loading("Run Upgrade");
await walletProxy(wallet, router).upgrade();

print.loading("Start All");
await walletProxy(wallet, router).start_all();

print.done("DONE");
