import { createCollectionActor } from "../declarations/collection.js";
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_pwr_transfer,
  user_refresh_balances,
} from "@vvv-interactive/nftanvil-react";
import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Principal } from "@dfinity/principal";
import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import { produce } from "immer";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

export const buy = (amount) => async (dispatch, getState) => {
  const s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  let destination = principalToAccountIdentifier(
    process.env.REACT_APP_COLLECTION_CANISTER_ID
  );

  // make pwr transfer and get tx
  let dres = await dispatch(
    user_pwr_transfer({ to: destination, amount, memo: [] })
  );

  console.log("user_pwr_transfer", dres);
  if ("err" in dres) throw dres.err;

  let txid = dres.ok.transactionId;

  let collection = createCollectionActor({
    agentOptions: authentication.getAgentOptions(),
  });

  // send tx_id to our custom collection.mo contract
  let brez = await collection.buy_tx(txid, subaccount);
  console.log("buy_tx", brez);

  dispatch(user_refresh_balances());
  dispatch(claim());
};

export const claim = () => async (dispatch, getState) => {
  const s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  let collection = createCollectionActor({
    agentOptions: authentication.getAgentOptions(),
  });

  let owned = await collection.owned(address);
  if (owned.err) throw new Error(owned.err);

  let tokens = owned.ok.tokens.filter(Boolean);

  let claimed = await Promise.all(
    tokens.map((tid) => {
      return collection.claim(address, subaccount, tid);
    })
  );

  console.log(tokens, claimed);
};

export const get_mine = () => async (dispatch, getState) => {
  let s = getState();
  if (!s.user.map.account?.length) return null;
  let address = s.user.address;

  let can = PrincipalFromSlot(
    s.user.map.space,
    AccountIdentifier.TextToSlot(address, s.user.map.account)
  );

  let acc = accountCanister(can, {
    agentOptions: authentication.getAgentOptions(),
  });

  let pageIdx = 0;
  let max = 100;
  let final = [];
  do {
    let list = await acc.list(
      AccountIdentifier.TextToArray(address),
      pageIdx * max,
      (pageIdx + 1) * max
    );

    list = list.filter((x) => x !== 0n).map((x) => Number(x));

    if (list.length === 0) break;

    final.push(...list);
    pageIdx++;
  } while (true);

  return final;
};

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
