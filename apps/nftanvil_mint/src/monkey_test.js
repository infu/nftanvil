import {
  easyMint,
  routerCanister,
  pwrCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  slotcan,
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

import pLimit from "p-limit";
const limit = pLimit(60);

import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";

const randomAddresses = ({ principal }) => {
  let r = [];
  for (let i = 0; i < 1000; i++) {
    let num = Math.round(Math.random() * 100000000000000);
    let subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(num));
    let address = principalToAccountIdentifier(principal.toText(), num);
    r.push([address, subaccount]);
  }

  return r;
};

const mintAlot = async ({ principal, address, subaccount }) => {
  //console.log("Script address ", address);

  let map = await getMap();
  let pwr = pwrCanister(PrincipalFromSlot(map.space, map.pwr));

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address),
    amount: 1000000000,
  });

  // let balance = await pwr.balance({
  //   user: { address: AccountIdentifier.TextToArray(address) },
  // });

  // Currently agent-js candid implementation doesn't supply the user with very informative errors,
  // so a creating correct metadata record will be hard. Add one change at a time and test.

  let mint_array = Array(5)
    .fill(0)
    .map((_, idx) => {
      return {
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount: [AccountIdentifier.TextToArray(subaccount)],
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
          authorShare: 150,
          price: { amount: 100000, marketplace: [], affiliate: [] },
          rechargeable: true,
        },
      };
    });

  try {
    let resp = await easyMint(mint_array);
    //console.log("resp", resp);
    return resp;
  } catch (e) {
    console.log("error during minting", e);
  }
};

let users = null;

const main = async () => {
  let routerInfo = await routerCanister();

  await Promise.all(
    Array(50000)
      .fill(1)
      .map((_, idx) => {
        return limit(() => monkeyTest(routerInfo));
      })
  );
};

const monkeyTest = async ({
  principal,
  address,
  subaccount,
  map,
  identity,
}) => {
  try {
    let nfts = await mintAlot({ principal, address, subaccount });
    users = randomAddresses({ principal });

    for (let nft_id of nfts) {
      console.log(tokenToText(nft_id));

      let { slot, index } = decodeTokenId(nft_id);
      let [address_to, subaccount_to] = getRandomUser();

      let trez = await slotcan(nftCanister, slot).transfer({
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(address_to) },
        token: nft_id,
        amount: 1,
        memo: [],
        subaccount: [AccountIdentifier.TextToArray(subaccount)],
      });

      await owner_decide({
        address: address_to,
        subaccount: subaccount_to,
        nft_id,
      });

      if ("err" in trez) console.log(trez);
    }
  } catch (e) {
    console.log(e);
  }
};

const getRandomUser = () => {
  return users[Math.floor(Math.random() * users.length)];
};

const owner_decide = async ({ address, subaccount, nft_id }) => {
  let { slot, index } = decodeTokenId(nft_id);

  const transfer = async () => {
    let [address_to, subaccount_to] = getRandomUser();
    console.log("transfer");
    await slotcan(nftCanister, slot).transfer({
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(address_to) },
      token: nft_id,
      amount: 1,
      memo: [],
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
    });

    await owner_decide({
      address: address_to,
      subaccount: subaccount_to,
      nft_id,
    });
  };

  const purchase = async () => {
    let [address_to, subaccount_to] = getRandomUser();

    console.log("purchase", nft_id);
    let map = await getMap();
    let pwr = slotcan(pwrCanister, map.pwr);

    await pwr.faucet({
      aid: AccountIdentifier.TextToArray(address_to),
      amount: 10000000000,
    });

    let price = {
      amount: Math.floor(Math.random() * 100000000) + 100000,
      marketplace: [
        {
          share: Math.floor(50 + Math.random() * 200),
          address: AccountIdentifier.TextToArray(address_to),
        },
      ],
      affiliate: [
        {
          share: Math.floor(50 + Math.random() * 200),
          address: AccountIdentifier.TextToArray(address_to),
        },
      ],
    };

    let pricerez = await slotcan(nftCanister, slot).set_price({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: nft_id,
      price: price,
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
    });

    console.log("pricerez", pricerez);

    console.log({
      slot,
      token: nft_id,
    });
    let prez = await pwr.nft_purchase(BigInt(slot), {
      token: nft_id,
      user: { address: AccountIdentifier.TextToArray(address_to) },
      subaccount: [AccountIdentifier.TextToArray(subaccount_to)],
      amount: price.amount + 1000000, // more because there are nft recharge vars
    });

    if ("err" in prez) console.log("purchase err", prez);
  };

  const burn = async () => {
    let [address_to, subaccount_to] = getRandomUser();
    console.log("burn");
    await slotcan(nftCanister, slot).burn({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: nft_id,
      amount: 1,
      memo: [],
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
    });

    await owner_decide({
      address: address_to,
      subaccount: subaccount_to,
      nft_id,
    });
  };

  const use = async () => {
    let useData = { cooldown: 2 };
    let memo = [12, 10, 5, 0, 0, 1, 7];
    console.log("use");
    await slotcan(nftCanister, slot).use({
      user: { address: AccountIdentifier.TextToArray(address) },
      token: nft_id,
      memo,
      use: useData,
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
      customVar: [],
    });
  };

  let fn = [transfer, burn, use, purchase];

  try {
    await fn[Math.floor(Math.random() * fn.length)]();
  } catch (e) {
    console.log("err", e);
  }
};

main();
