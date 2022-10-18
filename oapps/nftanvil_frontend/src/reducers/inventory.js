import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../auth";
import { produce } from "immer";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

export const positionRestore = () => {
  let obj = {};
  try {
    obj = JSON.parse(window.localStorage.getItem("pos"));
    if (!obj) obj = {};
  } catch (e) {}
  console.log("RESTORING", obj);
  return obj;
};

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: { positions: positionRestore() },
  reducers: {
    pageSet: (state, action) => {
      return produce(state, (draft) => {
        if (!draft[action.payload.aid]) draft[action.payload.aid] = [];
        draft[action.payload.aid][action.payload.pageIdx] = action.payload.list;
        return draft;
      });
    },
    positionSet: (state, action) => {
      return produce(state, (draft) => {
        draft.positions[action.payload.id] = action.payload.pos;
      });
    },
    metaSet: (state, action) => {
      return { ...state, [action.payload.aid + "meta"]: action.payload.meta };
    },
    verifiedDomainSet: (state, action) => {
      return {
        ...state,
        [action.payload.domain + "_domain"]: action.payload.data,
      };
    },
  },
});

export const { pageSet, metaSet, verifiedDomainSet, positionSet } =
  inventorySlice.actions;

export const loadInventory =
  (aid, pageIdx, max) => async (dispatch, getState) => {
    let identity = authentication.client
      ? authentication.client.getIdentity()
      : null;

    let s = getState();
    if (!s.user.map.account?.length) return null;

    let can = PrincipalFromSlot(
      s.user.map.space,
      AccountIdentifier.TextToSlot(aid, s.user.map.account)
    );
    let acc = accountCanister(can, {
      agentOptions: await authentication.getAgentOptions(),
    });

    let meta = await acc.meta(AccountIdentifier.TextToArray(aid));
    if (meta[0]) dispatch(metaSet({ aid, meta: meta[0] }));
    // console.log("ACC META", meta);

    pageIdx = parseInt(pageIdx, 10);
    let list = await acc.list(
      AccountIdentifier.TextToArray(aid),
      pageIdx * max,
      (pageIdx + 1) * max
    );
    list = list.filter((x) => x !== 0n).map((x) => tokenToText(x));
    dispatch(pageSet({ aid, pageIdx, list }));
  };

export const positionSave =
  ({ id, pos }) =>
  async (dispatch, getState) => {
    dispatch(positionSet({ id, pos }));
    let ser = JSON.stringify(getState().inventory.positions);
    window.localStorage.setItem("pos", ser);
  };

export const verifyDomainTwitter = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.inventory[domain + "_domain"] === undefined) {
    dispatch(verifiedDomainSet({ domain, data: -1 }));

    let data = await new Promise((resolve, reject) => {
      fetch("https://nftpkg.com/api/v1/verify?url=" + domain)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          try {
            resolve(data.text.replace(/[\s]+/gs, ""));
          } catch (e) {
            console.log(e);
            resolve(false);
          }
        })
        .catch((e) => {
          resolve(false);
        });
    });

    dispatch(verifiedDomainSet({ domain, data }));
  }
};

export const verifyDomain = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.inventory[domain + "_domain"] === undefined) {
    dispatch(verifiedDomainSet({ domain, data: -1 }));

    let data = await new Promise((resolve, reject) => {
      fetch("https://" + domain + "/.well-known/nftanvil.json")
        .then((response) => response.json())
        .then((data) => {
          try {
            resolve(data);
          } catch (e) {
            console.log(e);
            resolve(false);
          }
        })
        .catch((e) => {
          console.log(e);
          resolve(false);
        });
    });

    dispatch(verifiedDomainSet({ domain, data }));
  }
};

export default inventorySlice.reducer;
