const path = require("path");
const fs = require("fs");

let localCanisters, prodCanisters;

try {
  localCanisters = require(path.resolve(
    "..",
    "nftanvil_canisters",
    ".dfx",
    "local",
    "canister_ids.json"
  ));
} catch (error) {
  console.log("No local canister_ids.json found. Continuing production");
}

try {
  prodCanisters = require(path.resolve(
    "..",
    "nftanvil_canisters",
    "canister_ids.json"
  ));
} catch (error) {
  console.log("No production canister_ids.json found. Continuing with local");
}

const network =
  process.env.DFX_NETWORK ||
  (process.env.NODE_ENV === "production" ? "ic" : "local");

let canisters = network === "local" ? localCanisters : prodCanisters;
let txt = "";

for (const canister in canisters) {
  txt +=
    "REACT_APP_" +
    canister.toUpperCase() +
    "_CANISTER_ID=" +
    canisters[canister][network] +
    "\n";
}

if (process.env.NODE_ENV !== "production")
  txt +=
    "REACT_APP_IDENTITY_PROVIDER=http://localhost:8000?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai\n";

fs.writeFileSync(
  ".env." +
    (process.env.NODE_ENV === "production" ? "production" : "development") +
    ".local",
  txt
);
