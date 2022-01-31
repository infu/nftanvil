export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const BalanceRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
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
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const WithdrawRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const WithdrawResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Variant({
      'NotEnoughForTransfer' : IDL.Null,
      'TransferFailed' : IDL.Null,
    }),
  });
  const Class = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__1, Balance))],
        ['query'],
      ),
    'withdraw' : IDL.Func([WithdrawRequest], [WithdrawResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
