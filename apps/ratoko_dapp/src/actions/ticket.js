import { principalToAccountIdentifier } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_pwr_transfer,
  nft_burn,
  nft_use,
  user_refresh_balances,
} from "@vvv-interactive/nftanvil-react";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { createItoActor } from "../declarations/ito.js";
import authentication from "@vvv-interactive/nftanvil-react/cjs/auth.js";
import { toast } from "react-toastify";
import { claim } from "./purchase";
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

export const unprocessed_ticket = () => async (dispatch, getState) => {
  let ids = getTicketStoredTx();
  if (!ids.length) return false;

  dispatch(msg("Processing interrupted transaction"));
  return dispatch(provide_tx(TransactionId.fromText(ids[0])));
};

export const use_ticket = (id) => async (dispatch, getState) => {
  // Make pwr transfer and get tx

  let useData = { cooldown: 518400 };
  let memo = [0];

  let dres = await dispatch(nft_use({ id, use: useData, memo }));

  let txid = dres.transactionId;

  addTicketStoredTx(TransactionId.toText(txid));
  return dispatch(provide_tx(txid));
};

const getTicketStoredTx = () => {
  let rez;
  try {
    rez = JSON.parse(window.localStorage.getItem("unprocessed-ticket")) || [];
  } catch (e) {
    rez = [];
  }

  return rez;
};

const saveTicketStoredTx = (s) =>
  window.localStorage.setItem("unprocessed-ticket", JSON.stringify(s));

const addTicketStoredTx = (tx) =>
  saveTicketStoredTx([...getTicketStoredTx(), tx]);

const remTicketStoredTx = (tx) =>
  saveTicketStoredTx(getTicketStoredTx().filter((a) => a !== tx));

const provide_tx = (txid) => async (dispatch, getState) => {
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
    let brez = await ito.ticket_tx(txid, subaccount);
    console.log(brez);
    if ("err" in brez) {
      if (brez.err.match("already used")) {
        remTicketStoredTx(TransactionId.toText(txid));
      }
      throw new Error(brez.err);
    }

    remTicketStoredTx(TransactionId.toText(txid));

    return brez.ok.map((x) => Number(x));
  };

  for (let i = 0; i < 10; i++) {
    try {
      let x = await attempt();
      await dispatch(claim());
      return x;
    } catch (e) {
      await delay(i * 1000);
      console.log(e);
    }
  }

  throw new Error(
    "Attempted numerous times with no result. Are you sure you are connected?"
  );
};

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
