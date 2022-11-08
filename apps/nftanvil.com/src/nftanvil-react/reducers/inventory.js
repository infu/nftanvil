/* global BigInt */

import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../identities";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import debounce from "lodash/debounce";
import { restoreVar } from "../util";
import { nft_transfer } from "./nft";
import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { ft_transfer } from "./ft";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { dialog_open } from "./dialog";
import { toast_create } from "./toast";
import { ft_fetch_meta } from "./ft";

const TYPE_NFT = 0;
const TYPE_FT = 1;

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: restoreVar("inv", {}),
  reducers: {
    loaded: (state, action) => {
      if (!state[action.payload.address])
        state[action.payload.address] = { content: {} };

      // add all tokens in list from type in their proper positions
      for (let token of action.payload.list) {
        let pos =
          findToken(state[action.payload.address].content, token.id) ||
          findNewPos(state[action.payload.address].content, 0);
        state[action.payload.address].content[pos] = token;
      }

      // remove tokens which aren't owned anymore
      for (let pos in state[action.payload.address].content) {
        if (state[action.payload.address].content[pos].t !== action.payload.t)
          continue; // skip other token types
        if (
          action.payload.list.findIndex(
            (x) => x.id === state[action.payload.address].content[pos].id
          ) === -1
        ) {
          delete state[action.payload.address].content[pos];
        }
      }
    },
    tokenMovedSuccess: (state, action) => {
      let { aid, id, token } = action.payload;

      let pos = findToken(state[aid].content, id);
      if (!pos) return;
      delete state[aid].content[pos].optimistic;
    },
    tokenMoved: (state, action) => {
      let { to_aid, from_aid, token, old, pos } = action.payload;

      if (!state[to_aid]) state[to_aid] = { content: {} };

      let oldpos = Object.keys(state[from_aid].content).find(
        (x) => state[from_aid].content[x].id === token.id
      );

      if (old) {
        if (state[from_aid].content[oldpos]) {
          state[from_aid].content[oldpos].bal = (
            BigInt(state[from_aid].content[oldpos].bal) - BigInt(old.bal)
          ).toString();
          delete state[from_aid].content[oldpos].optimistic;
          if (BigInt(state[from_aid].content[oldpos].bal) <= 0)
            delete state[from_aid].content[oldpos];
        }
      } else delete state[from_aid].content[oldpos];

      // find another pos if already taken

      if (token.t === TYPE_FT) {
        let newpos =
          findToken(state[to_aid].content, token.id) ||
          findNewPos(state[to_aid].content, pos);
        if (state[to_aid].content[newpos]) {
          state[to_aid].content[newpos].optimistic = token.optimistic;
          state[to_aid].content[newpos].bal = (
            BigInt(state[to_aid].content[newpos].bal) + BigInt(token.bal)
          ).toString();
        } else {
          state[to_aid].content[newpos] = token;
        }
      } else {
        // token already in inventory
        if (findToken(state[to_aid].content, token.id)) return;

        let newpos = !state[to_aid].content[pos]
          ? pos
          : findNewPos(state[to_aid].content, pos);

        state[to_aid].content[newpos] = token;
      }
    },
  },
});

const findToken = (inv, tid) => {
  for (let place in inv) {
    if (inv[place] && inv[place].id === tid) return place;
  }
  return false;
};

export const tokenSelector = (address, tid) => (state) => {
  let f = findToken(state.inventory[address].content, tid);
  if (f) return state.inventory[address].content[f];
  return false;
};

const findNewPos = (inv, start) => {
  var freeIdx = start;

  while (inv[freeIdx]) {
    freeIdx++;
  }
  //console.log(inv, { freeIdx, tid });
  return freeIdx;
};

export const { tokenMovedSuccess, tokenMoved, loaded } = inventorySlice.actions;

export const load_author = (aid) => async (dispatch, getState) => {
  let x = await fetch("https://nftpkg.com/api/v1/marketplace/" + aid).then(
    (x) => x.json()
  );
  return x;
};

const splitTmpName = (txt) => {
  let [_, id, address] = txt.split(".");
  return { id, address };
};

