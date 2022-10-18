import fs from "fs";
import fetch from "node-fetch";
import { createActor } from "./declarations/nft/index.js";
import pLimit from "p-limit";

const limit = pLimit(10); // Number of concurrent async requests. Don't get it too high or network may block you

let canisters = JSON.parse(fs.readFileSync("./canister_ids.json"));
let meta = JSON.parse(fs.readFileSync("./meta.json"));
const host = "https://ic0.app";

const nft = createActor(canisters["nft"]["ic"], {
  agentOptions: { fetch, host },
});

let req = [];
for (let group in meta.groups) {
  for (let feature = 1; feature < meta.groups[group] + 1; feature++) {
    group = parseInt(group, 10);
    let fn = "./build/svg/f" + group + "_" + feature + ".svg";
    let cnt = fs.readFileSync(fn, { encoding: "utf8" });
    req.push({ group, feature, cnt });
    // console.log({ group, feature, cnt });
    // await nft.set(group, feature, cnt);
  }
}

await Promise.all(
  req.map(({ group, feature, cnt }) => {
    return limit(async () => {
      console.log(group, feature, cnt.length);
      return nft.set(group, feature, cnt);
    });
  })
);

console.log("DONE");
