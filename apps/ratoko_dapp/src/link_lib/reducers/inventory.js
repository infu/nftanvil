/* global BigInt */

import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import authentication from "../auth";
import { produce } from "immer";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import debounce from "lodash/debounce";
import { restoreVar } from "../util";
import { nft_transfer } from "./nft";
import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { oracleSet } from "./user";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { dialogOpen } from "./dialog";
const TYPE_NFT = 0;
const TYPE_FT = 1;

export const inventorySlice = createSlice({
  name: "inventory",
  initialState: restoreVar("inv", {}),
  reducers: {
    invSet: (state, action) => {
      return produce(state, (draft) => {
        draft[action.payload.aid] = action.payload.inv;
        return draft;
      });
    },
    invMerge: (state, action) => {
      return produce(state, (draft) => {
        if (!draft[action.payload.address]) draft[action.payload.address] = {};

        // add all tokens in list from type in their proper positions
        for (let token of action.payload.list) {
          let pos =
            findToken(draft[action.payload.address], token.id) ||
            findNewPos(draft[action.payload.address], 0);
          draft[action.payload.address][pos] = token;
        }

        // remove tokens which aren't owned anymore
        for (let pos in draft[action.payload.address]) {
          if (draft[action.payload.address][pos].t !== action.payload.t)
            continue; // skip other token types
          if (
            action.payload.list.findIndex(
              (x) => x.id === draft[action.payload.address][pos].id
            ) === -1
          ) {
            delete draft[action.payload.address][pos];
          }
        }

        return draft;
      });
    },
    invMove: (state, action) => {
      let { to_aid, from_aid, token, old, pos } = action.payload;
      return produce(state, (draft) => {
        if (!draft[to_aid]) draft[to_aid] = {};

        let oldpos = Object.keys(draft[from_aid]).find(
          (x) => draft[from_aid][x].id === token.id
        );

        if (old) draft[from_aid][oldpos] = old;
        else delete draft[from_aid][oldpos];

        // find another pos if already taken

        if (token.t === TYPE_FT) {
          let newpos =
            findToken(draft[to_aid], token.id) ||
            findNewPos(draft[to_aid], pos);
          if (draft[to_aid][newpos]) {
            draft[to_aid][newpos].bal = (
              BigInt(draft[to_aid][newpos].bal) + BigInt(token.bal)
            ).toString();
          } else {
            draft[to_aid][newpos] = token;
          }
        } else {
          // token already in inventory
          if (findToken(draft[to_aid], token.id)) return draft;

          let newpos = !draft[to_aid][pos]
            ? pos
            : findNewPos(draft[to_aid], pos);

          draft[to_aid][newpos] = token;
        }

        return draft;
      });
    },
    metaSet: (state, action) => {
      return { ...state, [action.payload.aid + "meta"]: action.payload.meta };
    },
    verifiedDomainSet: (state, action) => {
      return {
        ...state,
        [action.payload.domain + "_domain"]: action.payload.data,
      };
    },
  },
});

