#!/usr/bin/env node
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
  bytesToBase58,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import fs from "fs";
import mime from "mime";
import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import pLimit from "p-limit";
import getRandomValues from "get-random-values";
import { execSync } from "child_process";
import prompts from "prompts";
import { blobFrom } from "fetch-blob/from.js";

import fetch from "node-fetch";

import colors from "colors";

const limit = pLimit(
  process.env.MINT_CONCURRENCY ? parseInt(process.env.MINT_CONCURRENCY, 10) : 40
); // Number of concurrent async requests. Don't get it too high or network may block you

console.log(
  figlet.textSync("NFTAnvil", {
    font: "Graffiti",
    horizontalLayout: "default",
    verticalLayout: "default",
  }).magenta
);

const recover = async (opts) => {
  let { address, subaccount, proxyCanister } = await ifProxy(opts.proxy);

  let map = await getMap();
  //console.log("MAP", map);
  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    minted = {};
    console.log("minted.json not found");
  }

  let minted_ids = Object.values(minted).map((x) => BigInt(x));

  let data = (
    await new Promise((resolve, reject) => {
      import(path.resolve(process.cwd(), "./input.js")).then(
        (importedModule) => {
          resolve(importedModule.default);
        }
      );
    })
  ).map(inputToMeta);

  let acc = accountCanister(
    PrincipalFromSlot(
      map.space,
      AccountIdentifier.TextToSlot(address, map.account)
    )
  );

  let forMatching = [];
  let good = 0;
  let emptyPages = 0;

  for (let page = 0; page < 1000; page++) {
    let res = await acc.list(
      AccountIdentifier.TextToArray(address),
      page * 100,
      (page + 1) * 100
    );

    res = res.filter((x) => x != 0n);

    for (let nft_id of res) {
      if (minted_ids.indexOf(nft_id) !== -1) {
        good++;
      } else {
        console.log(
          "Not found in minted.json",
          nft_id,
          "https://nftanvil.com/" + tokenToText(nft_id)
        );
        forMatching.push(nft_id);
      }
    }

    if (res.length === 0) emptyPages++;
    if (emptyPages > 20) break;
  }

  forMatching = [...new Set(forMatching)]; // unique ids

  console.log(
    `We have found ${good} ok nfts with id in minted.json and ${forMatching.length} nfts without id in minted.json`
      .cyan
  );
  if (forMatching.length === 0) return;

  let confirm = await prompts({
    type: "confirm",
    name: "value",
    message: `Do you want to try to recover ${forMatching.length} nfts ?`,
    initial: false,
  });

  if (!confirm.value) return;
  console.log("Recovering...");

  let recovered = 0;
  await Promise.all(
    forMatching.map((tid) => {
      return limit(async () => {
        if (tid == 0n) return;

        let { index, slot } = decodeTokenId(tid);

        let canister = PrincipalFromSlot(map.space, slot).toText();

        let nft = nftCanister(canister);

        try {
          let meta = await nft.metadata(tid);
          let name = meta.ok.data.name[0];
          let lore = meta.ok.data.lore[0];
          let quality = meta.ok.data.quality;
          let tags = meta.ok.data.tags.join(",");

          for (let [idx, v] of data.entries()) {
            if (
              !minted[idx] &&
              v.name[0] === name &&
              (lore ? v.lore[0] === lore : true) &&
              v.quality === quality &&
              v.tags.join(",") === tags
            ) {
              console.log("found match", idx, tokenToText(tid));
              minted[idx] = Number(tid);
              recovered++;
              break;
            }
          }
        } catch (e) {
          console.log(e);
        }
      });
    })
  );

  fs.writeFileSync("./minted.json", JSON.stringify(minted));
  console.log(`DONE. ${recovered} recovered nfts.`);
};

