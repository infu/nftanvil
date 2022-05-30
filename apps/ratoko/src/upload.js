import fs from "fs";
import fetch from "node-fetch";
import { createActor } from "./declarations/nft/index.js";

let canisters = JSON.parse(fs.readFileSync("./canister_ids.json"));
let meta = JSON.parse(fs.readFileSync("./meta.json"));
const host = "https://ic0.app";

const nft = createActor(canisters["nft"]["ic"], {
  agentOptions: { fetch, host },
});

for (let group in meta.groups) {
  for (let feature = 1; feature < meta.groups[group]; feature++) {
    let fn = "./build/svg/f" + group + "_" + feature + ".svg";
    let cnt = fs.readFileSync(fn, { encoding: "utf8" });

    await nft.set(1, 1, "hello");
    console.log(cnt);
  }
}
