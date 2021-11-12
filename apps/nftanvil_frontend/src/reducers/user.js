import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { accessCanister } from "@vvv-interactive/nftanvil-canisters/cjs/accesscontrol.js";

import authentication from "../auth";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { Principal } from "@dfinity/principal";

import { aid2acccan } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import { toast } from "react-toastify";
export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: null,
    subaccount: null,
    principal: null,
    anonymous: true,
    challenge: null,
    accesstokens: 0,
    acclist: [],
    acccan: "",
    accesslist: [],
    pro: false,
  },
  reducers: {
    challengeSet: (state, action) => {
      return { ...state, challenge: action.payload };
    },
    accessTokensAdd: (state, action) => {
      return { ...state, accesstokens: state.accesstokens + action.payload };
    },
    accessTokensSet: (state, action) => {
      return { ...state, accesstokens: action.payload };
    },
    acclistSet: (state, action) => {
      return { ...state, acclist: action.payload };
    },
    proSet: (state, action) => {
      return {
        ...state,
        pro: action.payload,
      };
    },
    authSet: (state, action) => {
      const { address, principal, anonymous, acclist, acccan, accesslist } =
        action.payload;
      return {
        ...state,
        address,
        principal,
        anonymous,
        ...(acclist ? { acclist, acccan, accesslist } : {}),
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  proSet,
  authSet,
  challengeSet,
  accessTokensSet,
  accessTokensAdd,
  acclistSet,
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
    let address = !anonymous && principalToAccountIdentifier(principal);
    router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {
      agentOptions: { identity },
    });
    let { accesslist, acclist } = await router.fetchSetup();
    let acccan = aid2acccan(address, acclist);

    dispatch(
      authSet({ address, principal, anonymous, acclist, acccan, accesslist })
    );

    dispatch(getAccessTokenBalance());
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

export const challenge = () => async (dispatch, getState) => {
  let s = getState();
  if (s.user.anonymous) return;

  let identity = authentication.client.getIdentity();

  let accesscan = aid2acccan(s.user.principal, s.user.accesslist);

  let access = accessCanister(accesscan, { agentOptions: { identity } });

  let challenge = await access.getChallenge();
  dispatch(challengeSet(challenge));
};

export const getAccessTokenBalance = () => async (dispatch, getState) => {
  let s = getState();
  if (s.user.anonymous) return;

  let identity = authentication.client.getIdentity();

  let accesscan = aid2acccan(s.user.principal, s.user.accesslist);

  let access = accessCanister(accesscan, { agentOptions: { identity } });

  let balance = await access.getBalance(Principal.fromText(s.user.principal));
  dispatch(accessTokensSet(parseInt(balance, 10)));
};

export const sendSolution = (code) => async (dispatch, getState) => {
  dispatch(challengeSet(null));
  let s = getState();

  if (s.user.anonymous) return;

  let identity = authentication.client.getIdentity();

  let accesscan = aid2acccan(s.user.principal, s.user.accesslist);

  let access = accessCanister(accesscan, { agentOptions: { identity } });

  let result = await access.sendSolution(code);
  if (result.ok) {
    dispatch(accessTokensSet(parseInt(result.ok, 10)));
    toast.success(
      <div>
        <div>Captcha success</div>
        <div>You have earned 10 temporary access tokens</div>
      </div>,
      {
        position: "bottom-right",
      }
    );
  } else {
    dispatch(challenge());
    toast.error(
      <div>
        <div>Captcha failed</div>
      </div>,
      {
        position: "bottom-right",
      }
    );
  }
};

export default userSlice.reducer;
