import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "../canisters/account";
import authentication from "../auth";

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: {},
  reducers: {
    pageSet: (state, action) => {
      return {
        ...state,
        [action.payload.aid]: {},
      };
    },
  },
});

export const { pageSet } = inventorySlice.actions;

export const loadInventory = (aid) => async (dispatch, getState) => {
  console.log("FETCHING INVENTORY");
  let identity = authentication.client.getIdentity();
  let s = getState();
  let can = s.user.acccan;
  let address = s.user.address;
  let acc = accountCanister(can, { agentOptions: { identity } });
  // console.log("LISTING", can, address);
  let owned = await acc.list(address, 0);
  owned = owned.filter((x) => x !== "");
  console.log("OWNED", owned);
};

export default inventorySlice.reducer;
