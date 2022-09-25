import { createSlice } from "@reduxjs/toolkit";

export const verifySlice = createSlice({
  name: "verify",
  initialState: {},
  reducers: {
    loaded: (state, action) => {
      state[action.payload.domain] = action.payload.data;
    },
  },
});

export const { loaded } = verifySlice.actions;

export const verify_domain_twitter = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.verification[domain] === undefined) {
    dispatch(loaded({ domain, data: -1 }));

    let data = await new Promise((resolve, reject) => {
      fetch("https://nftpkg.com/api/v1/verify?url=" + domain)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          try {
            resolve(data.text.replace(/[\s]+/gs, ""));
          } catch (e) {
            console.log(e);
            resolve(false);
          }
        })
        .catch((e) => {
          resolve(false);
        });
    });

    dispatch(loaded({ domain, data }));
  }
};

export const verify_domain = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.verification[domain] === undefined) {
    dispatch(loaded({ domain, data: -1 }));

    let data = await new Promise((resolve, reject) => {
      fetch("https://" + domain + "/.well-known/nftanvil.json")
        .then((response) => response.json())
        .then((data) => {
          try {
            resolve(data);
          } catch (e) {
            console.log(e);
            resolve(false);
          }
        })
        .catch((e) => {
          console.log(e);
          resolve(false);
        });
    });

    dispatch(loaded({ domain, data }));
  }
};

export default verifySlice.reducer;
