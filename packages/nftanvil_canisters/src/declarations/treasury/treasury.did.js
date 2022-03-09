export const idlFactory = ({ IDL }) => {
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'nft' : CanisterRange,
    'pwr' : CanisterRange,
    'anvil' : CanisterSlot,
    'history' : CanisterSlot,
    'nft_avail' : IDL.Vec(CanisterSlot),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
    'treasury' : CanisterSlot,
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const WithdrawRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const BlockIndex = IDL.Nat64;
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : ICP }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : ICP }),
  });
  const WithdrawIntermediateResponse = IDL.Variant({
    'Ok' : BlockIndex,
    'Err' : TransferError,
  });
  const StatsResponse = IDL.Record({
    'cycles_recieved' : IDL.Nat,
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const Class = IDL.Service({
    'config_set' : IDL.Func([Config], [], []),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'pwr_withdraw' : IDL.Func(
        [WithdrawRequest],
        [WithdrawIntermediateResponse],
        [],
      ),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
