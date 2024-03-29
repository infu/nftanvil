/* global BigInt */

import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
//import { treasuryCanister } from "@vvv-interactive/nftanvil-canisters/cjs/treasury.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";

import authentication from "../auth";

import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { toast } from "react-toastify";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import {
  TransactionToast,
  TransactionFailed,
} from "../components/TransactionToast";
import { mapValues } from "lodash";

const initialState = {
  address: null,
  subaccount: null,
  principal: null,
  anonymous: true,
  focused: true,
  ft: {},
  map: {},
  acccan: "",
  oracle: {
    icpCycles: "160000",
    icpFee: "10000",
    pwrFee: "10000",
    anvFee: "10000",
  },
  pro: false,
  modal_nftstorage: false,
  key_nftstorage: null,
  disclaimer: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetReducer: () => initialState,
    balancesSet: (state, action) => {
      return {
        ...state,
        ft: action.payload.ft,
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
    setNftStorageModal: (state, action) => {
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
    setDisclaimer: (state, action) => {
      return {
        ...state,
        disclaimer: action.payload,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetReducer,
  proSet,
  authSet,
  balancesSet,
  setNftStorageModal,
  setNftSotrageKey,
  focusSet,
  mapSet,
  setDisclaimer,
} = userSlice.actions;

export const proModeSet = (v) => (dispatch) => {
  dispatch(proSet(v));
  window.localStorage.setItem("pro", v);
};

export const login = () => (dispatch) => {
  dispatch(auth(false));
};

export const hw_auth = () => async (dispatch, getState) => {
  authentication.requestHardwareAuth();
};

export const auth =
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
      principalToAccountIdentifier(principal).toUpperCase();
    }

    for (let i = 0; i < 100000; i++) {
      let c = principalToAccountIdentifier(principal, i);

      if (c.substring(0, 3) === "a00") {
        address = c;
        subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(i));
        //console.log(subaccount);

        break;
      }
    }

    dispatch(loadNftStorageKey());
    dispatch(loadDisclaimer());

    console.log("ROUTER", process.env.REACT_APP_ROUTER_CANISTER_ID);

    let pro = window.localStorage.getItem("pro") == "true";
    if (pro) dispatch(proSet(true));

    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: await authentication.getAgentOptions(),
    });

    let map = await router.config_get();

    map.router = map.router.toString();
    map = BigIntToString(map);

    console.log(
      "Treasury",
      PrincipalFromSlot(map.space, map.treasury).toText(),
      principalToAccountIdentifier(
        PrincipalFromSlot(map.space, map.treasury).toText()
      )
    );

    console.log("ROUTER MAP", map);

    // map.space = map.space.map((x) => {
    //   return [x[0].toString(), x[1].toString()];
    // });

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
    dispatch(refresh_balances());
  };

export const refresh_config = () => async (dispatch, getState) => {
  let map = await router.config_get();
  map = BigIntToString(map);
  console.log("ROUTER MAP", map);
  dispatch(mapSet(map));
};

export const refresh_balances = () => async (dispatch, getState) => {
  if (!authentication || !authentication.client) return;
  if (!(await authentication.client.isAuthenticated())) return;
  await dispatch(refresh_icp_balance());
  if (!(await authentication.client.isAuthenticated())) return;
  dispatch(refresh_pwr_balance());

  // dispatch(claim_treasury_balance());
};

export const loadDisclaimer = () => async (dispatch, getState) => {
  let key = Cookies.get("disclaimer") === "true" || false;
  dispatch(setDisclaimer(key));
};

export const saveDisclaimer = (key) => async (dispatch, getState) => {
  Cookies.set("disclaimer", key);
  dispatch(setDisclaimer(key));
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
    agentOptions: await authentication.getAgentOptions(),
  });

  let principal = identity.getPrincipal().toString();
  let anonymous = !(await authClient.isAuthenticated());
  //dispatch(authSet({ address: null, principal, anonymous }));
  dispatch(resetReducer());
  dispatch(auth());
};

export const refresh_icp_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;
  if (!address) return;

  let ledger = ledgerCanister({
    agentOptions: await authentication.getAgentOptions(),
  });

  await ledger
    .account_balance({
      account: AccountIdentifier.TextToArray(address),
    })
    .then((icp) => {
      let e8s = icp.e8s;

      if (e8s >= 30000n) {
        // automatically wrap ICP
        dispatch(pwr_buy({ amount: e8s - 10000n }));
      }
    })
    .catch((e) => {
      if (process.env.NODE_ENV === "production") console.log(e); // Will always show bug in dev mode because there is ledger canister on the local replica
    });
};

// for local testing
export const faucet =
  (token, address, amount) => async (dispatch, getState) => {
    let s = getState();

    let pwrcan = pwrCanister(
      PrincipalFromSlot(
        s.user.map.space,
        AccountIdentifier.TextToSlot(address, s.user.map.pwr)
      ),
      { agentOptions: await authentication.getAgentOptions() }
    );

    let resp = await pwrcan.faucet({
      token, //: 1,
      aid: AccountIdentifier.TextToArray(address),
      amount, //: 800000000n,
    });

    console.log(resp);
  };

