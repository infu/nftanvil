import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
// import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { produce } from "immer";

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
  accounts: {},
  // address: null,
  // subaccount: null,
  // acccan: "",

  // principal: null,
  // anonymous: true,
  focused: true,
  // icp: "0",
  // anv: "0",
  map: restoreVar("map", {}),

  oracle: {
    icpCycles: "160000",
    icpFee: "10000",
    pwrFee: "10000",
    anvFee: "10000",
  },
  pro: window.localStorage.getItem("pro") === "true",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetReducer: () => initialState,
    oracleSet: (state, action) => {
      return {
        ...state,
        oracle: action.payload.oracle,
      };
    },
    focusSet: (state, action) => {
      return { ...state, focused: action.payload };
    },
    proSet: (state, action) => {
      return {
        ...state,
        pro: action.payload,
      };
    },

    authSet: (state, action) => {
      const { address, subaccount, principal, anonymous, acccan } =
        action.payload;

      return produce(state, (draft) => {
        draft.accounts[address] = {
          address,
          subaccount,
          principal,
          anonymous,
          acccan,
        };
        return draft;
      });
    },
    mapSet: (state, action) => {
      return {
        ...state,
        map: action.payload,
      };
    },
  },
});

export const anvil_ready = (state) =>
  state.user.map.account && state.user.map.account.length !== 0;

// Action creators are generated for each case reducer function
export const { resetReducer, proSet, authSet, oracleSet, focusSet, mapSet } =
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

    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: authentication.getAgentOptions(),
    });

    let map = await router.config_get();
    map.router = map.router.toString();
    map = BigIntToString(map);
    dispatch(mapSet(map));

    let accountIdx = 0;
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

          dispatch(
            authSet({ address, subaccount, principal, anonymous, acccan })
          );

          accountIdx++;
          if (accountIdx >= 3) break;
        }
      }
    }

    dispatch(user_refresh_balances(address));

    // dev helper

    if (process.env.REACT_APP_LOCAL_BACKEND) {
      console.log(
        "Proxy command:\n icx-proxy --address 127.0.0.1:8453 --dns-alias " +
          map.nft_avail
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
  dispatch(mapSet(map));
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
    dispatch(user_refresh_pwr_balance({ address }));
    dispatch(user_restore_purchase({ address }));
  };

export const user_logout = () => async (dispatch, getState) => {
  var authClient = await AuthClient.create();

  authClient.logout();

  const identity = await authClient.getIdentity();
  router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
    agentOptions: authentication.getAgentOptions(),
  });

  let principal = identity.getPrincipal().toString();
  let anonymous = !(await authClient.isAuthenticated());

  //dispatch(authSet({ address: null, principal, anonymous }));

  dispatch(resetReducer());
  dispatch(user_auth());
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

export const user_refresh_pwr_balance =
  ({ address }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let pwrcan = pwrCanister(
      PrincipalFromSlot(
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
      ),
      { agentOptions: authentication.getAgentOptions() }
    );

    await pwrcan
      .balance({
        user: { address: AccountIdentifier.TextToArray(address) },
      })
      .then(async ({ ft, oracle }) => {
        // if (Number(pwr) === 0) {
        //   //TODO: Remove in production
        //   let fres = await pwrcan.faucet({
        //     aid: AccountIdentifier.TextToArray(address),
        //     amount: 800000000n,
        //   });
        //   dispatch(refresh_pwr_balance());
        //   return;
        // }
        // let inv = Object.assign(
        //   {},
        //   ...ft.map(([id, bal]) => {
        //     return { t:id, bal: bal.toString() };
        //   })
        // );
        // console.log("FT", inv);
        oracle = BigIntToString(oracle);
        // dispatch(invMerge({ prefix: "ft", address, inv }));
        dispatch(oracleSet({ oracle }));
      })
      .catch((e) => {
        // We are most probably logged out. There is currently no better way to handle expired agentjs chain
        if (e.toString().includes("delegation has expired"))
          dispatch(user_logout());
      });
  };

export const user_pwr_transfer =
  ({ address, to, amount, memo = [] }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(),
      }
    );

    let trez = await pwr.pwr_transfer({
      amount,
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(to) },
      subaccount: subaccount,
      memo,
    });

    if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

    dispatch(user_refresh_balances(address));

    return trez;
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
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
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
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
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
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
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

export const window_focus = () => async (dispatch, getState) => {
  dispatch(focusSet(true));
  dispatch(all_user_refresh_balances());
};

export const window_blur = () => async (dispatch, getState) => {
  dispatch(focusSet(false));
};

export default userSlice.reducer;
