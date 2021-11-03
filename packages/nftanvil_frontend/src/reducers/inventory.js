import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../auth";
import { produce } from "immer";
import { aid2acccan } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

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
  },
});

export const { pageSet } = inventorySlice.actions;

export const loadInventory = (aid) => async (dispatch, getState) => {
  let identity = authentication.client
    ? authentication.client.getIdentity()
    : null;
  let s = getState();
  if (!s.user.acclist?.length) return null;
  let can = aid2acccan(aid, s.user.acclist);
  let acc = accountCanister(can, { agentOptions: { identity } });

  let pageIdx = 0;
  let list = await acc.list(aid, pageIdx);
  list = list.filter((x) => x !== "");

  dispatch(pageSet({ aid, pageIdx, list }));
};

export default inventorySlice.reducer;
