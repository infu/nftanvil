import { createSlice } from "@reduxjs/toolkit";
import { err2text } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

export const taskSlice = createSlice({
  name: "task",
  initialState: { next: 0, toasts: {} },
  reducers: {
    task_start: (state, action) => {
      const { task_id, options = {} } = action.payload;
      state[task_id] = { result: false, options };
    },
    task_end: (state, action) => {
      const { task_id, result = { err: false, msg: "" } } = action.payload;
      const { err = false, msg } = result;
      state[task_id].result = { err, msg };
    },
    task_clear: (state, action) => {
      const { task_id } = action.payload;
      delete state[task_id];
    },
  },
});

export const { task_start, task_end, task_clear } = taskSlice.actions;

export const task_run =
  (task_id, fn, opt = {}) =>
  async (dispatch) => {
    try {
      dispatch(task_start({ task_id }));

      let resp = await fn();

      dispatch(
        task_end({ task_id, result: { err: false, msg: opt.successMsg } })
      );
      return resp;
    } catch (e) {
      dispatch(task_end({ task_id, result: { err: true, msg: err2text(e) } }));
    }
  };

export default taskSlice.reducer;
