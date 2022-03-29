import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
// import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";

import authentication from "../auth";

import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

const initialState = {
  address: null,
  subaccount: null,
  principal: null,
  anonymous: true,
  focused: true,
  icp: "0",
  anv: "0",
  map: {},
  acccan: "",
  oracle: {
    icpCycles: "160000",
    icpFee: "10000",
    pwrFee: "10000",
    anvFee: "10000",
  },
  pro: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetReducer: () => initialState,
    balancesSet: (state, action) => {
      return {
        ...state,
        icp: action.payload.icp,
        anv: action.payload.anv,
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
      const { address, subaccount, principal, anonymous, map, acccan } =
        action.payload;
      return {
        ...state,
        address,
        principal,
        anonymous,
        subaccount,
        ...(map ? { map, acccan } : {}),
      };
    },
    mapSet: (state, action) => {
      return {
        ...state,
        map: action.payload,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { resetReducer, proSet, authSet, balancesSet, focusSet, mapSet } =
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

    if (!anonymous) {
      for (let i = 0; i < 100000; i++) {
        let c = principalToAccountIdentifier(principal, i);

        if (c.substring(0, 3) === "a00") {
          address = c;
          subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(i));
          //console.log(subaccount);

          break;
        }
      }
    }

    let pro = window.localStorage.getItem("pro") == "true";
    if (pro) dispatch(proSet(true));

    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: authentication.getAgentOptions(),
    });

    let map = await router.config_get();

    map.router = map.router.toString();
    map = BigIntToString(map);

    // console.log("ROUTER MAP", map);

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

    let acccan = address
      ? PrincipalFromSlot(
          map.space,
          AccountIdentifier.TextToSlot(address, map.account)
        ).toText()
      : null;

    dispatch(
      authSet({ address, subaccount, principal, anonymous, map, acccan })
    );
    dispatch(user_refresh_balances());
  };

export const user_refresh_config = () => async (dispatch, getState) => {
  let map = await router.config_get();
  map = BigIntToString(map);
  // console.log("ROUTER MAP", map);
  dispatch(mapSet(map));
};

export const user_refresh_balances = () => async (dispatch, getState) => {
  if (!authentication || !authentication.client) return;
  if (!(await authentication.client.isAuthenticated())) return;
  await dispatch(user_refresh_icp_balance());
  if (!(await authentication.client.isAuthenticated())) return;
  dispatch(user_refresh_pwr_balance());
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

export const user_refresh_icp_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;
  if (!address) return;

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

export const user_refresh_pwr_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;
  if (!address) return;

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
    .then(async ({ pwr, anv, oracle }) => {
      // if (Number(pwr) === 0) {
      //   //TODO: Remove in production
      //   let fres = await pwrcan.faucet({
      //     aid: AccountIdentifier.TextToArray(address),
      //     amount: 800000000n,
      //   });
      //   dispatch(refresh_pwr_balance());
      //   return;
      // }

      oracle = BigIntToString(oracle);
      dispatch(
        balancesSet({ icp: pwr.toString(), anv: anv.toString(), oracle })
      );
    })
    .catch((e) => {
      // We are most probably logged out. There is currently no better way to handle expired agentjs chain
      if (e.toString().includes("delegation has expired"))
        dispatch(user_logout());
    });
};

export const user_transfer_icp =
  ({ to, amount }) =>
  async (dispatch, getState) => {
    let identity = authentication.client.getIdentity();

    let s = getState();

    let address = s.user.address;
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
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

    let trez;
    try {
      trez = await pwr.pwr_withdraw({
        amount,
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(to) },
        subaccount: subaccount,
      });

      if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

      dispatch(user_refresh_balances());
    } catch (e) {}

    return trez;
  };

export const user_pwr_buy =
  ({ amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();
    let address = s.user.address;

    let pwr = pwrCanister(
      PrincipalFromSlot(
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
      ),
      {
        agentOptions: authentication.getAgentOptions(),
      }
    );

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

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

    dispatch(user_refresh_balances());
  };

export const window_focus = () => async (dispatch, getState) => {
  dispatch(focusSet(true));
  dispatch(user_refresh_balances());
};

export const window_blur = () => async (dispatch, getState) => {
  dispatch(focusSet(false));
};

export default userSlice.reducer;
