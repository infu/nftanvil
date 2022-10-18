import {
  easyMint,
  routerCanister,
  pwrCanister,
  ledgerCanister,
  nftCanister,
  getMap,
  AccountIdentifier,
  PrincipalFromSlot,
  anvilCanister,
  slotcan,
} from "@vvv-interactive/nftanvil";
import { Principal } from "@dfinity/principal";

import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { e8sToIcp } from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

const main = async () => {
  let { principal } = await routerCanister();
  console.log("Script principal ", principal.toText());

  let subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(123));

  let to_subaccount = AccountIdentifier.ArrayToText(getSubAccountArray(1));
  let to_principal = Principal.fromText("aaaaa-aa");

  let to_address = principalToAccountIdentifier(
    to_principal.toText(),
    AccountIdentifier.TextToArray(subaccount)
  );

  let address = principalToAccountIdentifier(
    principal.toText(),
    AccountIdentifier.TextToArray(subaccount)
  );

  console.log("Address ", address, "subaccount", subaccount);
  console.log(">a>", AccountIdentifier.TextToArray(address));

  console.log(">s>", AccountIdentifier.TextToArray(subaccount));

  return;
  let ledger = ledgerCanister();

  let balance = await ledger.account_balance({
    account: AccountIdentifier.TextToArray(address),
  });
  console.log("BALANCE", balance);

  let notify = await ledger.notify_dfx({
    to_subaccount: [AccountIdentifier.TextToArray(to_subaccount)],
    from_subaccount: [AccountIdentifier.TextToArray(subaccount)],
    // notify_using_protobuf: false,
    to_canister: to_principal,
    max_fee: { e8s: 10000 },
    block_height: 123333,
  });

  console.log("NOTIFY", notify);
};

main();
