import {
  Principal,
  routerConnect,
  nftCanister,
  accountCanister,
  encodeTokenId,
} from "@vvv-interactive/nftanvil";
var Table = require("cli-table");
const fs = require("fs");
const path = require("path");

const main = async () => {
  let rez = {};
  let { principal, address, router, id: routerId } = await routerConnect();

  let rs = await router.stats();
  rs.id = routerId;
  rez.router = [routerId];

  let nftCanisters = await router.fetchNFTCanisters();
  rez.nft = nftCanisters;
  let nftStats = await Promise.all(
    nftCanisters.map(async (can) => {
      let nft = nftCanister(can);
      let s = await nft.stats();
      s.id = can;
      return s;
    })
  );

  let setup = await router.fetchSetup();
  rez.account = setup.acclist;

  let accStats = await Promise.all(
    setup.acclist.map(async (can) => {
      let acc = accountCanister(can);
      let s = await acc.stats();
      s.id = can;
      return s;
    })
  );

  // instantiate
  var table = new Table({
    head: ["Type", "Canister Id", "Cycles", "Memory"],
    colWidths: [10, 33, 13, 13],
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
    ],
    ...nftStats.map((s, idx) => {
      return [
        "nft",
        s.id,
        formatN((100n * s.cycles) / T) + " T",
        formatN((100n * s.rts_total_allocation) / GB) + " GB",
      ];
    }),
    ...accStats.map((s, idx) => {
      return [
        "account",
        s.id,
        formatN((100n * s.cycles) / T) + " T",
        formatN((100n * s.rts_total_allocation) / GB) + " GB",
      ];
    })
  );

  console.log(table.toString());
  let savePath = path.resolve("..", "..", "cluster.json");

  fs.writeFileSync(savePath, JSON.stringify(rez));
};

main();
