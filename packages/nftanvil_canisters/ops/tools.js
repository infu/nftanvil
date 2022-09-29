import fs from "fs";
import _ from "lodash";
import chalk from "chalk";

export const print = (t, type = false) => {
  switch (type) {
    case "warning":
      console.log(chalk.orange("⚠") + chalk.red.bold(t));
    case "info":
      console.log(chalk.hex("#7e08ec")("➜ ") + chalk.hex("#8d62fb").bold(t));
    default:
      console.log(chalk.hex("#9b9a86")(t));
  }
};

export const dfx_canisters = () => {
  let local = JSON.parse(fs.readFileSync(".dfx/local/canister_ids.json"));
  let ic = JSON.parse(fs.readFileSync("./canister_ids.json"));
  return _.merge(local, ic);
};
