import path from "path";
import fs from "fs";

let localCanisters, prodCanisters, frontendCanisters, frontendProdCanisters;

const rfile = (fn) => {
  return JSON.parse(fs.readFileSync(fn));
};

try {
  localCanisters = rfile(
    path.resolve(
      "..",
      "..",
      "packages",
      "nftanvil_canisters",
      ".dfx",
      "local",
      "canister_ids.json"
    )
  );
} catch (error) {}

try {
  frontendCanisters = rfile(
    path.resolve(
      "..",
      "nftanvil_frontend",
      ".dfx",
      "local",
      "canister_ids.json"
    )
  );
} catch (error) {}

try {
  prodCanisters = rfile(
    path.resolve(
      "..",
      "..",
      "packages",
      "nftanvil_canisters",
      "canister_ids.json"
    )
  );
} catch (error) {}

try {
  frontendProdCanisters = rfile(
    path.resolve("..", "nftanvil_frontend", "canister_ids.json")
  );
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
txt += "FRONTEND_CANISTER=5rttq-yqaaa-aaaai-qa2ea-cai\n";
txt += "NODE_ENV=" + process.env.NODE_ENV + "\n";

fs.writeFileSync(".env", txt);
