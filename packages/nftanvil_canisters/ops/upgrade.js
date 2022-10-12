import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity,
  walletProxy,
} from "@infu/icblast";
import { print, dfx_canisters, canisterMgr } from "./tools.js";
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

// let identity = await internetIdentity();
let identity = await fileIdentity(0);
print.notice("Anvil cluster upgrade");

print.notice("Script principal: " + identity.getPrincipal().toText());

let ic = icblast({ local: true, identity });
let aaa = await ic("aaaaa-aa", "ic");

let wallet = await ic("ryjl3-tyaaa-aaaaa-aaaba-cai", "wallet");
let mgr = canisterMgr(aaa, wallet);

let canisters = dfx_canisters();
let router_id = canisters.router.local;
let router = await ic(router_id);

print.loading("Get config");
let conf = await router.config_get();
// console.log(conf);

conf = {
  nft: [0n, 20n],
  pwr: [27n, 29n],
  anvil: 26n,
  history: 30n,
  nft_avail: [0n, 1n, 2n],
  space: [[3n, 52n]],
  account: [21n, 22n],
  history_range: [30n, 50n],
  tokenregistry: 24, //5005
  router: Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai"),
  treasury: 25n,
};

print.loading("Set proper config");

await walletProxy(wallet, router).config_set(conf);

print.loading("Upgrading router");
await mgr.upgrade(router_id, "./build/router.wasm");

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

print.loading("Run Upgrade");
await walletProxy(wallet, router).upgrade();

print.loading("Start All");
await walletProxy(wallet, router).start_all();

print.done("DONE");
