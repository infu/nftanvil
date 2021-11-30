export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TokenIndex = IDL.Nat32;
  const TokenIdentifier = IDL.Text;
  const StatsResponse = IDL.Record({
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const Account = IDL.Service({
    'add' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'addAllowed' : IDL.Func([IDL.Principal, IDL.Nat32], [], []),
    'list' : IDL.Func(
        [AccountIdentifier, IDL.Nat],
        [IDL.Vec(TokenIdentifier)],
        ['query'],
      ),
    'rem' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return Account;
};
export const init = ({ IDL }) => {
  return [IDL.Record({ '_router' : IDL.Principal })];
};
