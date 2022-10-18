import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { historyCanister } from "@vvv-interactive/nftanvil-canisters/cjs/history.js";
import { SerializableIC } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

export const historySlice = createSlice({
  name: "history",
  initialState: {
    lastUpdated: 0,
    total: 0,
    from: 0,
    to: 0,
    events: [],
  },
  reducers: {
    loaded: (state, action) => {
      state.lastUpdated = Math.floor(Date.now() / 1000);
      state.events = action.payload;
    },
    setInfo: (state, action) => {
      let { total } = action.payload;
      state.total = total;
    },
  },
});

// Action creators are generated for each case reducer function
export const { loaded, setInfo } = historySlice.actions;

export const history_load_info = () => async (dispatch, getState) => {
  let s = getState();

  let history = historyCanister(
    PrincipalFromSlot(s.ic.anvil.space, s.ic.anvil.history),
    { agentOptions: await authentication.getAgentOptions() }
  );

  let { total, previous } = await history.info();
  let p = {
    total,
    canister: PrincipalFromSlot(s.ic.anvil.space, s.ic.anvil.history).toText(),
  };
  dispatch(setInfo({ total }));
  return p;
};

export const tailHistory =
  ({ canister }) =>
  async (dispatch, getState) => {};

export const history_load =
  ({ canister, from, to }) =>
  async (dispatch, getState) => {
    let s = getState();
    dispatch(history_load_info());

    let history = historyCanister(Principal.fromText(canister), {
      agentOptions: await authentication.getAgentOptions(),
    });

    let events = await history.list({
      from,
      to,
    });

    events = SerializableIC(events);

    dispatch(loaded(events));
  };

export const loadNftHistory =
  ({ transactions }) =>
  async (dispatch, getState) => {
    let s = getState();

    let r = await Promise.all(
      transactions.map(async (tx_id) => {
        let { slot, idx } = TransactionId.decode(tx_id);

        let canister = PrincipalFromSlot(s.ic.anvil.space, slot);

        let history = historyCanister(canister, {
          agentOptions: await authentication.getAgentOptions(),
        });
        let resp = await history.list({
          from: idx,
          to: idx + 1,
        });
        return {
          idx,
          canister: canister.toText(),
          data: resp[0] ? resp[0][0] : null,
        };
      })
    );
    return r;
  };

export const cluster_info = () => async (dispatch, getState) => {
  let s = getState();

  let map = await router.config_get();

  let log = await router.log_get();

  return { map, log };
};

export default historySlice.reducer;