const findToken = (inv, tid) => {
  for (let place in inv) {
    if (inv[place] && inv[place].id === tid) return place;
  }
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

export const { invSet, invMove, metaSet, invMerge, verifiedDomainSet } =
  inventorySlice.actions;

export const load_author = (aid) => async (dispatch, getState) => {
  let x = await fetch("https://nftpkg.com/api/v1/marketplace/" + aid).then(
    (x) => x.json()
  );
  return x;
};

export const move_item =
  ({ from_aid, to_aid, token, pos }) =>
  async (dispatch, getState) => {
    let tid = token.id;
    console.log({ from_aid, to_aid, tid, pos, token });
    let s = getState();

    let from =
      from_aid.indexOf("tmp") === 0
        ? "temp"
        : s.user.accounts[from_aid]
        ? "my"
        : "foreign";
    let to =
      to_aid.indexOf("tmp") === 0
        ? "temp"
        : s.user.accounts[to_aid]
        ? "my"
        : "foreign";

    let inv = getState().inventory;

    let old_pos = Object.keys(inv[from_aid]).find(
      (pos) => inv[from_aid][pos] === tid
    );

    if (from_aid === to_aid) {
      dispatch(invMove({ from_aid, to_aid, token, pos }));
    } else if (from === "my" && to === "my") {
      if (token.t === TYPE_NFT) {
        dispatch(invMove({ from_aid, to_aid, token, pos }));

        dispatch(
          nft_transfer({
            address: from_aid,
            toAddress: to_aid,
            id: tid,
          })
        ).catch((e) => {
          dispatch(
            invMove({ from_aid: to_aid, to_aid: from_aid, token, pos: old_pos })
          );

          console.log("ERR", e);
        });
      } else {
        dispatch(
          dialogOpen({
            name: "transfer",
            data: {
              from_aid,
              to_aid,
              token,
            },
          })
        )
          .then(({ amount }) => {
            if (BigInt(amount) < BigInt(10000)) return null;
            let diff = BigInt(token.bal) - BigInt(amount);
            let old = diff === 0n ? false : { ...token, bal: diff.toString() };
            let newtoken = { ...token, bal: amount };

            dispatch(invMove({ from_aid, to_aid, token: newtoken, pos, old }));
          })
          .catch((e) => {
            console.log("CATCH E", e);
          });
        return;
      }
      //
    } else if (from === "temp" || to === "temp") {
      dispatch(invMove({ from_aid, to_aid, token, pos }));
      //
    } else if (from === "my" && to === "foreign") {
      //
    } else if (from === "foreign") {
      //
    }

    debounced_save_inventory(dispatch);
  };

const debounced_save_inventory = debounce((dispatch) => {
  dispatch(save_inventory());
}, 3000);

export const load_inventory_ft = (address) => async (dispatch, getState) => {
  let s = getState();

  let pwrcan = pwrCanister(
    PrincipalFromSlot(
      s.user.map.space,
      AccountIdentifier.TextToSlot(address, s.user.map.pwr)
    ),
    { agentOptions: authentication.getAgentOptions() }
  );

  await pwrcan
    .balance({
      user: { address: AccountIdentifier.TextToArray(address) },
    })
    .then(async ({ ft, oracle }) => {
      let list = ft.map(([id, bal]) => {
        return { t: TYPE_FT, id: Number(id), bal: bal.toString() };
      });

      oracle = BigIntToString(oracle);
      console.log(list);
      dispatch(invMerge({ type: TYPE_FT, address, list }));
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
  if (!s.user.map.account?.length) return null;

  let can = PrincipalFromSlot(
    s.user.map.space,
    AccountIdentifier.TextToSlot(aid, s.user.map.account)
  );

  let acc = accountCanister(can, {
    agentOptions: authentication.getAgentOptions(),
  });

  let pageIdx = 0;
  let max = 100;

  // let inv = Object.assign({}, getState().inventory[aid] || {});

  let list = await acc.list(
    AccountIdentifier.TextToArray(aid),
    pageIdx * max,
    (pageIdx + 1) * max
  );

  list = list
    .map(tokenToText)
    .filter(Boolean)
    .map((x) => ({ id: x, t: TYPE_NFT }));

  console.log(list);

  dispatch(invMerge({ t: TYPE_NFT, address: aid, list }));
};

export const save_inventory = () => async (dispatch, getState) => {
  let inv = Object.fromEntries(
    Object.entries(getState().inventory).filter(
      ([key]) => key.indexOf("tmp") !== 0
    )
  );

  window.localStorage.setItem("inv", JSON.stringify(inv));
};

export const verify_domain_twitter = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.inventory[domain + "_domain"] === undefined) {
    dispatch(verifiedDomainSet({ domain, data: -1 }));

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

    dispatch(verifiedDomainSet({ domain, data }));
  }
};

export const verify_domain = (domain) => async (dispatch, getState) => {
  let s = getState();

  if (s.inventory[domain + "_domain"] === undefined) {
    dispatch(verifiedDomainSet({ domain, data: -1 }));

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

    dispatch(verifiedDomainSet({ domain, data }));
  }
};

export default inventorySlice.reducer;
