import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { dropship } from "../canisters/dropship";
import { principalToAccountIdentifier, encodeTokenId } from "../purefunc/token";
import { WebAuthnIdentity } from "@dfinity/identity";

import produce from "immer";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: null,
    anonymous: true,
    owned: [],
  },
  reducers: {
    ownedSet: (state, action) => {
      return { ...state, owned: action.payload };
    },
    authSet: (state, action) => {
      const { address, principal, anonymous } = action.payload;
      return { ...state, address, principal, anonymous };
    },
  },
});

// Action creators are generated for each case reducer function
export const { ownedSet, authSet } = userSlice.actions;

export const login = () => (dispatch) => {
  dispatch(auth(false));
};

export const auth =
  (allowAnonymous = true) =>
  async (dispatch, getState) => {
    let authClient = await AuthClient.create();

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
    dropship.setOptions({ agentOptions: { identity } });
    dispatch(authSet({ address, principal, anonymous }));
  };

export const logout = () => async (dispatch, getState) => {
  var authClient = await AuthClient.create();

  authClient.logout();

  const identity = await authClient.getIdentity();
  dropship.setOptions({ agentOptions: { identity } });
  let principal = identity.getPrincipal().toString();
  let anonymous = !(await authClient.isAuthenticated());
  dispatch(authSet({ address: null, principal, anonymous }));
};

export const owned = () => async (dispatch, getState) => {
  let s = getState();
  let address = s.user.address;
  let tokens = await dropship.owned({ address });
  dispatch(ownedSet(tokens));
};

export default userSlice.reducer;
