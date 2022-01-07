import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import Cookies from "js-cookie";
import { historyCanister } from "@vvv-interactive/nftanvil-canisters/cjs/history.js";

import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import { toast } from "react-toastify";

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
      return { ...state, events: action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setEvents, setInfo } = userSlice.actions;

export const loadInfo = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();
  console.log("LOADING INFO");
  let s = getState();

  let history = historyCanister(Principal.fromText(s.user.map.history), {
    agentOptions: { identity },
  });

  let { total, previous } = await history.info();
  dispatch(setInfo({ total, previous }));
  console.log("Info result", { total, previous });
  return { total, canister: s.user.map.history };
};

export const loadHistory =
  ({ canister, from, to }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let history = historyCanister(Principal.fromText(canister), {
      agentOptions: { identity },
    });

    let events = await history.list({
      from,
      to,
    });
    dispatch(setEvents(events));
    console.log("Events result", events);
  };

export default userSlice.reducer;