export const move_item =
  ({ from_aid, to_aid, token, pos }) =>
  async (dispatch, getState) => {
    let tid = token.id;
    // console.log({ from_aid, to_aid, tid, pos, token });
    let s = getState();

    let from =
      from_aid.indexOf("tmp") === 0
        ? { t: "temp", ...splitTmpName(from_aid) }
        : s.user.accounts[from_aid]
        ? { t: "my", address: from_aid }
        : { t: "foreign", address: from_aid };
    let to =
      to_aid.indexOf("tmp") === 0
        ? { t: "temp", ...splitTmpName(from_aid) }
        : s.user.accounts[to_aid]
        ? { t: "my", address: to_aid }
        : { t: "foreign", address: to_aid };

    let inv = getState().inventory;

    let old_pos = Object.keys(inv[from_aid].content).find(
      (pos) => inv[from_aid].content[pos].id === tid
    );
    // console.log(from, to, old_pos);

    if (from_aid === to_aid) {
      dispatch(tokenMoved({ from_aid, to_aid, token, pos }));
    } else if (from.t === "my" && to.t === "my") {
      if (token.t === TYPE_NFT) {
        dispatch(tokenMoved({ from_aid, to_aid, token, pos }));

        dispatch(
          nft_transfer({
            address: from_aid,
            toAddress: to_aid,
            id: tid,
          })
        ).catch((e) => {
          dispatch(
            tokenMoved({
              from_aid: to_aid,
              to_aid: from_aid,
              token,
              pos: old_pos,
            })
          );

          console.log("ERR", e);
        });
      } else {
        let fee = s.ft[tid].fee;

        let { newtoken, old } = await dispatch(
          fungibleAmountDialog({ from_aid, to_aid, token, pos })
        );
        // console.log({ newtoken, old });

        dispatch(
          tokenMoved({
            from_aid,
            to_aid,
            token: { ...newtoken, optimistic: true },
            pos: pos,
            old,
          })
        );

        await dispatch(
          ft_transfer({
            id: token.id,
            address: from_aid,
            to: to_aid,
            amount: BigInt(newtoken.bal), //- BigInt(fee)
          })
        ).catch((e) => {
          // console.log(e);
          // revert
          dispatch(
            tokenMoved({
              from_aid: to_aid,
              to_aid: from_aid,
              token: old,
              pos: old_pos,
              old: newtoken,
            })
          );
        });

        // clear optimistic flag
        dispatch(
          tokenMovedSuccess({
            aid: to_aid,
            id: token.id,
          })
        );
      }
      //
    } else if (from.t === "temp" || to.t === "temp") {
      if (token.owner === to.address) {
        dispatch(tokenMoved({ from_aid, to_aid, token, pos }));
      }
      //
    } else if (to.t === "foreign" || from.t === "foreign") {
      if (token.t === TYPE_FT) {
        let { newtoken, old } = await dispatch(
          fungibleAmountDialog({ from_aid, to_aid, token, pos })
        );
        dispatch(
          tokenMoved({
            from_aid,
            to_aid: "tmp.attached." + to_aid,
            token: { ...newtoken, owner: from_aid },
            pos: 0,
            old: old,
          })
        );
      } else {
        dispatch(
          tokenMoved({
            from_aid,
            to_aid: "tmp.attached." + to_aid,
            token: { ...token, owner: from_aid },
            pos: 0,
          })
        );
      }
    }

    debounced_save_inventory(dispatch);
  };

const fungibleAmountDialog =
  ({ from_aid, to_aid, token, pos }) =>
  async (dispatch, getState) => {
    return dispatch(
      dialog_open({
        name: "transfer",
        data: {
          from_aid,
          to_aid,
          token,
        },
      })
    ).then(({ amount }) => {
      let s = getState();
      let fee = BigInt(s.ft[token.id].fee);

      if (BigInt(amount) < fee) throw Error("Amount smaller than fee");

      let total = (BigInt(amount) + fee).toString();

      let old = { ...token, bal: total.toString() };

      let newtoken = { ...token, bal: amount.toString() };

      return { newtoken, old };
    });
  };

const debounced_save_inventory = debounce((dispatch) => {
  dispatch(save_inventory());
}, 3000);

export const load_inventory_ft = (address) => async (dispatch, getState) => {
  let s = getState();
  let pwrcan = pwrCanister(
    PrincipalFromSlot(
      s.ic.anvil.space,
      AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
    ),
    { agentOptions: authentication.getAgentOptions(address) }
  );

  await pwrcan
    .balance({
      user: { address: AccountIdentifier.TextToArray(address) },
    })
    .then(async ({ ft, oracle }) => {
      let list = ft
        .map(([id, bal]) => {
          // console.log("BAL", bal);
          if (bal === 0n) return false; // TODO: clean up in contracts
          dispatch(ft_fetch_meta(id)); // lets preload tokens
          return { t: TYPE_FT, id: Number(id), bal: bal.toString() };
        })
        .filter(Boolean);

      // oracle = BigIntToString(oracle);

      dispatch(loaded({ t: TYPE_FT, address, list }));
      // dispatch(oracleSet({ oracle }));
    })
    .catch((e) => {});
};

export const load_inventory = (aid) => async (dispatch, getState) => {
  dispatch(load_inventory_nft(aid));
  dispatch(load_inventory_ft(aid));
};

export const load_inventory_nft = (aid) => async (dispatch, getState) => {
  let s = getState();
  if (!s.ic.anvil.account?.length) return null;

  let can = PrincipalFromSlot(
    s.ic.anvil.space,
    AccountIdentifier.TextToSlot(aid, s.ic.anvil.account)
  );

  let acc = accountCanister(can, {
    agentOptions: authentication.getAgentOptions(false),
  });

  let pageIdx = 0;
  let max = 100;

  // let inv = Object.assign({}, getState().inventory[aid] || {});

  let list = await acc.list(
    AccountIdentifier.TextToArray(aid),
    pageIdx * max,
    (pageIdx + 1) * max
  );
  list = [...list];
  list = list
    .map(tokenToText)
    .filter(Boolean)
    .map((x) => ({ id: x, t: TYPE_NFT }));

  dispatch(loaded({ t: TYPE_NFT, address: aid, list }));
};

export const save_inventory = () => async (dispatch, getState) => {
  let inv = Object.fromEntries(
    Object.entries(getState().inventory).filter(
      ([key]) => key.indexOf("tmp") !== 0
    )
  );

  window.localStorage.setItem("inv", JSON.stringify(inv));
};

export default inventorySlice.reducer;
