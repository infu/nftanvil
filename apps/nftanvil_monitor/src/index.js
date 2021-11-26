import {
  Principal,
  routerCanister,
  nftCanister,
  accountCanister,
  accessCanister,
  encodeTokenId,
} from "@vvv-interactive/nftanvil";
import Table from "cli-table";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const queryNetworkInfo = (id, prod = false) => {
  let q = execSync(
    "dfx canister --no-wallet " +
      (prod ? "--network ic" : "") +
      " info " +
      id +
      " 2> /dev/null",
    {
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    }
  ).toString();

  let controller = /Controllers:(.*)/gm.exec(q)[1].trim();
  let hash = /hash:(.*)/gm.exec(q)[1].trim();
  return { controller, hash };
};

const main = async () => {
  const prod = process.env.NODE_ENV === "production";
  let rez = {};
  let { principal, address, router, id: routerId } = await routerCanister();

  let rs = await router.stats();
  rs.id = routerId;
  rez.router = [routerId];
  let rnetinfo = queryNetworkInfo(routerId, prod);

  let nftCanisters = await router.fetchNFTCanisters();
  rez.nft = nftCanisters;
  let nftStats = await Promise.all(
    nftCanisters.map(async (can) => {
      let nft = nftCanister(can);
      let s = await nft.stats();
      s = { ...s, ...queryNetworkInfo(can, prod) };
      s.id = can;
      return s;
    })
  );

  let setup = await router.fetchSetup();
  rez.account = setup.acclist;
  rez.access = setup.accesslist;
  let accStats = await Promise.all(
    setup.acclist.map(async (can) => {
      let acc = accountCanister(can);
      let s = await acc.stats();
      s = { ...s, ...queryNetworkInfo(can, prod) };
      s.id = can;
      return s;
    })
  );

  let accessStats = await Promise.all(
    setup.accesslist.map(async (can) => {
      let acc = accessCanister(can);
      let s = await acc.stats();
      s = { ...s, ...queryNetworkInfo(can, prod) };
      s.id = can;
      return s;
    })
  );
  // instantiate
  var table = new Table({
    head: [
      "Type",
      "Canister Id",
      "Cycles",
      "Memory",
      "Other",
      "Hash",
      "Controllers",
    ],
    colWidths: [10, 33, 13, 13, 20, 70, 60],
  });

  let T = 1000000000000n;
  let GB = 1073741824n;
  const formatN = (n) => {
    return (Number(n) / 100).toFixed(2);
  };

  table.push(
    [
      "router",
      rs.id,
      formatN((100n * rs.cycles) / T) + " T",
      formatN((100n * rs.rts_total_allocation) / GB) + " GB",
      "",
      rnetinfo.hash,
      rnetinfo.controller,
    ],
    ...nftStats.map((s, idx) => {
      return [
        "nft",
        s.id,
        formatN((100n * s.cycles) / T) + " T",
        formatN((100n * s.rts_total_allocation) / GB) + " GB",
        `${s.minted} minted`,
        s.hash,
        s.controller,
      ];
    }),
    ...accStats.map((s, idx) => {
      return [
        "account",
        s.id,
        formatN((100n * s.cycles) / T) + " T",
        formatN((100n * s.rts_total_allocation) / GB) + " GB",
        "",
        s.hash,
        s.controller,
      ];
    }),
    ...accessStats.map((s, idx) => {
      return [
        "access",
        s.id,
        formatN((100n * s.cycles) / T) + " T",
        formatN((100n * s.rts_total_allocation) / GB) + " GB",
        "",
        s.hash,
        s.controller,
      ];
    })
  );

  console.log(table.toString());
  let savePath = path.resolve(
    "..",
    "..",
    prod ? "cluster.json" : "cluster.local.json"
  );

  fs.writeFileSync(savePath, JSON.stringify(rez));
};

main();
