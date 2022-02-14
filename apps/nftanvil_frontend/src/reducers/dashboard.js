import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { routerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";

import { historyCanister } from "@vvv-interactive/nftanvil-canisters/cjs/history.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import authentication from "../auth";
import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

export const pwr_stats = () => async (dispatch, getState) => {
  let s = getState();
  let canisterId = PrincipalFromSlot(s.user.map.space, s.user.map.pwr);
  let identity = authentication.client.getIdentity();

  let pwr = pwrCanister(canisterId, { agentOptions: { identity } });
  let stats = await pwr.stats();
  stats = BigIntToString(stats);
  return stats;
};

export const router_stats = () => async (dispatch, getState) => {
  let s = getState();
  let canisterId = s.user.map.router;
  let identity = authentication.client.getIdentity();
  let { router } = routerCanister(canisterId, {
    agentOptions: { identity },
  });

  let stats = await router.stats();

  stats = BigIntToString(stats);
  return stats;
};

export const nft_stats =
  ({ slot }) =>
  async (dispatch, getState) => {
    let s = getState();
    let canisterId = PrincipalFromSlot(s.user.map.space, slot);
    let identity = authentication.client.getIdentity();

    let nft = nftCanister(canisterId, { agentOptions: { identity } });
    let stats = await nft.stats();
    stats.canister = canisterId.toText();

    return stats;
  };

export const account_stats =
  ({ slot }) =>
  async (dispatch, getState) => {
    let s = getState();
    let canisterId = PrincipalFromSlot(s.user.map.space, slot);
    let identity = authentication.client.getIdentity();

    let can = accountCanister(canisterId, { agentOptions: { identity } });
    let stats = await can.stats();
    stats.canister = canisterId.toText();

    return stats;
  };

export const history_stats =
  ({ slot }) =>
  async (dispatch, getState) => {
    let s = getState();
    let canisterId = PrincipalFromSlot(s.user.map.space, slot);
    let identity = authentication.client.getIdentity();

    let can = historyCanister(canisterId, { agentOptions: { identity } });
    let stats = await can.stats();
    stats.canister = canisterId.toText();

    return stats;
  };
