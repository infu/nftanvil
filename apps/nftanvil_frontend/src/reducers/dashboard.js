import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import { historyCanister } from "@vvv-interactive/nftanvil-canisters/cjs/history.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import authentication from "../auth";

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
