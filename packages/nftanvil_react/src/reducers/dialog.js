import { createSlice } from "@reduxjs/toolkit";
import { store } from "../index";

export const dialogSlice = createSlice({
  name: "dialog",
  initialState: {},
  reducers: {
    dialogOpenInternal: (state, action) => {
      state[action.payload.name] = action.payload.data || {};
    },
    dialogResult: (state, action) => {
      state[action.payload.name].result = action.payload.result;
      if (action.payload.reject)
        state[action.payload.name].reject = action.payload.reject;
    },

    dialogCloseInternal: (state, action) => {
      delete state[action.payload.name];
    },
  },
});

export const { dialogOpenInternal, dialogCloseInternal, dialogResult } =
  dialogSlice.actions;

export const dialog_open = (arg) => async (dispatch, getState) => {
  let name = arg.name;
  return new Promise((resolve, reject) => {
    dispatch(dialogOpenInternal(arg));
    const unsubscribe = store.subscribe(() => {
      let state = getState();
      if (state.dialog[name].result) {
        unsubscribe();
        dispatch(dialogCloseInternal({ name }));
        if (state.dialog[name].reject) reject();
        else resolve(state.dialog[name].result);
      }
    });
  });
};

export default dialogSlice.reducer;
