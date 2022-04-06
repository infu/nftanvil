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
  console.log(owned);

  let tokens = owned.ok.tokens.filter(Boolean);

  let claimed = await Promise.all(
    tokens.map((tid) => {
      return collection.claim(address, subaccount, tid);
    })
  );

  console.log(tokens, claimed);
};

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
