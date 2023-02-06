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
print.notice("Anvil cluster upgrade treg");

print.notice("Script principal: " + identity.getPrincipal().toText());
let ic = icblast({ identity });
let aaa = await ic("aaaaa-aa", "ic");

let wallet = await ic("vlgg5-pyaaa-aaaai-qaqba-cai", "wallet");
let mgr = canisterMgr(aaa, wallet);

let canisters = dfx_canisters();
// let router_id = canisters.router.local;
let router_id = canisters.router.ic;
let router = await ic(router_id);

// print.loading("Get config");
// let conf = await router.config_get();

// ic = icblast({ identity });

// router = await ic(router_id);

// print.loading("Set proper config");
// await walletProxy(wallet, router).config_set(conf);

print.loading("Set WASM");

await walletProxy(wallet, router).wasm_set({
  name: "tokenregistry",
  wasm: await file("./build/tokenregistry.wasm"),
});

print.loading("Install new canisters");

await walletProxy(wallet, router).install_one({
  slot: 5005,
  wasm: { tokenregistry: null },
  mode: { upgrade: null },
});

print.loading("Start All");
await walletProxy(wallet, router).start_all();

print.done("DONE");