const burnGarbage = async (opts) => {
  let { address, subaccount, proxyCanister } = await ifProxy(opts.proxy);

  // let { address, subaccount } = await routerCanister();

  let map = await getMap();

  let minted;
  try {
    minted = JSON.parse(fs.readFileSync("./minted.json"));
  } catch (e) {
    console.log("minted.json not found");
  }

  let minted_ids = (minted ? Object.values(minted) : []).map((x) => BigInt(x));

  let acc = accountCanister(
    PrincipalFromSlot(
      map.space,
      AccountIdentifier.TextToSlot(address, map.account)
    )
  );

  let forBurning = [];
  let good = 0;
  let emptyPages = 0;
  for (let page = 0; page < 1000; page++) {
    let res = await acc.list(
      AccountIdentifier.TextToArray(address),
      page * 100,
      (page + 1) * 100
    );

    res = res.filter((x) => x != 0n);

    for (let nft_id of res) {
      if (minted_ids.indexOf(nft_id) !== -1) {
        good++;
      } else {
        forBurning.push(nft_id);
      }
    }

    if (res.length === 0) emptyPages++;
    if (emptyPages > 20) break;
  }

  forBurning = [...new Set(forBurning)]; // unique ids

  console.log(
    `We have found ${good} ok nfts with id in minted.json and ${forBurning.length} nfts without id in minted.json`
      .cyan
  );
  if (forBurning.length === 0) return;

  let confirm = await prompts({
    type: "confirm",
    name: "value",
    message: `Do you really want to burn ${forBurning.length} nfts ?`,
    initial: false,
  });

  if (!confirm.value) return;
  console.log("Burning...");

  await Promise.all(
    forBurning.map((tid) => {
      return limit(async () => {
        if (tid == 0n) return;

        let { index, slot } = decodeTokenId(tid);

        let canister = PrincipalFromSlot(map.space, slot).toText();

        let nft = nftCanister(proxyCanister ? proxyCanister : canister);

        await nft.burn({
          memo: [],
          subaccount: subaccount
            ? [AccountIdentifier.TextToArray(subaccount)]
            : [],
          token: tid,
          user: { address: AccountIdentifier.TextToArray(address) },
        });
      });
    })
  );
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
const itoIdlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const Result_3 = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Basket = IDL.Vec(IDL.Opt(TokenIdentifier));
  const Result_4 = IDL.Variant({ ok: Basket, err: IDL.Text });
  const TransactionId = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const Result_2 = IDL.Variant({ ok: Balance, err: IDL.Text });
  const Result_1 = IDL.Variant({ ok: IDL.Vec(IDL.Nat8), err: IDL.Text });
  const AccountRecordSerialized = IDL.Record({
    tokens: IDL.Vec(TokenIdentifier),
  });
  const Result = IDL.Variant({
    ok: AccountRecordSerialized,
    err: IDL.Text,
  });
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    nft: CanisterRange,
    pwr: CanisterRange,
    anvil: CanisterSlot,
    history: CanisterSlot,
    nft_avail: IDL.Vec(CanisterSlot),
    space: IDL.Vec(IDL.Vec(IDL.Nat64)),
    account: CanisterRange,
    history_range: CanisterRange,
    router: IDL.Principal,
    treasury: CanisterSlot,
  });
  const Class = IDL.Service({
    add: IDL.Func([TokenIdentifier], [Result_3], []),
    airdrop_add: IDL.Func([IDL.Vec(IDL.Nat8)], [Result_3], []),
    airdrop_use: IDL.Func(
      [AccountIdentifier, IDL.Vec(IDL.Nat8)],
      [Result_4],
      []
    ),
    buy_tx: IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result_4], []),
    claim: IDL.Func(
      [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
      [Result_3],
      []
    ),
    icp_balance: IDL.Func([], [Result_2], []),
    icp_transfer: IDL.Func([AccountIdentifier, Balance], [Result_1], []),
    owned: IDL.Func([AccountIdentifier], [Result], ["query"]),
    set_admin: IDL.Func([IDL.Principal], [], ["oneway"]),
    set_anvil_config: IDL.Func([Config], [], []),
    set_params: IDL.Func(
      [IDL.Record({ airdrop: IDL.Nat, purchase: IDL.Nat })],
      [],
      ["oneway"]
    ),
    stats: IDL.Func(
      [],
      [
        IDL.Record({
          total: IDL.Nat,
          added: IDL.Nat,
          available: IDL.Nat,
          airdrop: IDL.Nat,
          purchase: IDL.Nat,
        }),
      ],
      ["query"]
    ),
  });
  return Class;
};

const itoCreateActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  if (process.env.REACT_APP_LOCAL_BACKEND) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  return Actor.createActor(itoIdlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

const contractBalance = async (COUNT) => {
  let { principal, address, subaccount } = await routerCanister();
  let ITO_PRINCIPAL = getCanisterId("ito");

  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);
  let c_address = principalToAccountIdentifier(ITO_PRINCIPAL);
  console.log("address", c_address);
  let res = await itoContract.icp_balance();
  if (res.err) console.log("ERR", res.err);
  console.log(res.ok, "E8S ", AccountIdentifier.e8sToIcp(res.ok), "ICP");
};

const contractStats = async (COUNT) => {
  let { principal, address, subaccount } = await routerCanister();
  let ITO_PRINCIPAL = getCanisterId("ito");

  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);
  let c_address = principalToAccountIdentifier(ITO_PRINCIPAL);
  let res = await itoContract.stats();
  console.log(res);
};

