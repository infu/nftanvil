import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity,
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

console.log(identity.getPrincipal().toText());

let ic = icblast({ local: true, identity });
let aaa = ic("aaaaa-aa", "ic");
let wallet = await ic("vlgg5-pyaaa-aaaai-qaqba-cai", "wallet");

let mgr = canisterMgr(aaa, wallet);

let canisters = dfx_canisters();
let router_id = canisters.router.local;
let can = await ic(router_id);

let conf = await can.config_get();

console.log(conf);

print("Get config", "info");

print("Set proper config");

print("Upgrading router", "info");
mgr.upgrade(router_id, "../build/router.wasm");

print("Stop All");

print("Set WASM");

print("Run Upgrade");

print("Start All");
