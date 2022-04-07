#!/usr/bin/env NODE_OPTIONS=--no-warnings node
import {
  easyMint,
  routerCanister,
  pwrCanister,
  nftCanister,
  accountCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  anvilCanister,
  claimBalance,
  can,
} from "@vvv-interactive/nftanvil";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import {
  chunkBlob,
  encodeLink,
  decodeLink,
  generateKeyHashPair,
  uploadFile,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import fs from "fs";
import mime from "mime";
import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import pLimit from "p-limit";
import getRandomValues from "get-random-values";
import { execSync } from "child_process";

const limit = pLimit(
  process.env.MINT_CONCURRENCY ? parseInt(process.env.MINT_CONCURRENCY, 10) : 20
); // Number of concurrent async requests. Don't get it too high or network may block you

console.log(
  figlet.textSync("NFTAnvil", {
    font: "Graffiti",
    horizontalLayout: "default",
    verticalLayout: "default",
  })
);

const burnEverything = async () => {
  let { address, subaccount } = await routerCanister();

  let map = await getMap();

  let acc = accountCanister(
    PrincipalFromSlot(
      map.space,
      AccountIdentifier.TextToSlot(address, map.account)
    )
  );

  for (let page = 0; page < 100; page++) {
    let res = await acc.list(AccountIdentifier.TextToArray(address), 0, 100);
    if (!res.length) return;

    await Promise.all(
      res.map((tid) => {
        return limit(async () => {
          if (tid == 0n) return;

          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);

          await nft.burn({
            memo: [],
            subaccount: [AccountIdentifier.TextToArray(subaccount)],
            token: tid,
            user: { address: AccountIdentifier.TextToArray(address) },
          });
        });
      })
    );
  }

  fs.writeFileSync("./minted.json", JSON.stringify({}));
};

const balanceAndAddress = async () => {
  let { address, subaccount } = await routerCanister();

  let map = await getMap();

  await claimBalance(address, subaccount); // if you sent ICP to that address it needs to be claimed

  let pwr = pwrCanister(
    PrincipalFromSlot(map.space, AccountIdentifier.TextToSlot(address, map.pwr))
  );

  let balance = await pwr.balance({
    user: { address: AccountIdentifier.TextToArray(address) },
  });

  console.log("Address", address);
  console.log(
    "Balance",
    AccountIdentifier.e8sToIcp(balance.pwr),
    "ICP",
    "(" + balance.pwr + " e8s)"
  );
};

//
const collectionIdlFactory = ({ IDL }) => {
  const Class = IDL.Service({
    add: IDL.Func([IDL.Nat64], [], []),
  });
  return Class;
};

const collectionCreateActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  return Actor.createActor(collectionIdlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

const saleAdd = async (NFT_FROM, NFT_TO) => {
  let { principal, address, subaccount } = await routerCanister();
  let SALES_PRINCIPAL = execSync(`dfx canister --network ic id collection`, {
    encoding: "UTF-8",
  }).trim();

  try {
    let chk = Principal.fromText(SALES_PRINCIPAL);
  } catch (e) {
    throw new Error(
      "Can't find collection contract principal. Make sure you are in the right directory with dfx.json and it has ic network deployment"
    );
  }

  // console.log(
  //   "Executing: ",
  //   `dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call collection set_admin 'principal "${principal}"'`
  // );

  execSync(
    `dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call collection set_admin 'principal "${principal}"'`,
    {
      encoding: "UTF-8",
    }
  );

  let TO_ADDRESS = principalToAccountIdentifier(SALES_PRINCIPAL);
  let collectionContract = can(collectionCreateActor, SALES_PRINCIPAL);
  let map = await getMap();
  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    console.log("minted.json not found");
    return;
  }

  let tokens = [];
  for (let i = NFT_FROM; i < NFT_TO; i++) {
    tokens.push(i);
  }

  let results = await Promise.all(
    tokens.map((i) =>
      limit(async () => {
        let tid = minted[i];
        if (!tid) {
          console.log("index", i, "missing from minted.json");
          return false;
        }

        try {
          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);

          let rez = await nft.transfer({
            subaccount: [AccountIdentifier.TextToArray(subaccount)],
            token: tid,
            from: { address: AccountIdentifier.TextToArray(address) },
            to: { address: AccountIdentifier.TextToArray(TO_ADDRESS) },
            memo: [],
          });

          if ("err" in rez) {
            console.log("Couldn't transfer nft", tid);
          }

          let srez = await collectionContract.add(tid);

          return true;
        } catch (e) {
          console.log(e);
          console.log("Failed adding to sale token", tid);
          return false;
        }
      })
    )
  );

  let ok = 0;
  let fail = 0;
  for (let [idx, re] of results.entries()) {
    let ridx = idx + NFT_FROM;
    if (re) ok++;
    else {
      fail++;
      console.log(ridx, "transfer failed");
    }
  }

  console.log(`DONE. ${fail} failed. ${ok} ok. `);
};

