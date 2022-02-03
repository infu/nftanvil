import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../auth";
import { produce } from "immer";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
export const inventorySlice = createSlice({
  name: "inventory",
  initialState: {},
  reducers: {
    pageSet: (state, action) => {
      return produce(state, (draft) => {
        if (!draft[action.payload.aid]) draft[action.payload.aid] = [];
        draft[action.payload.aid][action.payload.pageIdx] = action.payload.list;
        return draft;
      });
    },
    metaSet: (state, action) => {
      return { ...state, [action.payload.aid + "meta"]: action.payload.meta };
    },
  },
});

export const { pageSet, metaSet } = inventorySlice.actions;

export const loadInventory = (aid, pageIdx) => async (dispatch, getState) => {
  let identity = authentication.client
    ? authentication.client.getIdentity()
    : null;
  let s = getState();
  if (!s.user.map.account?.length) return null;

  let can = PrincipalFromSlot(
    s.user.map.space,
    AccountIdentifier.TextToSlot(aid, s.user.map.account)
  );
  let acc = accountCanister(can, { agentOptions: { identity } });

  let meta = await acc.meta(AccountIdentifier.TextToArray(aid));
  if (meta[0]) dispatch(metaSet({ aid, meta: meta[0] }));
  console.log("ACC META", meta);

  pageIdx = parseInt(pageIdx, 10);
  let list = await acc.list(AccountIdentifier.TextToArray(aid), pageIdx);
  list = list.filter((x) => x !== 0).map((x) => tokenToText(x));

  dispatch(pageSet({ aid, pageIdx, list }));
};

export default inventorySlice.reducer;
