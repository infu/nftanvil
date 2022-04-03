export const idlFactory = ({ IDL }) => {
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config__1 = IDL.Record({
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
  const LogEvent = IDL.Record({ 'msg' : IDL.Text, 'time' : IDL.Nat32 });
  const Oracle__1 = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
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
  const Router = IDL.Service({
    'config_get' : IDL.Func([], [Config__1], ['query']),
    'config_set' : IDL.Func([Config__1], [], []),
    'create_local_canisters' : IDL.Func([], [], []),
    'event_history_full' : IDL.Func([], [], []),
    'event_nft_full' : IDL.Func([IDL.Principal], [], []),
    'log_get' : IDL.Func([], [IDL.Vec(LogEvent)], ['query']),
    'oracle_set' : IDL.Func([Oracle__1], [], []),
    'refuel' : IDL.Func([], [], []),
    'refuel_unoptimised' : IDL.Func([], [], []),
    'reinstall' : IDL.Func([], [], []),
    'settings_get' : IDL.Func([], [Config, Oracle], ['query']),
    'start_all' : IDL.Func([], [], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'jobs_fail' : IDL.Nat,
            'cycles_recieved' : IDL.Nat,
            'rts_max_live_size' : IDL.Nat,
            'jobs_success' : IDL.Nat,
            'cycles' : IDL.Nat,
            'rts_memory_size' : IDL.Nat,
            'rts_total_allocation' : IDL.Nat,
            'maintenance' : IDL.Bool,
            'rts_heap_size' : IDL.Nat,
            'rts_reclaimed' : IDL.Nat,
            'rts_version' : IDL.Text,
            'refuel' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'stop_all' : IDL.Func([], [], []),
    'upgrade' : IDL.Func([], [], []),
    'wallet_receive' : IDL.Func([], [], []),
    'wasm_set' : IDL.Func(
        [IDL.Record({ 'name' : IDL.Text, 'wasm' : IDL.Vec(IDL.Nat8) })],
        [],
        [],
      ),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