const itoChangeParams = async (purchase, airdrop) => {
  let { principal, address, subaccount } = await routerCanister();
  let ITO_PRINCIPAL = getCanisterId("ito");

  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);

  let res = await itoContract.set_params({
    purchase,
    airdrop,
  });
};

const userTransfer = async (to, amount) => {
  let { address, subaccount } = await routerCanister();

  let map = await getMap();

  let pwr = pwrCanister(
    PrincipalFromSlot(map.space, AccountIdentifier.TextToSlot(address, map.pwr))
  );

  let res = await pwr.pwr_withdraw({
    from: { address: AccountIdentifier.TextToArray(address) },
    subaccount: [AccountIdentifier.TextToArray(subaccount)],
    to: { address: AccountIdentifier.TextToArray(to) },
    amount,
  });

  if (res.ok)
    console.log(
      "DONE. Transaction:",
      TransactionId.toText(res.ok.transactionId)
    );
  else console.log(res.err);
};

const contractTransfer = async (to, amount) => {
  let { principal, address, subaccount } = await routerCanister();
  let ITO_PRINCIPAL = getCanisterId("ito");

  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);

  let res = await itoContract.icp_transfer(
    AccountIdentifier.TextToArray(to),
    amount
  );
  if (res.ok) console.log("DONE. Transaction:", TransactionId.toText(res.ok));
  else console.log(res.err);
};

const getCanisterId = (name) => {
  let cfg = JSON.parse(
    fs.readFileSync(
      IS_LOCAL() ? "./.dfx/local/canister_ids.json" : "./canister_ids.json"
    )
  );

  return cfg[name][IS_LOCAL() ? "local" : "ic"];
};

const airdropAdd = async (COUNT) => {
  let { principal, address, subaccount } = await routerCanister();

  let ITO_PRINCIPAL = getCanisterId("ito");

  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);

  let made = (
    await Promise.all(
      Array(COUNT)
        .fill(0)
        .map((x) =>
          limit(async () => {
            let { key, hash } = generateKeyHashPair(getRandomValues);
            let resp = await itoContract.airdrop_add(Array.from(hash));
            return "ok" in resp ? key : false;
          })
        )
    )
  ).filter(Boolean);

  console.log("Codes created ", made.length);

  let re = made.map((x) => bytesToBase58(x));

  let old;
  try {
    old = JSON.parse(fs.readFileSync("./ito_giftcodes.json"));
  } catch (e) {
    old = [];
  }
  re = [...old, ...re];

  fs.writeFileSync("./ito_giftcodes.json", JSON.stringify(re));
};

const itoAuthorize = async () => {
  let { principal, address, subaccount } = await routerCanister();

  execSync(
    `dfx canister --wallet=$(dfx identity ${
      IS_LOCAL() ? "" : "--network ic"
    } get-wallet) ${
      IS_LOCAL() ? "" : "--network ic"
    } call ito set_admin 'principal "${principal}"'`,
    {
      encoding: "UTF-8",
    }
  );

  if (IS_LOCAL()) {
    let itoContract = can(itoCreateActor, getCanisterId("ito"));
    itoContract.set_anvil_config({
      router: Principal.fromText(process.env.ROUTER_CANISTER),
      nft: [0, 0],
      nft_avail: [],
      account: [0, 0],
      pwr: [0, 0],
      anvil: 0,
      treasury: 0,
      history: 0,
      history_range: [0, 0],
      space: [[0, 0]],
    });
  }
};

