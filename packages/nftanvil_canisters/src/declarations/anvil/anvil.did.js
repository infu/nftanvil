export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const TokenRecordSerialized = IDL.Record({ 'withdrawn' : IDL.Nat64 });
  const BalanceRequest = IDL.Nat64;
  const Balance = IDL.Nat64;
  const BalanceResponse = IDL.Variant({ 'ok' : Balance, 'err' : IDL.Null });
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'nft' : CanisterRange,
    'pwr' : CanisterSlot,
    'anvil' : CanisterSlot,
    'history' : CanisterSlot,
    'nft_avail' : IDL.Vec(CanisterSlot),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const RegisterResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TransactionId = IDL.Vec(IDL.Nat8);
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const WithdrawRequest = IDL.Record({
    'tx' : TransactionId,
    'aid' : AccountIdentifier,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const WithdrawResponse = IDL.Variant({
    'ok' : IDL.Record({ 'amount' : Balance, 'transactionId' : TransactionId }),
    'err' : IDL.Text,
  });
  const Class = IDL.Service({
    'all_tokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIdentifier, TokenRecordSerialized))],
        ['query'],
      ),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'refresh' : IDL.Func([], [], []),
    'register_token' : IDL.Func([TokenIdentifier], [RegisterResponse], []),
    'withdraw' : IDL.Func([WithdrawRequest], [WithdrawResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
