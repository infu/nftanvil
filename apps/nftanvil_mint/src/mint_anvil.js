import {
  easyMint,
  routerCanister,
  pwrCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  anvilCanister,
  claimBalance,
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

const main = async () => {
  let { principal, address, subaccount } = await routerCanister();
  console.log("Script principal ", principal);
  let balance = await claimBalance(address, subaccount); // if you sent ICP to that address it needs to be claimed

  let map = await getMap();

  console.log("Address ", address, "subaccount", subaccount);

  let pwr = pwrCanister(
    PrincipalFromSlot(map.space, AccountIdentifier.TextToSlot(address, map.pwr))
  );

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address),
    amount: 1000000000,
  });

  let balance = await pwr.balance({
    user: { address: AccountIdentifier.TextToArray(address) },
  });

  console.log("Balance", balance);
  if (balance.pwr <= 0n) return;

  // Currently agent-js candid implementation doesn't supply the user with very informative errors,
  // so a creating correct metadata record will be hard. Add one change at a time and test.

  let mint_array = Array(10)
    .fill(0)
    .map((_, idx) => {
      return {
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount: [AccountIdentifier.TextToArray(subaccount)],
        metadata: {
          domain: [],
          name: ["Anvil #" + idx],
          lore: ["Governance tokens"],
          quality: 1,
          secret: false,
          transfer: { unrestricted: null },
          ttl: [103680],
          content: [],
          thumb: {
            internal: { contentType: "image/jpeg", path: "./some.jpg" },
          },
          attributes: [
            ["fun", 5],
            ["sun", 3],
          ],
          tags: ["cat", "animal"],
          custom: [],
          customVar: [],
          authorShare: 50,
          price: { amount: 170000000, marketplace: [], affiliate: [] },
          rechargeable: true,
        },
      };
    });

  let anvil = anvilCanister(PrincipalFromSlot(map.space, map.anvil));

  try {
    let resp = await easyMint(mint_array);
    console.log("resp", resp);

    for (let nft_id of resp) {
      let xr = await anvil.register_token(nft_id);
      console.log(xr);
    }
  } catch (e) {
    console.log("error during minting", e);
  }

  console.log("all tokens", await anvil.all_tokens());
};

main();
