import dotenv from "dotenv";

import { Principal } from "@dfinity/principal";
import * as cRouter from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import * as cNft from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import * as cAccount from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import * as cPwr from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import * as cAnvil from "@vvv-interactive/nftanvil-canisters/cjs/anvil.js";
import * as cLedger from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import * as cTreasury from "@vvv-interactive/nftanvil-canisters/cjs/treasury.js";
import * as cHistory from "@vvv-interactive/nftanvil-canisters/cjs/history.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
export { PrincipalFromSlot };

import { encodeTokenId } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import fetch from "node-fetch";
import { fileIdentity } from "./identity.js";

dotenv.config({});
let identity = fileIdentity();

import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

let host =
  process.env.NETWORK !== "ic" ? "http://localhost:8000" : "https://ic0.app";

export const slotcan = (fn, slot) => {
  let canister = PrincipalFromSlot(map.space, slot).toText();

  let can = fn(canister, { agentOptions: { fetch, identity, host } });
  return can;
};

export const routerCanister = async () => {
  let id = process.env.ROUTER_CANISTER;
  let { router, agent } = cRouter.routerCanister(id, {
    agentOptions: { fetch, identity, host },
  });

  let principal = await agent.getPrincipal();
  if (!map) map = await router.config_get();

  let address = null;
  let subaccount = null;
  for (let i = 0; i < 100000; i++) {
    let c = principalToAccountIdentifier(principal.toText(), i);

    if (c.substring(0, 3) === "a00") {
      address = c;
      subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(i));

      break;
    }
  }

  return { router, principal, address, subaccount, id, map, identity };
};

let map = null;
export const getMap = async () => {
  return map;
};

export const refreshMap = async () => {
  let { router } = await routerCanister();
  map = await router.config_get();
};

export const claimBalance = async (address, subaccount) => {
  //let map = await getMap();

  // ssss
  let pwr = pwrCanister(
    PrincipalFromSlot(
      map.space,
      AccountIdentifier.TextToSlot(address, map.pwr)
    ),
    {
      agentOptions: { fetch, identity, host },
    }
  );
  //
  let ledger = ledgerCanister({
    agentOptions: { fetch, identity, host },
  });

  let amount = await ledger
    .account_balance({
      account: AccountIdentifier.TextToArray(address),
    })
    .then((icp) => {
      let e8s = icp.e8s;
      return icp.e8s - 10000n;
    })
    .catch((e) => {
      return 0n;
    });

  if (amount < 20000n) return;

  let intent = await pwr.pwr_purchase_intent({
    user: { address: AccountIdentifier.TextToArray(address) },
    subaccount: [AccountIdentifier.TextToArray(subaccount)],
  });

  if (intent.err) throw intent.err;

  let paymentAddress = intent.ok;

  let ledger_result = await ledger.transfer({
    memo: 0,
    amount: { e8s: amount },
    fee: { e8s: 10000n },
    from_subaccount: [AccountIdentifier.TextToArray(subaccount)],
    to: paymentAddress,
    created_at_time: [],
  });

  if (ledger_result.Ok) {
  } else {
    console.error(ledger_result.Err);
    return;
  }

  // eeee

  // let pwr = pwrCanister(
  //   PrincipalFromSlot(
  //     map.space,
  //     AccountIdentifier.TextToSlot(address, map.pwr)
  //   ),
  //   {
  //     agentOptions: { fetch, identity, host },
  //   }
  // );

  await pwr
    .pwr_purchase_claim({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount: [AccountIdentifier.TextToArray(subaccount)],
    })
    .catch((e) => {});

  let balance = await pwr.balance({
    user: { address: AccountIdentifier.TextToArray(address) },
  });

  return balance;
};

export const nftCanister = (id) => {
  return cNft.nftCanister(id, { agentOptions: { fetch, identity, host } });
};

export const anvilCanister = (id) => {
  return cAnvil.anvilCanister(id, { agentOptions: { fetch, identity, host } });
};

export const pwrCanister = (id) => {
  return cPwr.pwrCanister(id, { agentOptions: { fetch, identity, host } });
};

export const historyCanister = (id) => {
  return cHistory.historyCanister(id, {
    agentOptions: { fetch, identity, host },
  });
};

export const ledgerCanister = () => {
  return cLedger.ledgerCanister({ agentOptions: { fetch, identity, host } });
};

export const treasuryCanister = () => {
  return cTreasury.treasuryCanister({
    agentOptions: { fetch, identity, host },
  });
};

export const accountCanister = (id) => {
  return cAccount.accountCanister(id, {
    agentOptions: { fetch, identity, host },
  });
};

export { fileIdentity, encodeTokenId, Principal, AccountIdentifier };
