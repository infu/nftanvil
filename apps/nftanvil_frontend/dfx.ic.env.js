const path = require("path");
const fs = require("fs");

let prodCanisters;

try {
  prodCanisters = require(path.resolve(
    "..",
    "..",
    "packages",
    "nftanvil_canisters",
    "canister_ids.json"
  ));
} catch (error) {
  console.log("No production canister_ids.json found. Continuing with local");
}

const network = "ic";

let canisters = prodCanisters;
let txt = "";

for (const canister in canisters) {
  txt +=
    "REACT_APP_" +
    canister.toUpperCase() +
    "_CANISTER_ID=" +
    canisters[canister][network] +
    "\n";
}

// if (process.env.NODE_ENV !== "production")
//   txt += "REACT_APP_IDENTITY_PROVIDER=http://localhost:8000?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai\n";

fs.writeFileSync(".env.development.local", txt);
