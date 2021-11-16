export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const CommonError = IDL.Variant({
    'NotEnough' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'WrongSolution' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : CommonError });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : CommonError });
  const StatsResponse = IDL.Record({
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const AccessControl = IDL.Service({
    'addAllowed' : IDL.Func([IDL.Principal], [], []),
    'addTokens' : IDL.Func([AccountIdentifier, IDL.Nat], [], []),
    'consumeAccess' : IDL.Func([AccountIdentifier, IDL.Nat], [Result_1], []),
    'getBalance' : IDL.Func([AccountIdentifier], [IDL.Nat], ['query']),
    'getChallenge' : IDL.Func([], [IDL.Vec(IDL.Nat32)], []),
    'sendSolution' : IDL.Func([IDL.Text], [Result], []),
    'showAllowed' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return AccessControl;
};
export const init = ({ IDL }) => {
  return [IDL.Record({ '_admin' : IDL.Principal, '_router' : IDL.Principal })];
};
