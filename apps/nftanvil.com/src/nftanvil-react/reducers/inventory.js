/* global BigInt */

import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../identities";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import {
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
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
    inv_clear_temporary: (state, action) => {
      for (let k in state) {
        if (k.indexOf("tmp.attached.") === 0) delete state[k];
      }
    },
    tokenClearOptimistic: (state, action) => {
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

export const { tokenClearOptimistic, tokenMoved, loaded, inv_clear_temporary } =
  inventorySlice.actions;

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
export const inv_accept_offer =
  ({ aid, containerId, my_tokens }) =>
  async (dispatch, getState) => {
    console.log("inv_accept_offer", { aid, containerId, my_tokens });
    let s = getState();
    let address = s.user.main_account;

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
    ].filter(Boolean);

    let can = PrincipalFromSlot(
      s.ic.anvil.space,
      AccountIdentifier.TextToSlot(aid, s.ic.anvil.account)
    );

    let acc = accountCanister(can, {
      agentOptions: authentication.getAgentOptions(address),
    });
    // fill your own container

    let tokens = my_tokens;
    let requirements = [];

    let cc = await acc.container_create(subaccount, tokens, requirements);
    console.log("container_create RESP", cc);

    let takerContainerId = cc.ok.containerId;
    let c_aid = cc.ok.c_aid;
    console.log("XQWE", invConvertBack(tokens));

    // send
    await dispatch(
      inv_send_all({
        from_aid: address,
        to_aid: AccountIdentifier.ArrayToText(c_aid),
        tokens: invConvertBack(tokens),
      })
    );

    // verify
    await Promise.all(
      tokens.map((t, idx) => {
        return acc
          .container_verify(subaccount, takerContainerId, idx)
          .then((re) => {
            console.log(`verification of ${idx}`, re);
          });
      })
    );

    // initiate the swap

    let resp = await acc.container_swap(
      subaccount,
      takerContainerId,
      containerId,
      AccountIdentifier.TextToArray(aid)
    );
    console.log("container_swap", resp);
    // fetch everything
    let swapresp = await acc.container_unlock(
      AccountIdentifier.TextToArray(address),
      containerId
    );
    console.log("container_unlock", swapresp);
    return swapresp;
  };

export const inv_offer_info = (code) => async (dispatch, getState) => {
  let { aid, containerId } = JSON.parse(window.atob(code));
  console.log({ aid, containerId });

  let s = getState();

  let can = PrincipalFromSlot(
    s.ic.anvil.space,
    AccountIdentifier.TextToSlot(aid, s.ic.anvil.account)
  );

  let acc = accountCanister(can, {
    agentOptions: authentication.getAgentOptions(aid),
  });

  let info = await acc.container_info(
    AccountIdentifier.TextToArray(aid),
    BigInt(containerId)
  );

  console.log(info.ok);
  return {
    code: { aid, containerId },
    ...info.ok,
  };
};

const inv_send_all =
  ({ from_aid, to_aid, tokens }) =>
  async (dispatch, getState) => {
    let s = getState();
    console.log("inv_send_all", { from_aid, to_aid, tokens });

    for (let pos in tokens) {
      let token = tokens[pos];

      if (token.t === 0) {
        // nft
        console.log("nft send", {
          address: from_aid,
          toAddress: to_aid,
          id: token.id,
        });
        await dispatch(
          nft_transfer({
            address: from_aid,
            toAddress: to_aid,
            id: token.id,
          })
        );
      }
      if (token.t === 1) {
        // ft
        let meta = s.ft[token.id];
        let fee = "fractionless" in meta.kind ? 0n : BigInt(meta.fee);

        console.log("ft send", {
          id: token.id,
          address: from_aid,
          to: to_aid,
          amount: BigInt(token.bal) + fee,
        });
        await dispatch(
          ft_transfer({
            id: token.id,
            address: from_aid,
            to: to_aid,
            amount: BigInt(token.bal) + fee,
          })
        );
      }
    }
  };

