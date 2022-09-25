import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
// import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { produce } from "immer";
import { anvilSelector, oracleLoaded } from "./ic";
import authentication from "../auth";

import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { restoreVar } from "../util";

const initialState = {
  authenticated: false,
  accounts: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetReducer: () => initialState,

    authenticated: (state, action) => {
      state.authenticated = true;
      state.accounts = action.payload;
    },
  },
});

export const anvil_ready = (s) =>
  s.ic.anvil.account && s.ic.anvil.account.length !== 0;

// Action creators are generated for each case reducer function
export const { resetReducer, authenticated, focusSet, discovered } =
  userSlice.actions;

export const user_login = () => (dispatch) => {
  dispatch(user_auth(false));
};

export const user_auth =
  (allowAnonymous = true) =>
  async (dispatch, getState) => {
    await authentication.create();
    let authClient = authentication.client;

    if (!allowAnonymous && !(await authClient.isAuthenticated())) {
      await new Promise(async (resolve, reject) => {
        authClient.login({
          //maxTimeToLive: 10000000000n,
          ...(process.env.REACT_APP_IDENTITY_PROVIDER
            ? { identityProvider: process.env.REACT_APP_IDENTITY_PROVIDER }
            : {}),
          onSuccess: async (e) => {
            console.log(authClient);
            resolve();
          },
          onError: reject,
        });
      });
    }

    const identity = await authClient.getIdentity();

    let principal = identity.getPrincipal().toString();
    let anonymous = !(await authClient.isAuthenticated());
    let address, subaccount;

    let s = getState();
    let map = s.ic.anvil;
    if (!map) {
      console.log("Map not loaded");
      return;
    }

    let accountIdx = 0;
    let auth_obj = {};
    if (!anonymous) {
      for (let i = 0; i < 100000; i++) {
        let c = principalToAccountIdentifier(principal, i);

        if (c.substring(0, 3) === "a00") {
          address = c;
          subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(i));
          let acccan = address
            ? PrincipalFromSlot(
                map.space,
                AccountIdentifier.TextToSlot(address, map.account)
              ).toText()
            : null;

          auth_obj[address] = {
            address,
            subaccount,
            principal,
            acccan,
          };

          accountIdx++;
          if (accountIdx >= 3) break;
        }
      }

      dispatch(authenticated(auth_obj));

      dispatch(user_refresh_balances(address));
    }

    // dev helper

    if (process.env.REACT_APP_LOCAL_BACKEND) {
      console.log(
        "Proxy command:\n icx-proxy --address 127.0.0.1:8453 --dns-alias " +
          [...map.nft_avail, map.tokenregistry]
            .map(
              (slot) =>
                `${slot}.lvh.me:${PrincipalFromSlot(map.space, slot).toText()}`
            )
            .join(" ")
      );
    }
  };

export const user_refresh_config = () => async (dispatch, getState) => {
  let map = await router.config_get();
  map = BigIntToString(map);
  window.localStorage.setItem("map", JSON.stringify(map));
  dispatch(discovered(map));
};

export const all_user_refresh_balances = () => async (dispatch, getState) => {
  let addresses = Object.keys(getState().user.accounts);
  addresses.forEach((address) => {
    dispatch(user_refresh_balances(address));
  });
};

export const user_refresh_balances =
  (address) => async (dispatch, getState) => {
    if (!authentication || !authentication.client) return;
    if (!(await authentication.client.isAuthenticated())) return;
    await dispatch(user_refresh_icp_balance({ address }));
    if (!(await authentication.client.isAuthenticated())) return;
    // dispatch(user_refresh_pwr_balance({ address }));
    dispatch(user_restore_purchase({ address }));
  };

export const user_logout = () => async (dispatch, getState) => {
  authentication.client.logout();

  dispatch(resetReducer());
  // dispatch(user_auth());
};

export const user_refresh_icp_balance =
  ({ address }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let ledger = ledgerCanister({
      agentOptions: authentication.getAgentOptions(),
    });

    await ledger
      .account_balance({
        account: AccountIdentifier.TextToArray(address),
      })
      .then((icp) => {
        let e8s = icp.e8s;

        if (e8s >= 30000n) {
          // automatically wrap ICP
          dispatch(user_pwr_buy({ amount: e8s - 10000n }));
        }
      })
      .catch((e) => {
        if (!process.env.REACT_APP_LOCAL_BACKEND) console.log(e); // Will always show bug in dev mode because there is ledger canister on the local replica
      });
  };

export const user_transfer_icp =
  ({ address, to, amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.ic.anvil.space,
        AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(),
      }
    );

    let trez = await pwr.pwr_withdraw({
      amount,
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(to) },
      subaccount: subaccount,
    });

    if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

    dispatch(user_refresh_balances(address));

    return trez;
  };

export const user_pwr_buy =
  ({ address, amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.ic.anvil.space,
        AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(),
      }
    );

    let intent = await pwr.pwr_purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
    });
    if (intent.err) throw intent.err;

    let paymentAddress = intent.ok;

    let ledger = ledgerCanister({
      agentOptions: authentication.getAgentOptions(),
    });

    let ledger_result = await ledger.transfer({
      memo: 0,
      amount: { e8s: amount },
      fee: { e8s: 10000n },
      from_subaccount: subaccount,
      to: paymentAddress,
      created_at_time: [],
    });

    if (ledger_result.Ok) {
    } else {
      console.error(ledger_result.Err);
      return;
    }

    try {
      let claim = await pwr.pwr_purchase_claim({
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount,
      });

      if (claim.err) throw claim.err;

      let { transactionId } = claim.ok;
    } catch (e) {}

    dispatch(user_refresh_balances(address));
  };

export const user_restore_purchase =
  ({ address }) =>
  async (dispatch, getState) => {
    let s = getState();

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.ic.anvil.space,
        AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(),
      }
    );

    try {
      let claim = await pwr.pwr_purchase_claim({
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount,
      });

      if (claim.err) throw claim.err;

      let { transactionId } = claim.ok;

      dispatch(user_refresh_pwr_balance());
    } catch (e) {}
  };

export default userSlice.reducer;
