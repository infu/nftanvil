const fs = require("fs");
const path = require("path");
const { Principal } = require("@dfinity/principal");
const {
  PrincipalFromIdx,
  PrincipalFromSlot,
  PrincipalToIdx,
} = require("@vvv-interactive/nftanvil-tools/cjs/principal.js");
const exec = require("child_process").exec;
const pLimit = require("p-limit");
const limit = pLimit(50);

let start = 17830671;
let end = 17836454;

const limitedCommands = async (arr) => {
  return await Promise.all(
    arr.map((a) => {
      return limit(() => execShellCommand(a));
    })
  );
};

const main = async () => {
  console.log("Fixing " + (end - start) + " canisters");

  let cmds = [];

  for (let i = start; i <= end; i++) {
    let c = PrincipalFromIdx(i);
    // console.log("canister " + (i - start), c.toText());
    cmds.push("./scripts/canister_set_controllers_prod.sh " + c.toText());
  }

  await limitedCommands(cmds);
};

main();

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log("CMD", cmd);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      console.log(stdout);
      resolve(stdout ? stdout : stderr);
    });
  });
}
