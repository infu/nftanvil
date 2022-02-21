import dotenv from "dotenv";

import { Principal } from "@dfinity/principal";
import * as cRouter from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import * as cNft from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import * as cAccount from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import * as cPwr from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
export { PrincipalFromSlot };

import { encodeTokenId } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import fetch from "node-fetch";
import { fileIdentity } from "./identity.js";

dotenv.config(
  process.env.NODE_ENV !== "production" ? { path: ".dev.env" } : {}
);
let identity = fileIdentity();

import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

let host =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:8000"
    : "https://" + process.env.FRONTEND_CANISTER + ".ic0.app";

if (process.env.NODE_ENV !== "production")
  console.log("WARNING RUNNING IN LOCAL DEVELOPMENT MODE");

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

  let balance = await claimBalance(address, subaccount);
  return { router, principal, address, subaccount, balance, id, map, identity };
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
  let map = await getMap();

  let pwr = pwrCanister(PrincipalFromSlot(map.space, map.pwr), {
    agentOptions: { identity },
  });

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

export const pwrCanister = (id) => {
  return cPwr.pwrCanister(id, { agentOptions: { fetch, identity, host } });
};

export const accountCanister = (id) => {
  return cAccount.accountCanister(id, {
    agentOptions: { fetch, identity, host },
  });
};

export { fileIdentity, encodeTokenId, Principal, AccountIdentifier };
