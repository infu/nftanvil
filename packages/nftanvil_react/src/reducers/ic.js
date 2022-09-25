import { createSlice } from "@reduxjs/toolkit";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { restoreVar } from "../util";

import authentication from "../auth";

export const icSlice = createSlice({
  name: "ic",
  initialState: {
    anvil: restoreVar("ic_anvil", {}),
    oracle: {
      icpCycles: "160000",
      icpFee: "10000",
      pwrFee: "10000",
      anvFee: "10000",
    },
  },
  reducers: {
    oracleLoaded: (state, action) => {
      state.oracle = action.payload.oracle;
    },

    discovered: (state, action) => {
      state.anvil = action.payload;
    },
  },
});

export const { oracleLoaded, discovered } = icSlice.actions;

export const anvil_discover = () => async (dispatch, getState) => {
  let map = await router.config_get();
  map.router = map.router.toString();
  map = BigIntToString(map);
  dispatch(discovered(map));
};

export default icSlice.reducer;
