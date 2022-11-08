import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity,
  walletProxy,
} from "@infu/icblast";
import { print, dfx_canisters, canisterMgr } from "./tools.mjs";

let identity = await fileIdentity(0);

print.notice("Script principal: " + identity.getPrincipal().toText());

let ic = icblast({ local: true, identity });
let aaa = await ic("aaaaa-aa", "ic");

let wallet = await ic("ryjl3-tyaaa-aaaaa-aaaba-cai", "wallet");
let mgr = canisterMgr(aaa, wallet);

let canisters = dfx_canisters();
let router_id = canisters.router.local;
let router = await ic(router_id);

print.loading("Refuel");
await walletProxy(wallet, router).refuel();

print.done("DONE");