const saleAdd = async (NFT_FROM, NFT_TO, opts) => {
  let { address, subaccount, proxyCanister } = await ifProxy(opts.proxy);

  // let { principal, address, subaccount } = await routerCanister();

  let ITO_PRINCIPAL = getCanisterId("ito");

  try {
    let chk = Principal.fromText(ITO_PRINCIPAL);
  } catch (e) {
    throw new Error(
      "Can't find ito contract principal. Make sure you are in the right directory with dfx.json and it is deployed"
    );
  }

  let TO_ADDRESS = principalToAccountIdentifier(ITO_PRINCIPAL);
  let itoContract = can(itoCreateActor, ITO_PRINCIPAL);
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

          if (!proxyCanister) {
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
          }

          let srez = await itoContract.add(tid);
          if ("err" in srez) {
            console.log(srez.err);
            return false;
          }

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

const checkUploads = async (NFT_FROM, NFT_TO, options) => {
  if (options.quick) console.log("Quick check");
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
          console.log("Not minted ", i);
          return false;
        }

        try {
          let { index, slot } = decodeTokenId(tid);

          let canister = PrincipalFromSlot(map.space, slot).toText();

          let nft = nftCanister(canister);
          let found = false;

          if (!options.quick) {
            let rez = await nft.fetch_chunk({
              tokenIndex: index,
              position: { thumb: null },
              chunkIdx: 0,
              subaccount: [AccountIdentifier.TextToArray(subaccount)],
            });

            found = rez[0];

            if (data[i].content) {
              let rez2 = await nft.fetch_chunk({
                tokenIndex: index,
                position: { content: null },
                chunkIdx: 0,
                subaccount: [AccountIdentifier.TextToArray(subaccount)],
              });

              found = found && rez2[0];
            }
          } else {
            let rez = await nft.metadata(tid);
            if (rez?.ok?.data) found = true;
            else {
              delete minted[i];
            }
          }

          if (!found && !options.quick) {
            // await nft.burn({
            //   memo: [],
            //   subaccount: [AccountIdentifier.TextToArray(subaccount)],
            //   token: tid,
            //   user: { address: AccountIdentifier.TextToArray(address) },
            // });

            // delete minted[i];

            console.log("Not found image data for token", tid, " reuploading");

            if (data[i].content)
              await uploadFile(
                nft,
                index,
                "content",
                await chunkBlob(await blobFrom(data[i].content), fetch),
                [AccountIdentifier.TextToArray(subaccount)]
              );

            await uploadFile(
              nft,
              index,
              "thumb",
              await chunkBlob(await blobFrom(data[i].thumb), fetch),
              [AccountIdentifier.TextToArray(subaccount)]
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

const IS_LOCAL = () => {
  return program.opts().local;
};

const ifProxy = async (prx) => {
  let { address, subaccount } = await routerCanister();

  let proxyCanister = prx
    ? prx === "ito"
      ? Principal.fromText(getCanisterId("ito"))
      : Principal.fromText(prx)
    : false;

  if (proxyCanister) {
    address = principalToAccountIdentifier(proxyCanister.toText());
    subaccount = null;
  }

  return { proxyCanister, address, subaccount };
};

const mintMain = async (NFT_FROM, NFT_TO, opts) => {
  let proxyCanister = opts.proxy
    ? opts.proxy === "ito"
      ? Principal.fromText(getCanisterId("ito"))
      : Principal.fromText(opts.proxy)
    : false;

  console.log("proxyCanister", proxyCanister.toText());

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
      if (
        s?.content &&
        s?.content.indexOf("https://") === -1 &&
        !fs.existsSync(s.content)
      ) {
        error = true;
        console.log("missing " + i + " content file ");
      }
      if (!("thumb" in s)) {
        error = true;

        console.log("missing " + i + " thumb in meta");
      }
      if (s?.thumb.indexOf("https://") === -1 && !fs.existsSync(s.thumb)) {
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

  if (proxyCanister) {
    address = principalToAccountIdentifier(proxyCanister.toText());
    subaccount = null;
  }

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
      subaccount: subaccount ? [AccountIdentifier.TextToArray(subaccount)] : [],
      metadata: inputToMeta(s),
    };

    items.push(request);
  }

  try {
    let resp = await easyMint(items, proxyCanister.toText());
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

const contentPath = (path) => {
  if (path.indexOf("https://") !== -1)
    return {
      external: path,
    };

  return {
    internal: {
      contentType: mime.getType(path),
      path,
    },
  };
};

const inputToMeta = (s) => {
  return {
    domain: "domain" in s ? [s.domain] : [],
    name: "name" in s ? [s.name] : [],
    lore: "lore" in s ? [s.lore] : [],
    quality: "quality" in s ? s.quality : 1,
    secret: "secret" in s ? s.secret : false,
    transfer: "transfer" in s ? s.transfer : { unrestricted: null },
    ttl: ["ttl" in s ? s.ttl : 1036800],
    content: "content" in s ? [contentPath(s.content)] : [],
    thumb: "thumb" in s ? contentPath(s.thumb) : null,
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
      "price" in s ? s.price : { amount: 0, marketplace: [], affiliate: [] },
    rechargeable: "rechargeable" in s ? s.rechargeable : true,
  };
};

const program = new Command();

program
  .name("nftanvil mint")
  .description(
    "CLI to mint with NFTAnvil.\nDon't run it multiple times asynchroneously"
  )
  .option("-l, --local", "Run in local replica mode")
  .version("0.2.0")
  .hook("preAction", (thisCommand, actionCommand) => {
    if (thisCommand.opts().local) {
      console.log("Running in local mode".green);
      process.env.NETWORK = "local";
      if (!("LOCAL_ROUTER_CANISTER" in process.env)) {
        console.log(
          "specify LOCAL_ROUTER_CANISTER in .env pointing to your local Anvil deployment"
        );
        process.exit();
      }

      process.env.ROUTER_CANISTER = process.env.LOCAL_ROUTER_CANISTER;
      process.env.REACT_APP_LOCAL_BACKEND = true;
    }
  });

program
  .command("address")
  .description("check your address & balance")
  .action((options) => {
    balanceAndAddress();
  });

program
  .command("burn-garbage")
  .description("burn everything your address owns except nfts from minted.json")
  .option("-p, --proxy <principal>")
  .action((options) => {
    console.log("Searching...");
    burnGarbage(options);
  });

program
  .command("mint")
  .description("mint nfts from index to index")
  .argument("<from>", "from index")
  .argument("<to>", "to index")
  .option("-p, --proxy <principal>")
  .action((from, to, options) => {
    console.log(`Minting from ${from} to ${to}`);
    mintMain(parseInt(from, 10), parseInt(to, 10), options);
  });

program
  .command("gift")
  .description("creates gift links for nfts from index to index")
  .argument("<from>", "from index")
  .argument("<to>", "to index")
  .action((from, to, options) => {
    console.log(`Creating gift links from ${from} to ${to}`);
    giftMain(parseInt(from, 10), parseInt(to, 10));
  });

program
  .command("transfer")
  .description("transfer nfts from index to index to another address")
  .argument("<from>", "from index")
  .argument("<to>", "to index")
  .argument("<address>", "address")
  .action((from, to, address, options) => {
    console.log(`Transferring nfts from ${from} - ${to} to ${address}`);
    transferMain(parseInt(from, 10), parseInt(to, 10), address);
  });

program
  .command("transfer-icp")
  .argument("<address>", "to address")
  .argument("<e8s>", "amount")
  .description("Sends ICP from contract balance to target address")
  .action((to, amount, options) => {
    console.log(`Sending ICP...`);
    userTransfer(to, parseInt(amount, 10));
  });

program
  .command("check")
  .description("checks if everything was uploaded and reuploads nft if not")
  .argument("<from>", "from index")
  .argument("<to>", "to index")
  .option("-q, --quick")
  .action((from, to, options) => {
    console.log(`Checking uploads ${from} - ${to}`);
    checkUploads(parseInt(from, 10), parseInt(to, 10), options);
  });

program
  .command("recover")
  .description(
    "searches inventory and adds nfts to minted.json if they are missing"
  )
  .option("-p, --proxy <principal>")
  .action((options) => {
    console.log(`Searching...`);
    recover(options);
  });

const ito = new Command("ito");
ito.description("ITO - Initial Token Offering");

ito
  .command("init")
  .description(
    "authorize your principal in ITO contract and set it in local or production mode"
  )
  .action((options) => {
    console.log(
      `Authorize your principal in ITO contract and set it local or production. You must be in a repo where dfx.json and ito.mo are`
    );
    itoAuthorize();
  });

ito
  .command("add")
  .description("transfer nfts to ITO contract")
  .option("-p, --proxy <principal>")
  .argument("<from>", "from index")
  .argument("<to>", "to index")
  .action((from, to, opts) => {
    console.log(`Adding to ITO nfts from ${from} - ${to}`);
    saleAdd(parseInt(from, 10), parseInt(to, 10), opts);
  });

ito
  .command("balance")
  .description("gets icp balance of ITO contract")
  .action((options) => {
    console.log(`Checking ITO balance`);
    contractBalance();
  });

ito
  .command("stats")
  .description("gets stats of ITO contract")
  .action((options) => {
    console.log(`Checking ITO stats`);
    contractStats();
  });

ito
  .command("transfer-icp")
  .argument("<address>", "to address")
  .argument("<e8s>", "amount")
  .description("Sends ICP from contract balance to target address")
  .action((to, amount, options) => {
    console.log(`Sending ICP...`);
    contractTransfer(to, parseInt(amount, 10));
  });

ito
  .command("airdrop")
  .description("Creates gift codes and adds them to ITO contract")
  .argument("<number>", "number of codes to generate")
  .action((count, options) => {
    console.log(`Creating codes ${count}`);
    airdropAdd(parseInt(count, 10));
  });

ito
  .command("change-parameters")
  .argument("<purchase>", "amount")
  .argument("<airdrop>", "amount")
  .description("Sets left for purchase and left for airdrop paramethers")
  .action((a, b, options) => {
    console.log(`Changing parameters`);
    itoChangeParams(parseInt(a, 10), parseInt(b, 10));
  });

program.addCommand(ito);

program.parse();
