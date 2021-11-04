import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { accessCanister } from "@vvv-interactive/nftanvil-canisters/cjs/accesscontrol.js";

import authentication from "../auth";

import {
  principalToAccountIdentifier,
  encodeTokenId,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { WebAuthnIdentity } from "@dfinity/identity";
import {
  encodeArrayBuffer,
  jsonToNat8,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { Principal } from "@dfinity/principal";

import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";

import produce from "immer";
import { aid2acccan } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { createStandaloneToast } from "@chakra-ui/react";
import { theme } from "../theme.js";

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
    access: "",
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
      const { address, principal, anonymous, acclist, acccan, access } =
        action.payload;
      return {
        ...state,
        address,
        principal,
        anonymous,
        ...(acclist ? { acclist, acccan, access } : {}),
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
    let { access, acclist } = await router.fetchSetup();
    let acccan = aid2acccan(address, acclist);

    dispatch(
      authSet({ address, principal, anonymous, acclist, acccan, access })
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
  let access = accessCanister(s.user.access, { agentOptions: { identity } });

  let challenge = await access.getChallenge();
  dispatch(challengeSet(challenge));
};

export const getAccessTokenBalance = () => async (dispatch, getState) => {
  let s = getState();
  if (s.user.anonymous) return;

  let identity = authentication.client.getIdentity();
  let access = accessCanister(s.user.access, { agentOptions: { identity } });

  let balance = await access.getBalance(Principal.fromText(s.user.principal));
  dispatch(accessTokensSet(parseInt(balance, 10)));
};

export const sendSolution = (code) => async (dispatch, getState) => {
  dispatch(challengeSet(null));
  let s = getState();
  const toast = createStandaloneToast({ theme });

  if (s.user.anonymous) return;

  let identity = authentication.client.getIdentity();
  let access = accessCanister(s.user.access, { agentOptions: { identity } });

  let result = await access.sendSolution(code);
  if (result.ok) {
    dispatch(accessTokensSet(parseInt(result.ok, 10)));
    toast({
      title: "Captcha success",
      description: "You have earned 10 temporary access tokens",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } else {
    dispatch(challenge());
    toast({
      title: "Captcha failed",
      description: "It's case sensitive. Try again",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

export default userSlice.reducer;
