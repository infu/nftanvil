export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({ 'user' : User__1 });
  const BalanceResponse = IDL.Nat64;
  const CanisterSlot__1 = IDL.Nat16;
  const CanisterSlot = IDL.Nat16;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'anv' : CanisterSlot__1,
    'nft' : CanisterRange,
    'pwr' : CanisterSlot__1,
    'history' : CanisterSlot__1,
    'nft_avail' : IDL.Vec(CanisterSlot__1),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'router' : CanisterSlot__1,
    'treasury' : CanisterSlot__1,
  });
  const AccountIdentifier__2 = IDL.Vec(IDL.Nat8);
  const Balance__1 = IDL.Nat64;
  const Oracle = IDL.Record({ 'cycle_to_pwr' : IDL.Float64 });
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const PurchaseClaimRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const BlockIndex = IDL.Nat64;
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : ICP }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : ICP }),
  });
  const PurchaseClaimResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'PaymentTooSmall' : IDL.Null,
      'Ledger' : TransferError,
    }),
  });
  const PurchaseIntentRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const PurchaseIntentResponse = IDL.Variant({
    'ok' : AccountIdentifier__1,
    'err' : IDL.Text,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const TransferRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TokenIdentifier = IDL.Nat32;
  const TransferResponseError = IDL.Variant({
    'InsufficientBalance' : IDL.Null,
    'NotTransferable' : IDL.Null,
    'InvalidToken' : TokenIdentifier,
    'Rejected' : IDL.Null,
    'Unauthorized' : AccountIdentifier,
    'Other' : IDL.Text,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : TransferResponseError,
  });
  const Class = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__2, Balance__1))],
        ['query'],
      ),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'purchase_claim' : IDL.Func(
        [PurchaseClaimRequest],
        [PurchaseClaimResponse],
        [],
      ),
    'purchase_intent' : IDL.Func(
        [PurchaseIntentRequest],
        [PurchaseIntentResponse],
        [],
      ),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
