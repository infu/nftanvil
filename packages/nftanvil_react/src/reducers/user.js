import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    test: false,
  },
  reducers: {
    test: (state, action) => {
      return {
        ...state,
        test: !state.test,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { test } = userSlice.actions;

export default userSlice.reducer;
