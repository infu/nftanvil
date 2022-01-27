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
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import {
  TransactionToast,
  TransactionFailed,
} from "../components/TransactionToast";

export const userSlice = createSlice({
  name: "user",
  initialState: {
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
    modal_nftstorage: false,
    key_nftstorage: null,
  },
  reducers: {
    icpSet: (state, action) => {
      return { ...state, icp: action.payload };
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
  focusSet,
} = userSlice.actions;

export const proModeSet = (v) => (dispatch) => {
  dispatch(proSet(v));
  window.localStorage.setItem("pro", v);
};

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
    let address =
      !anonymous && principalToAccountIdentifier(principal).toUpperCase();

    dispatch(loadNftStorageKey());

    console.log("ROUTER", process.env.REACT_APP_ROUTER_CANISTER_ID);

    let pro = window.localStorage.getItem("pro") == "true";
    if (pro) dispatch(proSet(true));

    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: { identity },
    });

    let map = await router.config_get();
    console.log("MAP", map);
    map.space = map.space.map((x) => {
      return [x[0].toString(), x[1].toString()];
    });

    if (process.env.NODE_ENV !== "production") {
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

    dispatch(authSet({ address, principal, anonymous, map, acccan }));
    dispatch(refresh_balances());
  };

export const refresh_balances = () => async (dispatch, getState) => {
  if (!authentication || !authentication.client) return;
  if (!(await authentication.client.isAuthenticated())) return;
  await dispatch(refresh_icp_balance());
  if (!(await authentication.client.isAuthenticated())) return;
  dispatch(refresh_pwr_balance());
  dispatch(claim_treasury_balance());
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
  if (!address) return;

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
      if (e8s >= 30000n) {
        // automatically wrap ICP
        dispatch(pwr_buy({ amount: e8s - 10000n }));
      }
    })
    .catch((e) => {
      if (process.env.NODE_ENV === "production") console.log(e); // Will always show bug in dev mode because there is ledger canister on the local replica
    });
};

export const refresh_pwr_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = s.user.address;
  if (!address) return;

  let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
    agentOptions: { identity },
  });

  await pwr
    .balance({
      user: { address: AccountIdentifier.TextToArray(address) },
    })
    .then((bal) => {
      dispatch(icpSet(bal.toString()));
    })
    .catch((e) => {
      // We are most probably logged out. There is currently no better way to handle expired agentjs chain
      if (e.toString().includes("delegation has expired")) dispatch(logout());
    });
};

export const claim_treasury_balance = () => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();

  let s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);
  let subaccount = AccountIdentifier.TextToArray(s.user.subaccount) || [];
  if (!address) return;

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

  //console.log("TREASURY balance response", icp);

  if (icp > 10000n) {
    let bal = await treasury.withdraw({
      user: { address },
      subaccount,
    });

    //console.log("TREASURY Withdraw response", bal);

    if (bal.ok) {
      let toastId = toast(
        <TransactionToast
          title="Treasury balance widthdrawn"
          transactionId={bal.ok.transactionId}
        />,
        {
          isLoading: false,
          type: toast.TYPE.SUCCESS,
          position: "bottom-right",
          autoClose: true,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
        }
      );

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
      trez = await ledger.transfer({
        memo: 0,
        amount: { e8s: amount },
        fee: { e8s: 10000n },
        from_subaccount: subaccount,
        to: to,
        created_at_time: [],
      });

      if ("Err" in trez) throw trez["Err"];

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

      dispatch(refresh_icp_balance());
    } catch (e) {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed title="Transfer failed" message={e.message} />
        ),
      });
    }

    return trez;
  };

export const pwr_buy =
  ({ amount }) =>
  async (dispatch, getState) => {
    let s = getState();

    let identity = authentication.client.getIdentity();

    let pwr = pwrCanister(PrincipalFromSlot(s.user.map.space, s.user.map.pwr), {
      agentOptions: { identity },
    });

    let address = s.user.address;
    let subaccount = AccountIdentifier.TextToArray(s.user.subaccount) || [];

    let toastId = toast("Purchasing PWR...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      isLoading: true,
    });

    let intent = await pwr.purchase_intent({
      user: { address: AccountIdentifier.TextToArray(address) },
      subaccount,
    });
    if (intent.err) throw intent.err;

    let paymentAddress = intent.ok;

    let ledger = ledgerCanister({ agentOptions: { identity } });

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

        render: <TransactionFailed title="ICP transfer failed" />,
      });

      return;
    }

    try {
      let claim = await pwr.purchase_claim({
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
            title="PWR purchase successfull"
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
