import { createSlice } from "@reduxjs/toolkit";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
// import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { produce } from "immer";
import { anvilSelector, oracleLoaded } from "./ic";
import authentication from "../identities";
import { AuthClient } from "@dfinity/auth-client";

import athene from "athena-protocol";
import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { restoreVar } from "../util";
import { load_inventory } from "./inventory";

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
      if (action.payload.provider === "ii") state.authenticated_ii = true;
      else state.authenticated = true;

      state.accounts = { ...state.accounts, ...action.payload.accounts };
    },
    user_set_main_account: (state, action) => {
      state.main_account = action.payload;
    },
  },
});

export const anvil_ready = (s) =>
  s.ic.anvil.account && s.ic.anvil.account.length !== 0;

// Action creators are generated for each case reducer function
export const {
  resetReducer,
  authenticated,
  focusSet,
  discovered,
  user_set_main_account,
} = userSlice.actions;

let iiAuthClient;
// We have to keep the authClient object in memory because calling the `authClient.login` feature should be triggered by a user interaction without any async callbacks call before calling `window.open` to open II

(async () => {
  iiAuthClient = await AuthClient.create({
    idleOptions: {
      // idleTimeout: 1000 * 60 * 30, // default is 30 minutes
      // onIdle: () => {
      //   // invalidate identity in your actor
      //   Actor.agentOf(actor).invalidateIdentity()
      //   // prompt user to refresh their authentication
      //   refreshLogin();
      // },
      disableIdle: true, // set to true to disable idle timeout
    },
  });
})();

const calc_auth = (map, identity, provider, accountNum, prefix) => {
  let principal = identity.getPrincipal().toString();
  // console.log("Principal", principal);
  if (!map) {
    console.log("Map not loaded");
    return;
  }

  let accountIdx = 0;
  let auth_obj = {};

  for (let i = 0; i < 100000; i++) {
    let c = principalToAccountIdentifier(principal, i);

    if (c.substring(0, 3) === prefix) {
      let address, subaccount;

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
        provider,
        subaccount,
        principal,
        acccan,
      };

      authentication.setIdentity(address, identity);

      accountIdx++;
      if (accountIdx >= accountNum) break;
    }
  }

  return auth_obj;
};

export const user_login_ii = (e) => async (dispatch, getState) => {
  let authClient = iiAuthClient;
  // await AuthClient.create({
  //   idleOptions: {
  //     // idleTimeout: 1000 * 60 * 30, // default is 30 minutes
  //     // onIdle: () => {
  //     //   // invalidate identity in your actor
  //     //   Actor.agentOf(actor).invalidateIdentity()
  //     //   // prompt user to refresh their authentication
  //     //   refreshLogin();
  //     // },
  //     disableIdle: true, // set to true to disable idle timeout
  //   },
  // });

  if (!(await authClient.isAuthenticated())) {
    await new Promise(async (resolve, reject) => {
      authClient.login({
        //maxTimeToLive: 10000000000n,
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

  let s = getState();
  const map = s.ic.anvil;
  let accounts = calc_auth(map, identity, "ii", 2, "a00");
  dispatch(authenticated({ provider: "ii", accounts }));
  dispatch(user_refresh_all_balances());
};

export const user_login = () => async (dispatch, getState) => {
  // let authClient = await ii_login({ allowAnonymous });

  // let anonymous = !(await authClient.isAuthenticated());

  let identity = await athene.authenticate({
    host: "https://t2o37-7qaaa-aaaam-aav7a-cai.raw.ic0.app",
    mode: "dark", // or "light"
    restore: false, // restore session automatically without prompting user (if user is already logged)
  });

  // const IIdentity = await authClient.getIdentity();

  let s = getState();
  const map = s.ic.anvil;
  let accounts = calc_auth(map, identity, "vvv", 3, "ae0");

  dispatch(authenticated({ provider: "vvv", accounts }));

  dispatch(user_refresh_all_balances());

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

export const user_refresh_all_balances = () => async (dispatch, getState) => {
  let addresses = Object.keys(getState().user.accounts);
  addresses.forEach((address) => {
    dispatch(user_refresh_balances(address));
  });
};

export const user_refresh_balances =
  (address) => async (dispatch, getState) => {
    let s = getState();

    if (s.user.authenticated || s.user.authenticated_ii) {
      // if (!authentication || !authentication.client) return;
      // if (!(await authentication.client.isAuthenticated())) return;
      await dispatch(user_refresh_icp_balance({ address }));
      // if (!(await authentication.client.isAuthenticated())) return;
      await dispatch(load_inventory(address));
      // dispatch(user_refresh_pwr_balance({ address }));

      dispatch(user_restore_purchase({ address }));
    }
  };

export const user_logout = () => async (dispatch, getState) => {
  dispatch(resetReducer());
  // dispatch(user_auth());
};

export const user_refresh_icp_balance =
  ({ address }) =>
  async (dispatch, getState) => {
    let s = getState();

    let ledger = ledgerCanister({
      agentOptions: authentication.getAgentOptions(address),
    });

    await ledger
      .account_balance({
        account: AccountIdentifier.TextToArray(address),
      })
      .then((icp) => {
        let e8s = icp.e8s;

        if (e8s >= 30000n) {
          // automatically wrap ICP
          return dispatch(user_pwr_buy({ address, amount: e8s - 10000n }));
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
        agentOptions: authentication.getAgentOptions(address),
      }
    );

    let trez = await pwr.pwr_withdraw({
      amount,
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(to) },
      subaccount: subaccount,
    });

    if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

    dispatch(user_refresh_all_balances());

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
        agentOptions: authentication.getAgentOptions(address),
      }
    );

    let intent = await pwr.pwr_purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
    });
    if (intent.err) throw intent.err;

    let paymentAddress = intent.ok;

    let ledger = ledgerCanister({
      agentOptions: authentication.getAgentOptions(address),
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

    //dispatch(user_refresh_balances(address));
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
        agentOptions: authentication.getAgentOptions(address),
      }
    );

    try {
      let claim = await pwr.pwr_purchase_claim({
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount,
      });

      if (claim.err) throw claim.err;

      let { transactionId } = claim.ok;

      dispatch(user_refresh_balances(address));
      // dispatch(user_refresh_pwr_balance());
    } catch (e) {}
  };

export default userSlice.reducer;
