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

print.loading("Reinstalling router");
await mgr.reinstall(router_id, "./old_build/router.wasm");

print.loading("Create local canisters");
await walletProxy(wallet, router).create_local_canisters();

print.loading("Set WASM");

await walletProxy(wallet, router).wasm_set({
  name: "nft",
  wasm: await file("./old_build/nft.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "account",
  wasm: await file("./old_build/account.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "pwr",
  wasm: await file("./old_build/pwr.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "history",
  wasm: await file("./old_build/history.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "anvil",
  wasm: await file("./old_build/anvil.wasm"),
});
await walletProxy(wallet, router).wasm_set({
  name: "treasury",
  wasm: await file("./old_build/treasury.wasm"),
});

// await walletProxy(wallet, router).wasm_set({
//   name: "tokenregistry",
//   wasm: await file("./old_build/tokenregistry.wasm"),
// });

print.loading("Run Reinstall");
await walletProxy(wallet, router).reinstall();

print.loading("Refuel");
await walletProxy(wallet, router).refuel();

print.loading("Start All");
await walletProxy(wallet, router).start_all();

print.done("DONE");
