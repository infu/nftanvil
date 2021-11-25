import dotenv from "dotenv";

import { Principal } from "@dfinity/principal";
import * as cRouter from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import * as cFrontend from "@vvv-interactive/nftanvil-canisters/cjs/frontend.js";
import * as cNft from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import * as cAccess from "@vvv-interactive/nftanvil-canisters/cjs/accesscontrol.js";
import * as cAccount from "@vvv-interactive/nftanvil-canisters/cjs/account.js";

import { encodeTokenId } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import fetch from "node-fetch";
import { fileIdentity } from "./identity.js";

dotenv.config(
  process.env.NODE_ENV !== "production" ? { path: ".dev.env" } : {}
);
let identity = fileIdentity();

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

let host =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:8000"
    : "https://" + process.env.FRONTEND_CANISTER + ".ic0.app";

if (process.env.NODE_ENV !== "production")
  console.log("WARNING RUNNING IN LOCAL DEVELOPMENT MODE");

export const routerCanister = async () => {
  let id = process.env.ROUTER_CANISTER;

  let { router, agent } = cRouter.routerCanister(id, {
    agentOptions: { fetch, identity, host },
  });

  let principal = await agent.getPrincipal();

  let address = principalToAccountIdentifier(principal.toText());

  return { router, principal, address, id };
};

export const nftCanister = (id) => {
  return cNft.nftCanister(id, { agentOptions: { fetch, identity, host } });
};

export const accessCanister = (id) => {
  return cAccess.accessCanister(id, {
    agentOptions: { fetch, identity, host },
  });
};

export const accountCanister = (id) => {
  return cAccount.accountCanister(id, {
    agentOptions: { fetch, identity, host },
  });
};

export { fileIdentity, encodeTokenId, Principal };
