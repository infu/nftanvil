import fs from "fs";
import _ from "lodash";
import chalk from "chalk";
import { Principal } from "@dfinity/principal";

import icblast, {
  fileIdentity,
  blast,
  file,
  internetIdentity, walletCall
} from "@infu/icblast";
import ora from "ora";

let spinner;

export const print = {
  
  notice: (t) => console.log(chalk.hex("#1d1096")("❄ ") + chalk.hex("#4f40df").bold(t)),
  warning: (t) => console.log(chalk.orange("⚠") + chalk.red.bold(t)),
  info: (t) => 
    console.log(chalk.hex("#7e08ec")("➜ ") + chalk.hex("#8d62fb").bold(t)),
  loading: (t) => {
    if (spinner) spinner.succeed();
    spinner = ora({ text:chalk.hex("#8d62fb").bold(t) }).start();
  },
  done: (t) => {
    if (spinner) spinner.succeed();
    console.log(chalk.hex("#00815e")(t));

  },
  msg: (t) => console.log(chalk.hex("#9b9a86")(t))
}

const toPrincipal = (tt) => {
  if (typeof tt == "string") return Principal.fromText(tt);
  return tt
};

export const dfx_canisters = () => {
  let local = JSON.parse(fs.readFileSync(".dfx/local/canister_ids.json"));
  let ic = JSON.parse(fs.readFileSync("./canister_ids.json"));
  return _.merge(local, ic);
};

export const canisterMgr = (aaa, wallet) => {
  return {
    upgrade: async (canister_id, wasm_path, mode = { upgrade: null }, arg = []) => {
      return walletCall(
        wallet,
        aaa,
        "install_code",
        0 // cycles to add
      )({
        arg,
        wasm_module: await file(wasm_path),
        canister_id: toPrincipal(canister_id),
        mode
      });
    },
  };
};



// export const walletCall =
//   (wallet, can, method, cycles = 0) =>
//   async (...arg) => {
//     let encoded = can[method + "$"](...arg);

//     let response = await wallet.wallet_call({
//       args: encoded,
//       cycles,
//       method_name: method,
//       canister: can.$principal,
//     });
//     if (!("Ok" in response)) throw response.Err;
//     return can["$" + method](response.Ok.return);
//   };

