import {
  easyMint,
  routerCanister,
  pwrCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
} from "@vvv-interactive/nftanvil";

const main = async () => {
  let { principal, address, balance } = await routerCanister();
  console.log("Script address ", address);
  console.log("Balance", balance);

  let map = await getMap();
  let pwr = pwrCanister(PrincipalFromSlot(map.space, map.pwr));
  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address),
    amount: 1000000000,
  });

  // Currently agent-js candid implementation doesn't supply the user with very informative errors,
  // so a creating correct metadata record will be hard. Add one change at a time and test.

  let mint_array = Array(20000)
    .fill(0)
    .map((_, idx) => {
      return {
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount: [],
        metadata: {
          domain: [],
          name: ["Cat #" + idx],
          lore: ["Born in Mount Doom"],
          quality: 1,
          secret: false,
          transfer: { unrestricted: null },
          ttl: [103680],
          content: [],
          thumb: {
            internal: { contentType: "image/jpeg", path: "./some.jpg" },
          },
          attributes: [
            ["catness", 5],
            ["dogness", 3],
          ],
          tags: ["cat", "animal"],
          custom: [],
          customVar: [],
          authorShare: 50,
          price: { amount: 100000, marketplace: [], affiliate: [] },
          rechargeable: true,
        },
      };
    });

  try {
    let resp = await easyMint(mint_array);
    console.log("resp", resp);
  } catch (e) {
    console.log("error during minting", e);
  }
};

main();
