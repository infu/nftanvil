import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";

import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import { toast } from "react-toastify";
export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: null,
    subaccount: null,
    principal: null,
    anonymous: true,

    icp: "0",
    map: { acclist: [] },
    acccan: "",

    pro: false,
    modal_nftstorage: false,
    key_nftstorage: null,
  },
  reducers: {
    icpSet: (state, action) => {
      return { ...state, icp: action.payload };
    },
    proSet: (state, action) => {
      return {
        ...state,
        pro: action.payload,
      };
    },
    authSet: (state, action) => {
      const { address, principal, anonymous, map, acccan } = action.payload;
      return {
        ...state,
        address,
        principal,
        anonymous,
        ...(map ? { map, acccan } : {}),
      };
    },
    setNftSotrageModal: (state, action) => {
      return {
        ...state,
        modal_nftstorage: action.payload,
      };
    },
    setNftSotrageKey: (state, action) => {
      return {
        ...state,
        key_nftstorage: action.payload,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  proSet,
  authSet,

  icpSet,
  setNftSotrageModal,
  setNftSotrageKey,
} = userSlice.actions;

export const login = () => (dispatch) => {
  dispatch(auth(false));
};

export const auth =
  (allowAnonymous = true) =>
  async (dispatch, getState) => {
    await authentication.create();
    let authClient = authentication.client;

    if (!allowAnonymous && !(await authClient.isAuthenticated())) {
      await new Promise(async (resolve, reject) => {
        authClient.login({
          ...(process.env.REACT_APP_IDENTITY_PROVIDER
            ? { identityProvider: process.env.REACT_APP_IDENTITY_PROVIDER }
            : {}),
          onSuccess: async (e) => {
            resolve();
          },
          onError: reject,
        });
      });
    }

    const identity = await authClient.getIdentity();

    let principal = identity.getPrincipal().toString();
    let anonymous = !(await authClient.isAuthenticated());
    let address =
      !anonymous && principalToAccountIdentifier(principal).toUpperCase();

    dispatch(loadNftStorageKey());

    console.log("ROUTER", process.env.REACT_APP_ROUTER_CANISTER_ID);

    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: { identity },
    });

    let map = await router.fetchSetup();

    let acccan = address
      ? AccountIdentifier.TextToSlot(address, map.acclist)
      : null;

    dispatch(authSet({ address, principal, anonymous, map, acccan }));
  };

export const loadNftStorageKey = () => async (dispatch, getState) => {
  let key = Cookies.get("nftstoragekey");
  dispatch(setNftSotrageKey(key));
};

export const saveNftStorageKey = (key) => async (dispatch, getState) => {
  Cookies.set("nftstoragekey", key);
  dispatch(setNftSotrageKey(key));
};

export const logout = () => async (dispatch, getState) => {
  var authClient = await AuthClient.create();

  authClient.logout();

  const identity = await authClient.getIdentity();
  router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
    agentOptions: { identity },
  });

  let principal = identity.getPrincipal().toString();
  let anonymous = !(await authClient.isAuthenticated());
  dispatch(authSet({ address: null, principal, anonymous }));
};

export const transfer_icp =
  ({ to, amount }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let address = s.user.address;
    let subaccount = AccountIdentifier.TextToArray(s.user.subaccount) || [];

    let ledger = ledgerCanister({ agentOptions: { identity } });

    let trez = await ledger.transfer({
      memo: 0,
      amount: { e8s: amount },
      fee: { e8s: 10000n },
      from_subaccount: subaccount,
      to: to,
      created_at_time: [],
    });

    console.log("TREZ", trez);
  };

export default userSlice.reducer;