const transferMain = async (NFT_FROM, NFT_TO, TO_ADDRESS) => {
  let { address, subaccount } = await routerCanister();

  let map = await getMap();
  //  = JSON.parse(fs.readFileSync("./input.js"));
  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    console.log("minted.json not found");
    return;
  }

  let data = await new Promise((resolve, reject) => {
    import(path.resolve(process.cwd(), "./input.js")).then((importedModule) => {
      resolve(importedModule.default);
    });
  });

  if (!data) {
    console.log("No input.js invalid");
    return;
  }

  let tokens = [];
  for (let i = NFT_FROM; i < NFT_TO; i++) {
    tokens.push(i);
  }

  let results = await Promise.all(
    tokens.map((i) =>
      limit(async () => {
        let tid = minted[i];
        if (!tid) {
          console.log("index", i, "missing from minted.json");
          return false;
        }

        try {
          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);

          let rez = await nft.transfer({
            subaccount: [AccountIdentifier.TextToArray(subaccount)],
            token: tid,
            from: { address: AccountIdentifier.TextToArray(address) },
            to: { address: AccountIdentifier.TextToArray(TO_ADDRESS) },
            memo: [],
          });

          if ("err" in rez) throw rez.err;

          return true;
        } catch (e) {
          console.log(e);
          console.log("Failed creating gift for token", tid);
          return false;
        }
      })
    )
  );

  let ok = 0;
  let fail = 0;
  for (let [idx, re] of results.entries()) {
    let ridx = idx + NFT_FROM;
    if (re) ok++;
    else {
      fail++;
      console.log(ridx, "transfer failed");
    }
  }

  console.log(`DONE. ${fail} failed. ${ok} ok. `);
};

const checkUploads = async (NFT_FROM, NFT_TO) => {
  let { address, subaccount } = await routerCanister();

  let map = await getMap();
  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    console.log("minted.json not found");
    return;
  }

  let data = await new Promise((resolve, reject) => {
    import(path.resolve(process.cwd(), "./input.js")).then((importedModule) => {
      resolve(importedModule.default);
    });
  });

  if (!data) {
    console.log("No input.js invalid");
    return;
  }

  let tokens = [];
  for (let i = NFT_FROM; i < NFT_TO; i++) {
    tokens.push(i);
  }

  let results = await Promise.all(
    tokens.map((i) =>
      limit(async () => {
        let tid = minted[i];
        if (!tid) {
          console.log("Not minted");
          return false;
        }

        try {
          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);

          let rez = await nft.fetch_chunk({
            tokenIndex: index,
            position: { thumb: null },
            chunkIdx: 0,
            subaccount: [AccountIdentifier.TextToArray(subaccount)],
          });

          let found = rez[0];

          if (data[i].content) {
            ``;
            let rez2 = await nft.fetch_chunk({
              tokenIndex: index,
              position: { content: null },
              chunkIdx: 0,
              subaccount: [AccountIdentifier.TextToArray(subaccount)],
            });

            found = found && rez2[0];
          }

          if (!found) {
            await nft.burn({
              memo: [],
              subaccount: [AccountIdentifier.TextToArray(subaccount)],
              token: tid,
              user: { address: AccountIdentifier.TextToArray(address) },
            });

            delete minted[i];

            console.log(
              "Not found image data for token",
              tid,
              " burning and deleting"
            );
          }

          return true;
        } catch (e) {
          console.log(e);
          console.log("Failed checking uploads for token", tid);
          return false;
        }
      })
    )
  );

  let ok = 0;
  let fail = 0;
  for (let [idx, re] of results.entries()) {
    let ridx = idx + NFT_FROM;
    if (re) ok++;
    else {
      fail++;
      console.log(ridx, "checking upload failed");
    }
  }

  fs.writeFileSync("./minted.json", JSON.stringify(minted));

  console.log(`DONE. ${fail} failed. ${ok} ok. `);
};