export const inv_send_temporary =
  ({ from_aid, to_aid }) =>
  async (dispatch, getState) => {
    const tmp_two = "tmp.attached." + to_aid;

    const s = getState();

    let inv_two = s.inventory[tmp_two];

    console.log({ from_aid, to_aid, inv_two });

    for (let pos in inv_two.content) {
      let token = inv_two.content[pos];

      if (token.t === 0) {
        // nft

        dispatch(tokenMoved({ from_aid: tmp_two, to_aid, token, pos: 0 }));

        await dispatch(
          nft_transfer({
            address: from_aid,
            toAddress: to_aid,
            id: token.id,
          })
        )
          .then((rez) => {
            dispatch(
              tokenClearOptimistic({
                aid: to_aid,
                id: token.id,
              })
            );
            return rez;
          })
          .catch((e) => {
            dispatch(
              tokenMoved({
                from_aid: to_aid,
                to_aid: tmp_two,
                token,
                pos,
              })
            );

            console.log("ERRX", e);

            // dispatch(
            //   tokenClearOptimistic({
            //     aid: tmp_two,
            //     id: token.id,
            //   })
            // );
          });
      }
      if (token.t === 1) {
        // ft

        dispatch(
          tokenMoved({
            from_aid: tmp_two,
            to_aid,
            token: { ...token, optimistic: true },
            pos: 0,
            old: token,
          })
        );

        await dispatch(
          ft_transfer({
            id: token.id,
            address: from_aid,
            to: to_aid,
            amount: BigInt(token.bal),
          })
        ).catch((e) => {
          dispatch(
            tokenMoved({
              from_aid: to_aid,
              to_aid: tmp_two,
              token,
              pos,
              old: token,
            })
          );
        });

        // clear optimistic flag
        dispatch(
          tokenClearOptimistic({
            aid: to_aid,
            id: token.id,
          })
        );
      }
    }
  };

const invConvert = (inv) =>
  Object.keys(inv).map((x) =>
    inv[x].t === 0
      ? {
          nft: {
            id: tokenFromText(inv[x].id),
          },
        }
      : {
          ft: {
            id: BigInt(inv[x].id),
            balance: BigInt(inv[x].bal),
          },
        }
  );

const invConvertBack = (inv) =>
  Object.assign(
    {},
    ...inv.map((x, idx) =>
      "nft" in x
        ? {
            [idx]: {
              t: 0,
              id: tokenToText(x.nft.id),
            },
          }
        : {
            [idx]: {
              t: 1,
              id: x.ft.id.toString(),
              bal: Number(x.ft.balance),
            },
          }
    )
  );

export const inv_create_offer =
  ({ from_aid, to_aid }) =>
  async (dispatch, getState) => {
    const tmp_one = "tmp.attached." + from_aid;
    const tmp_two = "tmp.attached." + to_aid;

    const s = getState();

    let inv_one = s.inventory[tmp_one];
    let inv_two = s.inventory[tmp_two];

    console.log({ from_aid, to_aid, inv_one, inv_two });

    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[from_aid].subaccount) ||
        null,
    ].filter(Boolean);

    let can = PrincipalFromSlot(
      s.ic.anvil.space,
      AccountIdentifier.TextToSlot(from_aid, s.ic.anvil.account)
    );

    let acc = accountCanister(can, {
      agentOptions: authentication.getAgentOptions(from_aid),
    });
    console.log({ inv_one, inv_two });

    let tokens = invConvert(inv_two.content);
    let requirements = invConvert(inv_one.content);
    console.log("container_create REQ", subaccount, tokens, requirements);
    let resp = await acc.container_create(subaccount, tokens, requirements);
    console.log("container_create RESP", resp);

    let { containerId, c_aid } = resp.ok;

    console.log("Container address", AccountIdentifier.ArrayToText(c_aid));

    // send
    await dispatch(
      inv_send_all({
        from_aid: from_aid,
        to_aid: AccountIdentifier.ArrayToText(c_aid),
        tokens: inv_two.content,
      })
    );

    // verify
    await Promise.all(
      tokens.map((t, idx) => {
        return acc.container_verify(subaccount, containerId, idx).then((re) => {
          console.log(`verification of ${idx}`, re);
        });
      })
    );

    let list = await acc.container_list(subaccount);

    console.log("list", list);
    let code = window.btoa(
      JSON.stringify({
        aid: from_aid,
        containerId: Number(containerId),
      })
    );
    return code;
  };

export const move_item =
  ({ from_aid, to_aid, token, pos }) =>
  async (dispatch, getState) => {
    let tid = token.id;

    console.log({ from_aid, to_aid, tid, pos, token });

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
        console.log({ newtoken, old }, BigInt(newtoken.bal));

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
          tokenClearOptimistic({
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
