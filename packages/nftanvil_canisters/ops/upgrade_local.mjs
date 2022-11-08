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

print.loading("Upgrading router");
await mgr.upgrade(router_id, "./build/router.wasm");

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
