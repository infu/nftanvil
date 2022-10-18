import { createSlice } from "@reduxjs/toolkit";
import { produce } from "immer";
import { store } from "../index";

export const toastSlice = createSlice({
  name: "toast",
  initialState: { next: 0, toasts: {} },
  reducers: {
    add: (state, action) => {
      state.toasts[state.next] = action.payload;
      state.next++;
    },
    rem: (state, action) => {
      delete state.toasts[action.payload.id];
    },
    update: (state, action) => {
      state.toasts[action.payload.id] = action.payload.toast;
    },
  },
});

export const { add, rem, update } = toastSlice.actions;

export const toast_create = (p) => async (dispatch, getState) => {
  dispatch(add(p));
  let s = getState();
  let id = s.toast.next - 1;
  if (p.timeout !== false) p.timeout = 5000;
  if (p.timeout)
    setTimeout(() => {
      dispatch(rem({ id }));
    }, p.timeout);
  return id;
};

export const toast_update = (id, toast) => async (dispatch, getState) => {
  dispatch(update({ id, toast }));

  if (toast.timeout !== false) toast.timeout = 5000;
  if (toast.timeout)
    setTimeout(() => {
      dispatch(rem({ id }));
    }, toast.timeout);
  return id;
};

export default toastSlice.reducer;
