import {
  easyMint,
  routerCanister,
  pwrCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  historyCanister,
  anvilCanister,
} from "@vvv-interactive/nftanvil";

const main = async () => {
  let { principal, address, subaccount } = await routerCanister();
  console.log("Script principal ", principal);

  let map = await getMap();

  let historyCan = PrincipalFromSlot(map.space, map.history);
  console.log("principal", historyCan.toText());

  let history = historyCanister(historyCan);

  let info = await history.stats();

  let some = await history.info();

  console.log("Info", info, some);
};

main();
