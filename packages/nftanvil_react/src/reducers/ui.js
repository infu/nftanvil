import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    focused: true,
    pro: window.localStorage.getItem("pro") === "true",
  },
  reducers: {
    focused: (state, action) => {
      state.focused = true;
    },
    blurred: (state, action) => {
      state.focused = false;
    },
    proChanged: (state, action) => {
      state.pro = action.payload;
    },
  },
});

export const { focused, blurred, proChanged } = uiSlice.actions;

export const window_focus = () => async (dispatch, getState) => {
  dispatch(focused());
};

export const window_blur = () => async (dispatch, getState) => {
  dispatch(blurred());
};

export default uiSlice.reducer;
