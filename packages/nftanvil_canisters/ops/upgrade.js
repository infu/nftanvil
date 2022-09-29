import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity,
} from "@infu/icblast";
import { print, dfx_canisters } from "./tools.js";
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

let canisters = dfx_canisters();

let ic = icblast({ local: true, identity });

let can = await ic(canisters.router.local);

let conf = await can.config_get();

console.log(conf);

print("Get config", "info");

print("Set proper config");

print("Upgrading router");

print("Stop All");

print("Set WASM");

print("Run Upgrade");

print("Start All");
