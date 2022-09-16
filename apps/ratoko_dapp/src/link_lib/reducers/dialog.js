import { createSlice } from "@reduxjs/toolkit";
import { produce } from "immer";
import { store } from "../index";

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: {},
  reducers: {
    dialogOpenInternal: (state, action) => {
      return produce(state, (draft) => {
        draft[action.payload.name] = action.payload.data;
        return draft;
      });
    },
    dialogResult: (state, action) => {
      return produce(state, (draft) => {
        draft[action.payload.name].result = action.payload.result;
        if (action.payload.reject)
          draft[action.payload.name].reject = action.payload.reject;

        return draft;
      });
    },

    dialogCloseInternal: (state, action) => {
      return produce(state, (draft) => {
        delete draft[action.payload.name];
        return draft;
      });
    },
  },
});

export const { dialogOpenInternal, dialogCloseInternal, dialogResult } =
  inventorySlice.actions;

export const dialogOpen = (arg) => async (dispatch, getState) => {
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

export default inventorySlice.reducer;
