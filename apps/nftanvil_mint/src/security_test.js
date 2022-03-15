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
const limit = pLimit(20);

import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";

const randomAddresses = ({ principal }) => {
  let r = [];
  for (let i = 0; i < 10; i++) {
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
  await faucetUser(address, 100000000000000);

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
          price: { amount: 1000000000, marketplace: [], affiliate: [] },
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
  console.log("START");
  let routerInfo = await routerCanister();
  await securityTest(routerInfo);

  // await Promise.all(
  //   Array(1)
  //     .fill(1)
  //     .map((_, idx) => {
  //       return limit(() => securityTest(routerInfo));
  //     })
  // );
};

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

const nftcan = (nft_id) => {
  let { slot, index } = decodeTokenId(nft_id);
  return slotcan(nftCanister, slot);
};
const u = (address) => {
  return { address: AccountIdentifier.TextToArray(address) };
};

const assertOwner = async (address, nft_id) => {
  let bearer = AccountIdentifier.ArrayToText(
    (await nftcan(nft_id).bearer(nft_id)).ok
  );
  console.assert(bearer == address);
};

const faucetUser = async (address, amount) => {
  let map = await getMap();

  let pwr = pwrCanister(
    PrincipalFromSlot(map.space, AccountIdentifier.TextToSlot(address, map.pwr))
  );

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address),
    amount,
  });
};

const securityTest = async ({
  principal,
  address,
  subaccount,
  map,
  identity,
}) => {
  try {
    console.log("Security test");

    let nfts = await mintAlot({ principal, address, subaccount });
    users = randomAddresses({ principal });

    let nft_id = nfts[0];

    let [bad_address_to, bad_subaccount_to] = getRandomUser();
    let [anyone_address_to, anyone_subaccount_to] = getRandomUser();

    // non owner transfer
    await (async function () {
      let trez = await nftcan(nft_id).transfer({
        from: u(bad_address_to),
        to: u(anyone_address_to),
        token: nft_id,
        amount: 1,
        memo: [],
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
      });

      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // non owner burn
    await (async function () {
      let trez = await nftcan(nft_id).burn({
        user: u(bad_address_to),
        token: nft_id,
        amount: 1,
        memo: [],
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
      });

      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // recharge with no cash
    await (async function () {
      let { slot, index } = decodeTokenId(nft_id);

      let pwr = pwrCanister(
        PrincipalFromSlot(
          map.space,
          AccountIdentifier.TextToSlot(bad_address_to, map.pwr)
        )
      );
      let trez = await pwr.nft_recharge(slot, {
        user: u(bad_address_to),
        token: nft_id,
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        amount: 10000,
      });
      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // recharge with cash
    await (async function () {
      let { slot, index } = decodeTokenId(nft_id);

      await faucetUser(bad_address_to, 1000000);

      let pwr = pwrCanister(
        PrincipalFromSlot(
          map.space,
          AccountIdentifier.TextToSlot(bad_address_to, map.pwr)
        )
      );
      let trez = await pwr.nft_recharge(slot, {
        user: u(bad_address_to),
        token: nft_id,
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        amount: 1000000 - 10000,
      });

      console.assert("ok" in trez);

      await assertOwner(address, nft_id);
    })();

    // non owner transfer_link
    await (async function () {
      let trez = await nftcan(nft_id).transfer_link({
        hash: [1, 2, 3, 4, 5],
        from: u(bad_address_to),
        token: nft_id,
        amount: 1,
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
      });

      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // bad link claim claim_link
    await (async function () {
      let trez = await nftcan(nft_id).claim_link({
        to: u(bad_address_to),
        key: [],
        token: nft_id,
      });

      console.assert("err" in trez);
      console.assert("Rejected" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // bad link claim claim_link 2
    await (async function () {
      let trez = await nftcan(nft_id).claim_link({
        to: u(bad_address_to),
        key: [1, 2, 3],
        token: nft_id,
      });
      console.log("claim link", trez);

      console.assert("err" in trez);
      console.assert("Rejected" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // purchase lower price
    await (async function () {
      let { slot, index } = decodeTokenId(nft_id);

      await faucetUser(bad_address_to, 100000);

      let pwr = pwrCanister(
        PrincipalFromSlot(
          map.space,
          AccountIdentifier.TextToSlot(bad_address_to, map.pwr)
        )
      );
      let trez = await pwr.nft_purchase(slot, {
        user: u(bad_address_to),
        token: nft_id,
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        amount: 100000 - 10000,
        affiliate: [],
      });
      console.log("purchase", trez);
      console.assert("err" in trez);
      console.assert("InsufficientPayment" in trez.err);

      await assertOwner(address, nft_id);
    })();

    // non owner plug
    await (async function () {
      let trez = await nftcan(nft_id).plug({
        user: u(bad_address_to),
        plug: nft_id,
        socket: nfts[1],
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        memo: [],
      });
      console.log("plug", trez);
      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // non owner unsocket
    await (async function () {
      let trez = await nftcan(nft_id).unsocket({
        user: u(bad_address_to),
        plug: nfts[1],
        socket: nft_id,
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        memo: [],
      });
      console.log("unsocket", trez);
      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // non owner use
    await (async function () {
      let trez = await nftcan(nft_id).use({
        user: u(bad_address_to),
        token: nft_id,
        use: { prove: null },
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
        memo: [],
        customVar: [],
      });
      console.log("use", trez);
      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // non owner set_price
    await (async function () {
      let trez = await nftcan(nft_id).set_price({
        user: u(bad_address_to),
        token: nft_id,
        price: { amount: 1000111, marketplace: [] },
        subaccount: [AccountIdentifier.TextToArray(bad_subaccount_to)],
      });
      console.log("set_price", trez);
      console.assert("err" in trez);
      console.assert("InsufficientBalance" in trez.err);
      await assertOwner(address, nft_id);
    })();

    // assertOwner(address, nft_id);

    // more tests on socketing
    // purchase with no cash
    // recharge with no cash
    // mint with no cash

    console.log("DONE");
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
