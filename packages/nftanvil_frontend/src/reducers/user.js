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
    router.setOptions({ agentOptions: { identity } });

    //WARNING FOR DEBUG PURPOSES ONLY //TODO: REMOVE it from window
    window.router = router;

    let { access, acclist } = await router.fetchSetup();
    let acccan = aid2acccan(address, acclist);
    //console.log("ACCCAN", address, acccan);

    dispatch(
      authSet({ address, principal, anonymous, acclist, acccan, access })
    );

    dispatch(getAccessTokenBalance());
  };

export const logout = () => async (dispatch, getState) => {
  var authClient = await AuthClient.create();

  authClient.logout();

  const identity = await authClient.getIdentity();
  router.setOptions({ agentOptions: { identity } });
  // access.setOptions({ agentOptions: { identity } });

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
  // challengeToImage(challenge);
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

  // challengeToImage(challenge);
};

// export const mint2 = () => async (dispatch, getState) => {
//   console.log("MINTING STARTED");
//   let s = getState();
//   let address = s.user.address;
//   let principal = s.user.principal;

//   // let metadata = await jsonToNat8(
//   //   JSON.stringify({
//   //     somefile: "oweirhwoierh woeihrwoierhwoeiwoeirhweoriwheorwheori",
//   //     name: "funwe rwer wr werw erwerw",
//   //     desc: "Hoola werw erwe werwer wrw rw rwre wrw erwe rwerwe rwer wrwe rw rwr ww r wrwer wrwerw rwer",
//   //   })
//   // );
//   let avail_canister_id = await router.getAvailable();

//   let identity = authentication.client.getIdentity();

//   let nft = nftCanister(avail_canister_id, { agentOptions: { identity } });

//   // try {
//   //   let mint = await nft.mintNFT({
//   //     to: { address },
//   //     // minter: principal,
//   //     media: [{ img: "jowejrowjer" }],
//   //     thumb: ["sdfsfsdf"],
//   //     // media: null,
//   //     // thumb: null,
//   //     classId: 123,
//   //     // TTL: 3,
//   //   });
//   //   console.log("MINT", mint);
//   //   dispatch(accessTokensAdd(-1));
//   // } catch (e) {
//   //   console.log("ERR", e);
//   //   dispatch(challenge());
//   // }

//   //   console.log("MINT", mint);
//   // } catch (e) {
//   //   console.log("ca", e.getMessage());
//   // }

//   let arr = Array(20)
//     .fill(0)
//     .map((x) => {
//       let rand_address = principalToAccountIdentifier(
//         principal,
//         Math.round(Math.random() * 4294967295)
//       );
//       return {
//         to: { address: rand_address },
//         // minter: principal,
//         media: [{ img: "jowejrowjer" }],
//         thumb: ["sdfsfsdf"],
//         // media: null,
//         // thumb: null,
//         classId: 123,
//         // TTL: 3,
//       };
//     });

//   let minted2 = await nft.mintNFT_batch(arr);
//   console.log("MINT", minted2);

//   let stats = await nft.stats();
//   console.log("NFT STATS", stats);
// };

// export const test = () => async (dispatch, getState) => {
//   // let ids = await router.getCanisters();
//   // console.log(ids.map((x) => x.toText()));
//   // let identity = authentication.client.getIdentity();
//   // for (let id of ids) {
//   //   console.log("ID", id.toText());
//   //   let nft = nftCanister(id, { agentOptions: { identity } });
//   //   console.log(id.toText(), await nft.stats());
//   // }
//   // let canister_id = await router.newNFTContainer();
//   // console.log("NEW canister id", canister_id.toText());
//   // let nft = nftCanister(canister_id, { agentOptions: { identity } });
//   // let stats = await nft.stats();
//   // console.log("NFT STATS", stats);
// };

export default userSlice.reducer;
