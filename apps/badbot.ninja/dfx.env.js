const path = require("path");
const fs = require("fs");

let prodCanisters;

try {
  prodCanisters = require(path.resolve("canister_ids.json"));
} catch (error) {
  console.log("No production canister_ids.json found. Continuing with local");
}

const network = "ic";

let txt = "";

for (const canister in prodCanisters) {
  txt +=
    "REACT_APP_" +
    canister.toUpperCase() +
    "_CANISTER_ID=" +
    prodCanisters[canister][network] +
    "\n";
}

fs.writeFileSync(".env.local", txt);
