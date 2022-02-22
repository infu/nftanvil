import {
  easyMint,
  routerCanister,
  pwrCanister,
  nftCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  anvilCanister,
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

import { e8sToIcp } from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

const main = async () => {
  let { principal, address, subaccount } = await routerCanister();
  console.log("Script principal ", principal.toText());

  let subaccount_1 = AccountIdentifier.ArrayToText(
    getSubAccountArray(34343453)
  );
  let subaccount_2 = AccountIdentifier.ArrayToText(
    getSubAccountArray(92138009872)
  );

  let address_1 = principalToAccountIdentifier(
    principal.toText(),
    AccountIdentifier.TextToArray(subaccount_1)
  );

  let address_2 = principalToAccountIdentifier(
    principal.toText(),
    AccountIdentifier.TextToArray(subaccount_2)
  );

  let map = await getMap();

  console.log("Address ", address, "subaccount", subaccount);

  let anvil = anvilCanister(PrincipalFromSlot(map.space, map.anvil));

  //await generate_payout(principal);

  await anvil.refresh();

  await all_tokens();

  // await purchase(65541, address, subaccount);
  // await withdraw(65541, address, subaccount);
  await faucet(address_1);

  await purchase(131085, address_1, subaccount_1);
  await withdraw(131085, address_1, subaccount_1);
};

const all_tokens = async () => {
  let map = await getMap();

  let anvil = slotcan(anvilCanister, map.anvil);

  await anvil.refresh();

  let all = await anvil.all_tokens();
  for (let [nft_id, { withdrawn }] of all) {
    let balance = await anvil.balance(nft_id);

    console.log({ nft_id, withdrawn, balance });
  }
};

const generate_payout = async (principal) => {
  let map = await getMap();
  let pwr = slotcan(pwrCanister, map.pwr);

  let subaccount_1 = AccountIdentifier.ArrayToText(getSubAccountArray(1));
  let subaccount_2 = AccountIdentifier.ArrayToText(getSubAccountArray(2));

  let address_1 = principalToAccountIdentifier(
    principal.toText(),
    AccountIdentifier.TextToArray(subaccount_1)
  );
  let address_2 = principalToAccountIdentifier(
    principal.toText(),
    AccountIdentifier.TextToArray(subaccount_2)
  );

  console.log(address_1, subaccount_1);
  console.log(address_2, subaccount_2);

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address_1),
    amount: 1000000000000000,
  });

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address_2),
    amount: 1000000000000000,
  });

  let nft_id = await mint_nft(address_1, subaccount_1);

  for (let i = 0; i < 2; i++) {
    await purchase(nft_id, address_2, subaccount_2);
    await set_price(nft_id, 100000000000, address_2, subaccount_2);

    await purchase(nft_id, address_1, subaccount_1);
    await set_price(nft_id, 100000000000, address_1, subaccount_1);
  }
};

const withdraw = async (nft_id, address, subaccount) => {
  let map = await getMap();

  let { slot, index } = decodeTokenId(nft_id);
  let nftcan = await slotcan(nftCanister, slot);

  let use_resp = await nftcan.use({
    user: { address: AccountIdentifier.TextToArray(address) },
    subaccount: [AccountIdentifier.TextToArray(subaccount)],
    token: nft_id,
    use: { prove: null },
    memo: [],
    customVar: [],
  });

  if (use_resp.err) {
    console.log("USE ERR", use_resp.err);
    return;
  }

  let tx = use_resp.ok.transactionId;

  let anvil = slotcan(anvilCanister, map.anvil);
  let withdraw_resp = await anvil.withdraw({
    aid: AccountIdentifier.TextToArray(address),
    subaccount: [AccountIdentifier.TextToArray(subaccount)],
    tx: tx,
  });

  console.log(withdraw_resp, use_resp);

  let pwr = slotcan(pwrCanister, map.pwr);

  let balance = await pwr.balance({
    user: { address: AccountIdentifier.TextToArray(address) },
  });

  let anvil_balance = await anvil.balance(nft_id);

  console.log(
    "withdrawn balances",
    e8sToIcp(balance.pwr) + "icp",
    anvil_balance.ok
  );
};

const set_price = async (nft_id, amount, address, subaccount) => {
  let { slot, index } = decodeTokenId(nft_id);

  console.log("set_price", nft_id);

  let map = await getMap();

  let rez = await slotcan(nftCanister, slot).set_price({
    token: nft_id,
    user: { address: AccountIdentifier.TextToArray(address) },
    subaccount: [AccountIdentifier.TextToArray(subaccount)],
    price: { amount, marketplace: [], affiliate: [] },
  });

  console.log(rez);
};

const faucet = async (address) => {
  let map = await getMap();
  let pwr = slotcan(pwrCanister, map.pwr);

  await pwr.faucet({
    aid: AccountIdentifier.TextToArray(address),
    amount: 10000000000,
  });
};

const purchase = async (nft_id, address_to, subaccount_to) => {
  let { slot, index } = decodeTokenId(nft_id);

  console.log("purchase", nft_id);

  let map = await getMap();
  let pwr = slotcan(pwrCanister, map.pwr);

  let meta = await slotcan(nftCanister, slot).metadata(nft_id);

  //console.log("meta", meta);

  let prez = await pwr.nft_purchase(BigInt(slot), {
    token: nft_id,
    user: { address: AccountIdentifier.TextToArray(address_to) },
    subaccount: [AccountIdentifier.TextToArray(subaccount_to)],
    amount: meta.ok.vars.price.amount + 1000000n, // more because there are nft recharge vars
  });

  if ("err" in prez) console.log("purchase err", prez);
};

const mint_nft = async (address, subaccount) => {
  let mint_array = Array(1)
    .fill(0)
    .map((_, idx) => {
      return {
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount: [AccountIdentifier.TextToArray(subaccount)],
        metadata: {
          domain: [],
          name: ["Some nft #" + idx],
          lore: ["fun on the sun"],
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

  let resp = await easyMint(mint_array);
  return resp[0];
};

main();
