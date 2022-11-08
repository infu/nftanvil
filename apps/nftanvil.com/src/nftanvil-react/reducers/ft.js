import { createSlice } from "@reduxjs/toolkit";
import { produce } from "immer";
import { tokenregistryCanister } from "@vvv-interactive/nftanvil-canisters/cjs/tokenregistry.js";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import {
  BigIntToString,
  blobPrepare,
  SerializableIC,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { pwrCanister } from "@vvv-interactive/nftanvil-canisters/cjs/pwr.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { user_refresh_balances } from "./user";
import authentication from "../identities";
import {
  chunkBlob,
  uploadFile,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import { Principal } from "@dfinity/principal";

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
  dispatch(loaded({ id: id.toString(), meta: SerializableIC(token_meta) }));
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

    let meta = s.ft[id];
    let real_amount =
      "fractionless" in meta.kind
        ? Math.round(Number(amount) / 100000000)
        : Number(amount);

    let req = {
      token: Number(id),
      amount: Number(real_amount),
      memo: [0],
      from: { address: AccountIdentifier.TextToArray(address) },
      to: { address: AccountIdentifier.TextToArray(to) },
      subaccount: subaccount,
    };
    console.log(req);
    let trez;
    try {
      trez = await pwr.transfer(req);
    } catch (e) {
      console.log(e);
      throw e;
    }
    console.log(trez);
    if (!("ok" in trez)) throw new Error(JSON.stringify(trez));

    // dispatch(user_refresh_balances(address));

    return trez;
  };

export const ft_mint = (vals) => async (dispatch, getState) => {
  let options = { ...vals };
  let s = getState();

  const address = Object.keys(s.user.accounts)[0];
  const principal = s.user.accounts[address].principal;

  options.controller = Principal.fromText(principal);

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

  options.image = await blobPrepare(
    await fetch(options.image.url).then((r) => r.blob())
  );

  // options.kind = { fractionless: null };
  const supply = options.supply * 100000000;
  delete options.supply;

  let req = {
    user: { address: AccountIdentifier.TextToArray(address) },
    subaccount,
    options: options,
    amount: supply,
  };
  console.log(req);
  let mrez;
  try {
    mrez = await pwr.ft_register(req);
  } catch (e) {
    console.log(e);
  }
  console.log("mrez", mrez);

  if (mrez?.err?.InsufficientBalance === null) {
    throw Error("Insufficient Balance");
  }

  if (!("ok" in mrez)) throw Error(mrez.err);

  console.log(mrez);

  dispatch(user_refresh_balances(address));
};

export default ftSlice.reducer;
