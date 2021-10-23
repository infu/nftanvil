import { createSlice } from "@reduxjs/toolkit";
import authentication from "../auth";

export const nftSlice = createSlice({
  name: "nft",
  initialState: {
    meta: {},
  },
  reducers: {
    nftSet: (state, action) => {
      return {
        ...state,
        meta: { ...state.meta, [action.payload.id]: action.payload.metadata },
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { nftSet } = nftSlice.actions;

export const nftFetchMeta = (id) => async (dispatch, getState) => {
  let identity = authentication.client.getIdentity();
  let s = getState();

  let nft = nftCanister(avail_canister_id, { agentOptions: { identity } });
};

export default nftSlice.reducer;
