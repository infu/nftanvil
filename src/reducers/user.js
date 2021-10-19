import { createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { dropship } from "../canisters/dropship";
import { access } from "../canisters/accesscontrol";

import authentication from "../auth";

import { principalToAccountIdentifier, encodeTokenId } from "../purefunc/token";
import { WebAuthnIdentity } from "@dfinity/identity";
import { encodeArrayBuffer, jsonToNat8 } from "../purefunc/data";
import { Principal } from "@dfinity/principal";

import { nftCanister } from "../canisters/nft";
import produce from "immer";
import { NumberIncrementStepper } from "@chakra-ui/number-input";
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react-dom";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    address: null,
    principal: null,
    anonymous: true,
    owned: [],
    challenge: null,
    accesstokens: 0,
  },
  reducers: {
    ownedSet: (state, action) => {
      return { ...state, owned: action.payload };
    },
    challengeSet: (state, action) => {
      return { ...state, challenge: action.payload };
    },
    accessTokensAdd: (state, action) => {
      return { ...state, accesstokens: state.accesstokens + action.payload };
    },
    accessTokensSet: (state, action) => {
      return { ...state, accesstokens: action.payload };
    },
    authSet: (state, action) => {
      const { address, principal, anonymous } = action.payload;
      return { ...state, address, principal, anonymous };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  ownedSet,
  authSet,
  challengeSet,
  accessTokensSet,
  accessTokensAdd,
} = userSlice.actions;

export const login = () => (dispatch) => {
  dispatch(auth(false));
};

export const auth =
  (allowAnonymous = true) =>
  async (dispatch, getState) => {
    await authentication.create();
    let authClient = authentication.client;

    // await AuthClient.create();

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
    access.setOptions({ agentOptions: { identity } });

    //WARNING FOR DEBUG PURPOSES ONLY
    window.dropship = dropship;

    dispatch(authSet({ address, principal, anonymous }));
    dispatch(getAccessTokenBalance());
  };

export const logout = () => async (dispatch, getState) => {
  var authClient = await AuthClient.create();

  authClient.logout();

  const identity = await authClient.getIdentity();
  dropship.setOptions({ agentOptions: { identity } });
  access.setOptions({ agentOptions: { identity } });

  let principal = identity.getPrincipal().toString();
  let anonymous = !(await authClient.isAuthenticated());
  dispatch(authSet({ address: null, principal, anonymous }));
};

export const owned = () => async (dispatch, getState) => {
  return;
  let s = getState();
  let address = s.user.address;
  let tokens = await dropship.owned({ address });
  dispatch(ownedSet(tokens));
};

export const challenge = () => async (dispatch, getState) => {
  let challenge = await access.getChallenge();
  // challengeToImage(challenge);
  dispatch(challengeSet(challenge));
};

export const getAccessTokenBalance = () => async (dispatch, getState) => {
  let s = getState();
  if (s.user.anonymous) return;
  let balance = await access.getBalance(Principal.fromText(s.user.principal));
  dispatch(accessTokensSet(parseInt(balance, 10)));
};

export const sendSolution = (code) => async (dispatch, getState) => {
  dispatch(challengeSet(null));

  let result = await access.sendSolution(code);
  if (result.ok) dispatch(accessTokensSet(parseInt(result.ok, 10)));

  // challengeToImage(challenge);
};
export const mint = () => async (dispatch, getState) => {
  let avail_canister_id = await dropship.getAvailable();
  let identity = authentication.client.getIdentity();
  let nft = nftCanister(avail_canister_id, { agentOptions: { identity } });

  let somedata = await jsonToNat8(
    JSON.stringify({
      somefile: "oweirhwoierh woeihrwoierhwoeiwoeirhweoriwheorwheori",
      name: "funwe rwer wr werw erwerw",
      desc: "Hoola werw erwe werwer wrw rw rwre wrw erwe rwerwe rwer wrwe rw rwr ww r wrwer wrwerw rwer",
    })
  );
  let s = getState();

  let address = s.user.address;

  let mint = await nft.mintNFT({
    to: { address },
    // minter: principal,
    media: [{ img: "jowejrowjer" }],
    thumb: ["sdfsfsdf"],
    // media: null,
    // thumb: null,
    classId: 123,
    // TTL: 3,
  });
  console.log("MINT", mint);

  let tokenIndex = mint.ok;

  await nft.uploadChunk({
    tokenIndex,
    position: { content: null },
    chunkIdx: 0,
    data: somedata,
  });

  let re = await nft.fetchChunk({
    tokenIndex,
    position: { content: null },
    chunkIdx: 0,
  });

  console.log("RE", re[0], somedata);
};

export const mint2 = () => async (dispatch, getState) => {
  console.log("MINTING STARTED");
  let s = getState();
  let address = s.user.address;
  let principal = s.user.principal;

  // let metadata = await jsonToNat8(
  //   JSON.stringify({
  //     somefile: "oweirhwoierh woeihrwoierhwoeiwoeirhweoriwheorwheori",
  //     name: "funwe rwer wr werw erwerw",
  //     desc: "Hoola werw erwe werwer wrw rw rwre wrw erwe rwerwe rwer wrwe rw rwr ww r wrwer wrwerw rwer",
  //   })
  // );
  let avail_canister_id = await dropship.getAvailable();

  let identity = authentication.client.getIdentity();

  let nft = nftCanister(avail_canister_id, { agentOptions: { identity } });

  // try {
  //   let mint = await nft.mintNFT({
  //     to: { address },
  //     // minter: principal,
  //     media: [{ img: "jowejrowjer" }],
  //     thumb: ["sdfsfsdf"],
  //     // media: null,
  //     // thumb: null,
  //     classId: 123,
  //     // TTL: 3,
  //   });
  //   console.log("MINT", mint);
  //   dispatch(accessTokensAdd(-1));
  // } catch (e) {
  //   console.log("ERR", e);
  //   dispatch(challenge());
  // }

  //   console.log("MINT", mint);
  // } catch (e) {
  //   console.log("ca", e.getMessage());
  // }

  let arr = Array(20)
    .fill(0)
    .map((x) => {
      let rand_address = principalToAccountIdentifier(
        principal,
        Math.round(Math.random() * 4294967295)
      );
      return {
        to: { address: rand_address },
        // minter: principal,
        media: [{ img: "jowejrowjer" }],
        thumb: ["sdfsfsdf"],
        // media: null,
        // thumb: null,
        classId: 123,
        // TTL: 3,
      };
    });

  let minted2 = await nft.mintNFT_batch(arr);
  console.log("MINT", minted2);

  let stats = await nft.stats();
  console.log("NFT STATS", stats);
};

export const test = () => async (dispatch, getState) => {
  // let ids = await dropship.getCanisters();
  // console.log(ids.map((x) => x.toText()));
  // let identity = authentication.client.getIdentity();
  // for (let id of ids) {
  //   console.log("ID", id.toText());
  //   let nft = nftCanister(id, { agentOptions: { identity } });
  //   console.log(id.toText(), await nft.stats());
  // }
  // let canister_id = await dropship.newNFTContainer();
  // console.log("NEW canister id", canister_id.toText());
  // let nft = nftCanister(canister_id, { agentOptions: { identity } });
  // let stats = await nft.stats();
  // console.log("NFT STATS", stats);
};

export default userSlice.reducer;
