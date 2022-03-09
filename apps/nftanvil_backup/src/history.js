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
  return;
  let history = historyCanister(historyCan);

  let info = await history.stats();

  console.log("Info", info);
};

main();
