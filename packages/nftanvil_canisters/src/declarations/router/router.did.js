export const idlFactory = ({ IDL }) => {
  const Config = IDL.Record({
    'anv' : IDL.Principal,
    'nft' : IDL.Vec(IDL.Principal),
    'pwr' : IDL.Principal,
    'collection' : IDL.Principal,
    'slot' : IDL.Nat,
    'history' : IDL.Principal,
    'nft_avail' : IDL.Vec(IDL.Principal),
    'account' : IDL.Vec(IDL.Principal),
    'router' : IDL.Principal,
    'treasury' : IDL.Principal,
  });
  const StatsResponse = IDL.Record({
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const Router = IDL.Service({
    'config_set' : IDL.Func([Config], [], []),
    'fetchNFTCan' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
    'fetchNFTCanisters' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'fetchSetup' : IDL.Func(
        [],
        [IDL.Record({ 'acclist' : IDL.Vec(IDL.Text) })],
        ['query'],
      ),
    'getAvailable' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'isLegitimate' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'reportOutOfMemory' : IDL.Func([], [], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
