/* global BigInt */

import { createSlice } from "@reduxjs/toolkit";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import { anvilCanister } from "@vvv-interactive/nftanvil-canisters/cjs/anvil.js";
import { dialog_open } from "./dialog";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import authentication from "../identities";
import { SerializableIC } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

export const dexSlice = createSlice({
  name: "dex",
  initialState: {},
  reducers: {
    poolsUpdate: (state, action) => {
      let { address, pools, cacheKey } = action.payload;
      state[address] = { pools, cacheKey };
    },
  },
});

export const { poolsUpdate } = dexSlice.actions;

export const dex_create_pool =
  (address, vals) => async (dispatch, getState) => {
    // token_one : FTokenId;
    // token_two : FTokenId;
    // token_one_decimals: Nat8;
    // token_two_decimals: Nat8;

    const { pwr, subaccount } = dispatch(pwrActor(address));
    console.log(address, vals);
    let rez = await pwr.dex_create_pool(
      {
        token_one: BigInt(vals.token_one.id),
        token_two: BigInt(vals.token_two.id),
      },
      { address: AccountIdentifier.TextToArray(address) },
      subaccount
    );
    console.log(rez);
  };

export const dex_add_liquidity_dialog =
  ({ address, token_one_id, token_two_id, rate }) =>
  async (dispatch, getState) => {
    let s = getState();

    let inv = s.inventory[address].content;
    console.log(inv, typeof inv);

    let token_one =
      inv[Object.keys(inv).find((k) => inv[k].id === Number(token_one_id))];

    let token_two =
      inv[Object.keys(inv).find((k) => inv[k].id === Number(token_two_id))];

    let selected = await dispatch(
      dialog_open({
        name: "dex_add_liquidity",
        data: {
          aid: address,
          token_one: { id: token_one_id, bal: token_one?.bal || 0 },
          token_two: { id: token_two_id, bal: token_two?.bal || 0 },
          rate,
        },
      })
    );

    return dispatch(
      dex_add_liquidity(address, {
        token_one: token_one_id,
        token_two: token_two_id,
        token_one_amount: selected.amount_one,
        token_two_amount: selected.amount_two,
      })
    );
  };

export const dex_add_liquidity =
  (
    address,
    { token_one, token_two, aid, token_one_amount, token_two_amount }
  ) =>
  async (dispatch, getState) => {
    // token_one : FTokenId;
    // token_two : FTokenId;
    // aid: Nft.AccountIdentifier;
    // token_one_amount : Balance;
    // token_two_amount : Balance;
    token_one = BigInt(token_one);
    token_two = BigInt(token_two);
    token_one_amount = BigInt(token_one_amount);
    token_two_amount = BigInt(token_two_amount);

    const { pwr, subaccount } = dispatch(pwrActor(address));
    let req = {
      token_one,
      token_two,
      token_one_amount,
      token_two_amount,
      aid: AccountIdentifier.TextToArray(address),
    };
    console.log(req);
    let resp = await pwr.dex_add_liquidity(
      req,
      { address: AccountIdentifier.TextToArray(address) },
      subaccount
    );

    console.log(resp);
  };

export const dex_rem_liquidity =
  (address, { token_one, token_two }) =>
  async (dispatch, getState) => {
    token_one = BigInt(token_one);
    token_two = BigInt(token_two);
    // token_one : FTokenId;
    // token_two : FTokenId;
    // aid: Nft.AccountIdentifier;

    const { pwr, subaccount } = dispatch(pwrActor(address));
    let resp = await pwr.dex_rem_liquidity(
      {
        token_one,
        token_two,
        aid: AccountIdentifier.TextToArray(address),
      },
      { address: AccountIdentifier.TextToArray(address) },
      subaccount
    );

    console.log(resp);
    // Response:
    // one : Balance;
    // two : Balance;
  };

export const dex_swap =
  (address, { token_one, token_two, amount, amount_required, reverse }) =>
  async (dispatch, getState) => {
    // token_one : FTokenId;
    // token_two : FTokenId;
    // amount : Balance;
    // amount_required : Balance;
    // reverse: Bool;

    token_one = BigInt(token_one);
    token_two = BigInt(token_two);
    amount = BigInt(amount);
    amount_required = BigInt(amount_required);
    // token_one : FTokenId;
    // token_two : FTokenId;
    // aid: Nft.AccountIdentifier;

    const { pwr, subaccount } = dispatch(pwrActor(address));
    let req = {
      token_one,
      token_two,
      amount,
      amount_required,
      reverse,
    };

    console.log("dex_swap", req);
    let resp = await pwr.dex_swap(
      req,
      { address: AccountIdentifier.TextToArray(address) },
      subaccount
    );

    console.log("swap response", resp);
    return resp;
  };

export const dex_pools = (address) => async (dispatch, getState) => {
  // token_one : FTokenId;
  // token_two : FTokenId;
  // aid: Nft.AccountIdentifier;
  let s = getState();
  const cacheKey = Math.floor(Date.now() / 5000);

  if (s.dex[address]?.cacheKey === cacheKey) return;
  let { dex, subaccount } = dispatch(dexActor(address));
  let resp = await dex.get_pools({
    aid: AccountIdentifier.TextToArray(address),
  });

  resp = SerializableIC(resp);
  let pools = Object.assign(
    {},
    ...resp.map((x) => ({
      [x.id[0] + "-" + x.id[1]]: x,
    }))
  );

  dispatch(poolsUpdate({ address, cacheKey, pools }));
  return pools;
};

const pwrActor = (address) => (dispatch, getState) => {
  let s = getState();

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) || null,
  ].filter(Boolean);

  let pwr = pwrCanister(
    PrincipalFromSlot(
      s.ic.anvil.space,
      AccountIdentifier.TextToSlot(address, s.ic.anvil.pwr)
    ),
    {
      agentOptions: authentication.getAgentOptions(address),
    }
  );

  return { pwr, subaccount };
};

const dexActor = (address) => (dispatch, getState) => {
  let s = getState();

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) || null,
  ].filter(Boolean);

  let dex = anvilCanister(
    PrincipalFromSlot(s.ic.anvil.space, s.ic.anvil.anvil),
    {
      agentOptions: authentication.getAgentOptions(address),
    }
  );

  return { dex, subaccount };
};

export default dexSlice.reducer;
