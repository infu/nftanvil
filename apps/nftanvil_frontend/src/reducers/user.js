import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { ledger } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import Cookies from "js-cookie";
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";
import { treasuryCanister } from "@vvv-interactive/nftanvil-canisters/cjs/treasury.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";

import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { toast } from "react-toastify";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: null,
    subaccount: null,
    principal: null,
    anonymous: true,

    icp: "0",
    pwr: "0",
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
    pwrSet: (state, action) => {
      return { ...state, pwr: action.payload };
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
  },
});

// Action creators are generated for each case reducer function
export const {
  proSet,
  authSet,
  icpSet,
  setNftStorageModal,
  setNftSotrageKey,
  pwrSet,
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

    let map = await router.config_get();
    console.log("MAP", map);
    map.space = map.space.map((x) => {
      return [x[0].toString(), x[1].toString()];
    });

    let acccan = address
      ? PrincipalFromSlot(
          map.space,
          AccountIdentifier.TextToSlot(address, map.account)
        ).toText()
      : null;

    dispatch(authSet({ address, principal, anonymous, map, acccan }));
    if (!anonymous) {
      dispatch(refresh_icp_balance());
      dispatch(refresh_pwr_balance());
      dispatch(claim_treasury_balance());
    }
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

export const refresh_icp_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;

  let ledger = ledgerCanister({
    agentOptions: { identity },
  });

  await ledger
    .account_balance({
      account: AccountIdentifier.TextToArray(address),
    })
    .then((icp) => {
      let e8s = icp.e8s;
      dispatch(icpSet(e8s.toString()));
    })
    .catch((e) => {
      if (process.env.NODE_ENV === "production") console.log(e); // Will always show bug in dev mode because there is ledger canister on the local replica
    });
};

export const refresh_pwr_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;

  let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
    agentOptions: { identity },
  });

  await pwr
    .balance({
      user: { address: AccountIdentifier.TextToArray(address) },
    })
    .then((bal) => {
      dispatch(pwrSet(bal.toString()));
    });
};

export const claim_treasury_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);
  let subaccount = AccountIdentifier.TextToArray(s.user.subaccount) || [];

  let treasury = treasuryCanister(
    PrincipalFromSlot(s.user.map.space, s.user.map.treasury),
    {
      agentOptions: { identity },
    }
  );

  let icp = await treasury.balance({
    user: { address },
    subaccount,
  });

  console.log("TREASURY balance response", icp);

  if (icp > 10000n) {
    let bal = await treasury.withdraw({
      user: { address },
      subaccount,
    });

    console.log("TREASURY Withdraw response", bal);

    if (bal.ok) {
      let msg = `${AccountIdentifier.e8sToIcp(bal.ok)} ICP recieved`;
      let toastId = toast(msg, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        position: "bottom-right",
        autoClose: true,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
      });

      dispatch(refresh_icp_balance());
    }
  }
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

    dispatch(refresh_icp_balance());

    return trez;
  };

export default userSlice.reducer;
