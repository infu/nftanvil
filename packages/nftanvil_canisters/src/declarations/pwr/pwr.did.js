export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({ 'user' : User__1 });
  const BalanceResponse = IDL.Nat64;
  const AccountIdentifier__2 = IDL.Vec(IDL.Nat8);
  const Balance__1 = IDL.Nat64;
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
  const TokenIdentifier = IDL.Text;
  const Memo = IDL.Nat64;
  const Balance = IDL.Nat64;
  const TransferRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier__1,
      'Other' : IDL.Text,
    }),
  });
  const Class = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__2, Balance__1))],
        ['query'],
      ),
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
    'tokenId' : IDL.Func([], [TokenIdentifier], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => {
  return [IDL.Record({ '_admin' : IDL.Principal, '_router' : IDL.Principal })];
};