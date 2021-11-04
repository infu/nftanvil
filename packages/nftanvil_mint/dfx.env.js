const path = require("path");
const fs = require("fs");

let localCanisters, prodCanisters, frontendCanisters, frontendProdCanisters;

try {
  localCanisters = require(path.resolve(
    "..",
    "nftanvil_canisters",
    ".dfx",
    "local",
    "canister_ids.json"
  ));
} catch (error) {}

try {
  frontendCanisters = require(path.resolve(
    "..",
    "nftanvil_frontend",
    ".dfx",
    "local",
    "canister_ids.json"
  ));
} catch (error) {}

try {
  prodCanisters = require(path.resolve(
    "..",
    "nftanvil_canisters",
    "canister_ids.json"
  ));
} catch (error) {}

try {
  frontendProdCanisters = require(path.resolve(
    "..",
    "nftanvil_frontend",
    "canister_ids.json"
  ));
} catch (error) {}

const network =
  process.env.DFX_NETWORK ||
  (process.env.NODE_ENV === "production" ? "ic" : "local");

let canisters = network === "local" ? localCanisters : prodCanisters;
let canistersFrontend =
  network === "local" ? frontendCanisters : frontendProdCanisters;

let txt = "";

for (const canister in canisters) {
  txt +=
    canister.toUpperCase() + "_CANISTER=" + canisters[canister][network] + "\n";
}

for (const canister in canistersFrontend) {
  txt +=
    canister.toUpperCase() +
    "_CANISTER=" +
    canistersFrontend[canister][network] +
    "\n";
}
txt += "NODE_ENV=" + process.env.NODE_ENV + "\n";
fs.writeFileSync(".env", txt);
