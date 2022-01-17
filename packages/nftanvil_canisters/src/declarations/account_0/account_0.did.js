export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TokenIndex = IDL.Nat32;
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
  const TokenIdentifier = IDL.Nat32;
  const StatsResponse = IDL.Record({
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'config_set' : IDL.Func([Config], [], []),
    'list' : IDL.Func(
        [AccountIdentifier, IDL.Nat],
        [IDL.Vec(TokenIdentifier)],
        ['query'],
      ),
    'rem' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
