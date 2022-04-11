const path = require("path");
const fs = require("fs");

let canFile;
const network = process.env.NETWORK === "local" ? "local" : "ic";

try {
  if (network === "local") {
    canFile = require(path.resolve("./.dfx/local/", "canister_ids.json"));
  } else {
    canFile = require(path.resolve("canister_ids.json"));
  }
} catch (error) {
  console.log("No canister_ids.json found");
  process.exit();
}

let txt = "";
for (const canister in canFile) {
  txt +=
    "REACT_APP_" +
    canister.toUpperCase() +
    "_CANISTER_ID=" +
    canFile[canister][network] +
    "\n";
}

const getLocalId = (name) => {
  let canFile = require(path.resolve(
    "../../packages/nftanvil_canisters/.dfx/local/",
    "canister_ids.json"
  ));
  return canFile[name]["local"];
};

if (network === "local") {
  txt += "REACT_APP_LOCAL_BACKEND=true\n";
  txt += "REACT_APP_IC_GATEWAY=http://localhost:3022\n";
  txt += "REACT_APP_ROUTER_CANISTER_ID=" + getLocalId("router") + "\n";
  txt +=
    "REACT_APP_IDENTITY_PROVIDER=http://localhost:8000?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai\n";
}

fs.writeFileSync(".env.local", txt);
