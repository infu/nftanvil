import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { historyCanister } from "@vvv-interactive/nftanvil-canisters/cjs/history.js";

import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

import { toast } from "react-toastify";
import _ from "lodash";

export const userSlice = createSlice({
  name: "history",
  initialState: {
    lastUpdated: 0,
    total: 0,
    from: 0,
    to: 0,
    events: [],
  },
  reducers: {
    setEvents: (state, action) => {
      return {
        ...state,
        lastUpdated: Math.floor(Date.now() / 1000),
        events: action.payload,
      };
    },
    setInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setEvents, setInfo } = userSlice.actions;

export const loadInfo = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();
  let s = getState();

  let history = historyCanister(
    PrincipalFromSlot(s.user.map.space, s.user.map.history),
    { agentOptions: await authentication.getAgentOptions() }
  );

  let { total, previous } = await history.info();
  let p = {
    total,
    canister: PrincipalFromSlot(s.user.map.space, s.user.map.history).toText(),
  };
  dispatch(setInfo({ total }));
  return p;
};

export const tailHistory =
  ({ canister }) =>
  async (dispatch, getState) => {};

export const loadHistory =
  ({ canister, from, to }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();
    dispatch(loadInfo());

    let history = historyCanister(Principal.fromText(canister), {
      agentOptions: await authentication.getAgentOptions(),
    });

    let events = await history.list({
      from,
      to,
    });

    events = mapValuesDeep(events, (v) => {
      return typeof v === "bigint" ? v.toString() : v;
    });

    dispatch(setEvents(events));
  };

export const loadNftHistory =
  ({ transactions }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();
    let s = getState();

    let r = await Promise.all(
      transactions.map(async (tx_id) => {
        let { slot, idx } = TransactionId.decode(tx_id);

        let canister = PrincipalFromSlot(s.user.map.space, slot);

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

const mapValuesDeep = (obj, cb) => {
  if (_.isArray(obj)) {
    return obj.map((innerObj) => mapValuesDeep(innerObj, cb));
  } else if (_.isObject(obj)) {
    return _.mapValues(obj, (val) => mapValuesDeep(val, cb));
  } else {
    return cb(obj);
  }
};

export const cluster_info = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let map = await router.config_get();

  let log = await router.log_get();

  return { map, log };
};

export default userSlice.reducer;
