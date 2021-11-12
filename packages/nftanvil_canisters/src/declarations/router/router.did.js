export const idlFactory = ({ IDL }) => {
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
    'debug_reset' : IDL.Func([], [], []),
    'fetchNFTCan' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
    'fetchNFTCanisters' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'fetchSetup' : IDL.Func(
        [],
        [
          IDL.Record({
            'accesslist' : IDL.Vec(IDL.Text),
            'acclist' : IDL.Vec(IDL.Text),
          }),
        ],
        ['query'],
      ),
    'getAvailable' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'reportOutOfMemory' : IDL.Func([], [], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