const giftMain = async (NFT_FROM, NFT_TO) => {
  let { address, subaccount } = await routerCanister();
  let giftCodes = {};
  try {
    giftCodes = JSON.parse(fs.readFileSync("./giftcodes.json"));
  } catch (e) {}
  let map = await getMap();
  //  = JSON.parse(fs.readFileSync("./input.js"));
  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    console.log("minted.json not found");
    return;
  }

  let data = await new Promise((resolve, reject) => {
    import(path.resolve(process.cwd(), "./input.js")).then((importedModule) => {
      resolve(importedModule.default);
    });
  });

  if (!data) {
    console.log("No input.js invalid");
    return;
  }

  let tokens = [];
  for (let i = NFT_FROM; i < NFT_TO; i++) {
    tokens.push(i);
  }

  let results = await Promise.all(
    tokens.map((i) =>
      limit(async () => {
        let tid = minted[i];
        if (!tid) {
          console.log("index", i, "missing from minted.json");
          return "x";
        }

        try {
          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);

          let { key, hash } = generateKeyHashPair(getRandomValues);

          let rez = await nft.transfer_link({
            hash: Array.from(hash),
            subaccount: [AccountIdentifier.TextToArray(subaccount)],
            token: tid,
            from: { address: AccountIdentifier.TextToArray(address) },
          });
          if ("err" in rez) throw rez.err;

          let code = encodeLink(slot, index, key);
          return "nftanvil.com/" + code;
        } catch (e) {
          console.log(e);
          console.log("Failed creating gift for token", tid);
          return "-";
        }
      })
    )
  );

  for (let [idx, re] of results.entries()) {
    let ridx = idx + NFT_FROM;
    console.log("RE", ridx, re);
    giftCodes[ridx] = re;
  }

  fs.writeFileSync("./giftcodes.json", JSON.stringify(giftCodes));
  console.log("DONE. Saved in giftcodes.json");
};