export const refresh_pwr_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;
  if (!address) return;

  let pwrcan = pwrCanister(
    PrincipalFromSlot(
      s.user.map.space,
      AccountIdentifier.TextToSlot(address, s.user.map.pwr)
    ),
    { agentOptions: await authentication.getAgentOptions() }
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
      let o = Object.assign(
        {},
        ...ft.map(([id, bal]) => {
          return { [id]: bal.toString() };
        })
      );

      oracle = BigIntToString(oracle);
      dispatch(balancesSet({ ft: o, oracle }));
    })
    .catch((e) => {
      // We are most probably logged out. There is currently no better way to handle expired agentjs chain
      if (e.toString().includes("delegation has expired")) dispatch(logout());
    });
};

export const transfer_token =
  ({ id, to, amount }) =>
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
        agentOptions: await authentication.getAgentOptions(),
      }
    );

    let toastId = toast("Sending...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    let trez;
    try {
      //   'to' : User__1,
      // 'token' : FTokenId,
      // 'from' : User__1,
      // 'memo' : Memo,
      // 'subaccount' : IDL.Opt(SubAccount__1),
      // 'amount' : Balance__1,

      //to:variant {principal:principal; address:vec nat8};
      //token: nat64;
      //from:variant { principal: principal; address:vec nat8 };
      //memo:vec nat8;
      //subaccount:opt vec nat8;
      //amount: nat64

      let req = {
        token: Number(id),
        amount: Number(amount),
        memo: [0],
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(to) },
        subaccount: subaccount,
      };

      console.log(req);
      trez = await pwr.pwr_transfer(req);

      if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title={`Transfer of ${AccountIdentifier.e8sToIcp(
              amount
            )} ICP successfull.`}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });

      dispatch(refresh_balances());
    } catch (e) {
      console.error(e.message);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed
            title="Transfer failed"
            message={JSON.stringify(e.message)}
          />
        ),
      });
    }

    return trez;
  };

export const transfer_icp =
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
        agentOptions: await authentication.getAgentOptions(),
      }
    );

    let toastId = toast("Sending...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    let trez;
    try {
      trez = await pwr.pwr_withdraw({
        amount,
        from: { address: AccountIdentifier.TextToArray(address) },
        to: { address: AccountIdentifier.TextToArray(to) },
        subaccount: subaccount,
      });

      if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title={`Transfer of ${AccountIdentifier.e8sToIcp(
              amount
            )} ICP successfull.`}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });

      dispatch(refresh_balances());
    } catch (e) {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed
            title="Transfer failed"
            message={JSON.stringify(e.message)}
          />
        ),
      });
    }

    return trez;
  };

export const hw_test = () => async (dispatch, getState) => {
  let ledger = ledgerCanister({
    agentOptions: await authentication.getAgentOptions(),
  });

  let ledger_result = await ledger.transfer({
    memo: 0,
    amount: { e8s: 1000000 },
    fee: { e8s: 10000n },
    from_subaccount: [],
    to: AccountIdentifier.TextToArray(
      "a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a"
    ),
    created_at_time: [],
  });

  console.log("ledger_result", ledger_result);
};

export const pwr_buy =
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
        agentOptions: await authentication.getAgentOptions(),
      }
    );

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.subaccount) || null,
    ].filter(Boolean);

    let toastId = toast("Depositing ICP...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      isLoading: true,
    });

    let intent = await pwr.pwr_purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
    });
    if (intent.err) throw intent.err;

    let paymentAddress = intent.ok;

    let ledger = ledgerCanister({
      agentOptions: await authentication.getAgentOptions(),
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
      toast.update(toastId, {
        type: toast.TYPE.INFO,
        isLoading: true,
        render: "ICP transfer successfull. Claiming...",
        autoClose: 9000,
        pauseOnHover: true,
      });
    } else {
      console.error(ledger_result.Err);

      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: true,
        closeOnClick: true,

        render: <TransactionFailed title="ICP deposit failed" />,
      });

      return;
    }

    try {
      let claim = await pwr.pwr_purchase_claim({
        user: { address: AccountIdentifier.TextToArray(address) },
        subaccount,
      });

      if (claim.err) throw claim.err;

      let { transactionId } = claim.ok;

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="ICP deposit successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed
            title="PWR purchase failed"
            message={JSON.stringify(e)}
          />
        ),
      });
    }

    dispatch(refresh_balances());
  };

export const window_focus = () => async (dispatch, getState) => {
  dispatch(focusSet(true));
  dispatch(refresh_balances());
};

export const window_blur = () => async (dispatch, getState) => {
  dispatch(focusSet(false));
};

export default userSlice.reducer;
