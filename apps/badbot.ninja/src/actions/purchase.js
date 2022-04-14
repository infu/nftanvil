import { createItoActor } from "../declarations/ito.js";
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_pwr_transfer,
  user_refresh_balances,
} from "@vvv-interactive/nftanvil-react";

import { base58ToBytes } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Principal } from "@dfinity/principal";
import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { createSlice } from "@reduxjs/toolkit";
import { accountCanister } from "@vvv-interactive/nftanvil-canisters/cjs/account.js";
import { produce } from "immer";
import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { toast } from "react-toastify";

export const msg =
  (msg, type = toast.TYPE.INFO) =>
  async (dispatch, getState) => {
    let toastId = toast(msg, {
      type,
      position: "bottom-center",
      isLoading: false,
      autoClose: true,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
  };

export const stats = () => async (dispatch, getState) => {
  let ito = createItoActor({
    agentOptions: authentication.getAgentOptions(),
  });

  let stats = await ito.stats();
  //console.log(stats);
  return stats;
};

export const airdrop_use = (key) => async (dispatch, getState) => {
  const s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);

  let ito = createItoActor({
    agentOptions: authentication.getAgentOptions(),
  });

  let brez = await ito.airdrop_use(address, base58ToBytes(key));

  console.log("airdrop_use", brez);
  if ("err" in brez) throw new Error(brez.err);

  return brez.ok.map((x) => Number(x));
};

const getStoredTx = () => {
  let rez;
  try {
    rez = JSON.parse(window.localStorage.getItem("unprocessed-tx")) || [];
  } catch (e) {
    rez = [];
  }

  return rez;
};

const saveStoredTx = (s) =>
  window.localStorage.setItem("unprocessed-tx", JSON.stringify(s));

const addStoredTx = (tx) => saveStoredTx([...getStoredTx(), tx]);

const remStoredTx = (tx) => saveStoredTx(getStoredTx().filter((a) => a !== tx));

export const unprocessed_tx = () => async (dispatch, getState) => {
  let ids = getStoredTx();
  if (!ids.length) return false;

  dispatch(msg("Processing interrupted transaction"));
  return dispatch(provide_tx(TransactionId.fromText(ids[0])));
};

export const buy = (amount) => async (dispatch, getState) => {
  let destination = principalToAccountIdentifier(
    process.env.REACT_APP_ITO_CANISTER_ID
  );

  // make pwr transfer and get tx
  let dres = await dispatch(
    user_pwr_transfer({ to: destination, amount, memo: [] })
  );

  if ("err" in dres) throw new Error(dres.err);

  let txid = dres.ok.transactionId;

  addStoredTx(TransactionId.toText(txid));
  return dispatch(provide_tx(txid));
};

export const provide_tx = (txid) => async (dispatch, getState) => {
  const s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  let ito = createItoActor({
    agentOptions: authentication.getAgentOptions(),
  });

  const attempt = async () => {
    // send tx_id to our custom ito.mo contract
    let brez = await ito.buy_tx(txid, subaccount);

    if ("err" in brez) {
      if (brez.err.match("already used")) {
        remStoredTx(TransactionId.toText(txid));
      }
      throw new Error(brez.err);
    }

    remStoredTx(TransactionId.toText(txid));

    return brez.ok.map((x) => Number(x));
  };

  for (let i = 0; i < 10; i++) {
    try {
      return await attempt();
    } catch (e) {
      await delay(i * 1000);
      console.log(e);
    }
  }

  throw new Error(
    "Attempted numerous times with no result. Are you sure you are connected?"
  );
};

export const claim = () => async (dispatch, getState) => {
  const s = getState();

  let address = AccountIdentifier.TextToArray(s.user.address);

  let subaccount = [
    AccountIdentifier.TextToArray(s.user.subaccount) || null,
  ].filter(Boolean);

  let ito = createItoActor({
    agentOptions: authentication.getAgentOptions(),
  });

  let owned = await ito.owned(address);
  if (owned.err) throw new Error(owned.err);

  let tokens = owned.ok.tokens.filter(Boolean);

  if (tokens.length > 0) dispatch(msg("Claiming " + tokens.length + " nfts"));

  let claimed = await Promise.all(
    tokens.map((tid) => {
      return ito.claim(address, subaccount, tid);
    })
  );
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
