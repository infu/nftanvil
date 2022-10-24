import { createSlice } from "@reduxjs/toolkit";
import { produce } from "immer";
import { tokenregistryCanister } from "@vvv-interactive/nftanvil-canisters/cjs/tokenregistry.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import {
  BigIntToString,
  blobPrepare,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { user_refresh_balances } from "./user";
import authentication from "../identities";
import {
  chunkBlob,
  uploadFile,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
export const ftSlice = createSlice({
  name: "ft",
  initialState: {},
  reducers: {
    loaded: (state, action) => {
      state[action.payload.id] = action.payload.meta;
    },
  },
});

export const { loaded } = ftSlice.actions;

export const ft_fetch_meta = (id) => async (dispatch, getState) => {
  let s = getState();

  if (s.ft[id]) return; // already initialised

  let canister = PrincipalFromSlot(
    s.ic.anvil.space,
    s.ic.anvil.tokenregistry
  ).toText();

  let treg = tokenregistryCanister(canister, {
    agentOptions: authentication.getAgentOptions(false),
  });

  let token_meta = await treg.meta(id);
  dispatch(loaded({ id: id.toString(), meta: BigIntToString(token_meta) }));
};

export const ft_transfer =
  ({ id, address, to, amount, memo = [] }) =>
  async (dispatch, getState) => {
    let s = getState();
    let subaccount = [
      AccountIdentifier.TextToArray(s.user.accounts[address].subaccount) ||
        null,
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

    let req = {
      token: Number(id),
      amount: Number(amount),
      memo: [0],
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(to) },
      subaccount: subaccount,
    };

    let trez = await pwr.transfer(req);

    if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

    // dispatch(user_refresh_balances(address));

    return trez;
  };

export const ft_mint = (vals) => async (dispatch, getState) => {
  let s = getState();

  const address = Object.keys(s.user.accounts)[0];

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

  if (!address) throw Error("Annonymous cant mint"); // Wont let annonymous mint

  vals.image = await blobPrepare(
    await fetch(vals.image.url).then((r) => r.blob())
  );
  console.log(vals);
  return;
  let mrez = await pwr.ft_mint({
    user: { address: AccountIdentifier.TextToArray(address) },
    subaccount,
    metadata: vals,
  });

  if (mrez?.err?.OutOfMemory === null) {
    // await dispatch(user_refresh_config());
    await dispatch(ft_mint(vals));
    return;
  }

  if (mrez?.err?.InsufficientBalance === null) {
    throw Error("Insufficient Balance");
  }

  if (!("ok" in mrez)) throw Error(mrez.err);

  console.log(mrez);

  dispatch(user_refresh_balances(address));
};

export default ftSlice.reducer;