const mintMain = async (NFT_FROM, NFT_TO) => {
  //  = JSON.parse(fs.readFileSync("./input.js"));

  let data = await new Promise((resolve, reject) => {
    import(path.resolve(process.cwd(), "./input.js")).then((importedModule) => {
      resolve(importedModule.default);
    });
  });

  if (!data) {
    console.log("No input.js invalid");
    return;
  }
  console.log("Input nfts count ", data.length);

  let nftids = {};

  try {
    nftids = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {}

  let targetStorage = "internal";

  // make checks
  const makeChecks = () => {
    let error = false;

    for (let i = NFT_FROM; i < NFT_TO; i++) {
      let s = data[i];

      if (!s) {
        error = true;
        console.log("missing " + i + " data ");
        continue;
      }
      if (s?.content && !fs.existsSync(s.content)) {
        error = true;
        console.log("missing " + i + " content file ");
      }
      if (!("thumb" in s)) {
        error = true;

        console.log("missing " + i + " thumb in meta");
      }
      if (!fs.existsSync(s.thumb)) {
        error = true;
        console.log(s);
        console.log("missing " + i + " thumb file ");
      }
    }

    if (error) process.exit();
  };

  makeChecks();

  console.log("Checks - OK");

  let { principal, address, subaccount } = await routerCanister();

  let map = await getMap();

  await balanceAndAddress();

  let items = [];

  for (let i = NFT_FROM; i < NFT_TO; i++) {
    let s = data[i];

    if (nftids[i]) {
      console.log(i + " has been minted already");
      items.push(null);
      continue;
    }

    let request = {
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
      metadata: {
        domain: "domain" in s ? [s.domain] : [],
        name: "name" in s ? [s.name] : [],
        lore: "lore" in s ? [s.lore] : [],
        quality: "quality" in s ? s.quality : 1,
        secret: "secret" in s ? s.secret : false,
        transfer: "transfer" in s ? s.transfer : { unrestricted: null },
        ttl: ["ttl" in s ? s.ttl : 1036800],
        content:
          "content" in s
            ? [
                {
                  internal: {
                    contentType: mime.getType(s.content),
                    path: s.content,
                  },
                },
              ]
            : [],
        thumb:
          "thumb" in s
            ? {
                internal: { contentType: mime.getType(s.thumb), path: s.thumb },
              }
            : null,
        attributes:
          "attributes" in s
            ? Object.keys(s.attributes)
                .map((x) => {
                  if (s.attributes[x] == 0) return false;
                  return [x, s.attributes[x]];
                })
                .filter(Boolean)
            : [],
        tags: "tags" in s ? s.tags : [],
        custom: "custom" in s ? s.custom : [],
        customVar: "customVar" in s ? s.customVar : [],
        authorShare: "authorShare" in s ? s.authorShare : 50,
        price:
          "price" in s
            ? s.price
            : { amount: 0, marketplace: [], affiliate: [] },
        rechargeable: "rechargeable" in s ? s.rechargeable : true,
      },
    };

    items.push(request);
  }

  try {
    let resp = await easyMint(items);
    for (let j = 0; j < resp.length; j++) {
      if (nftids[NFT_FROM + j]) continue;
      nftids[NFT_FROM + j] = resp[j];
    }
    fs.writeFileSync("./minted.json", JSON.stringify(nftids));
    console.log("RESP", resp);
  } catch (e) {
    console.log(e);
  }
};

const program = new Command();

program
  .name("nftanvil mint")
  .description(
    "CLI to mint with NFTAnvil.\nDon't run it multiple times asynchroneously"
  )
  .version("0.1.0");

program
  .command("address")
  .description("Check your address & balance")
  .action((options) => {
    balanceAndAddress();
  });

program
  .command("burn-everything")
  .description("Burn everything your address owns")
  .action((options) => {
    console.log("Burning...");
    burnEverything();
  });

program
  .command("mint")
  .description("Mint nfts from index to index")
  .argument("<number>", "from index")
  .argument("<number>", "to index")
  .action((from, to, options) => {
    console.log(`Minting from ${from} to ${to}`);
    mintMain(parseInt(from, 10), parseInt(to, 10));
  });

program
  .command("gift")
  .description("Creates gift links for nfts from index to index")
  .argument("<number>", "from index")
  .argument("<number>", "to index")
  .action((from, to, options) => {
    console.log(`Creating gift links from ${from} to ${to}`);
    giftMain(parseInt(from, 10), parseInt(to, 10));
  });

program
  .command("transfer")
  .description("Transfer nfts from index to index to another address")
  .argument("<number>", "from index")
  .argument("<number>", "to index")
  .argument("<string>", "address")
  .action((from, to, address, options) => {
    console.log(`Transferring nfts from ${from} - ${to} to ${address}`);
    transferMain(parseInt(from, 10), parseInt(to, 10), address);
  });

program
  .command("sale-add")
  .description("Transfer nfts to sales contract")
  .argument("<number>", "from index")
  .argument("<number>", "to index")
  .action((from, to, principal, options) => {
    console.log(`Adding to sale nfts from ${from} - ${to}`);
    saleAdd(parseInt(from, 10), parseInt(to, 10));
  });

program
  .command("check-uploads")
  .description("Checks if everything was uploaded and burns nft if not")
  .argument("<number>", "from index")
  .argument("<number>", "to index")
  .action((from, to, principal, options) => {
    console.log(`Checking uploads ${from} - ${to}`);
    checkUploads(parseInt(from, 10), parseInt(to, 10));
  });

program.parse();
