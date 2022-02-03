export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const TransactionAmount = IDL.Nat64;
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
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const Balance = IDL.Nat64;
  const RewardRequest = IDL.Record({
    'user' : AccountIdentifier,
    'spent' : Balance,
  });
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const TransferResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier__1,
      'Other' : IDL.Text,
    }),
  });
  const Class = IDL.Service({
    'adminAllocate' : IDL.Func(
        [IDL.Record({ 'user' : User__1, 'amount' : TransactionAmount })],
        [],
        [],
      ),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__2, Balance__1))],
        ['query'],
      ),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'reward' : IDL.Func([RewardRequest], [], []),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
