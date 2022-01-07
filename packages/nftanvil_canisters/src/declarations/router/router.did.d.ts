import type { Principal } from '@dfinity/principal';
export interface Config {
  'anv' : Principal,
  'nft' : Array<Principal>,
  'pwr' : Principal,
  'slot' : bigint,
  'history' : Principal,
  'nft_avail' : Array<Principal>,
  'account' : Array<Principal>,
  'router' : Principal,
  'treasury' : Principal,
}
export interface Router {
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'fetchNFTCan' : (arg_0: bigint) => Promise<string>,
  'fetchNFTCanisters' : () => Promise<Array<string>>,
  'fetchSetup' : () => Promise<
      {
        'anv' : string,
        'pwr' : string,
        'history' : string,
        'acclist' : Array<string>,
        'treasury' : string,
      }
    >,
  'getAvailable' : () => Promise<Array<string>>,
  'isLegitimate' : (arg_0: Principal) => Promise<boolean>,
  'reportOutOfMemory' : () => Promise<undefined>,
  'stats' : () => Promise<StatsResponse>,
}
export interface StatsResponse {
  'rts_max_live_size' : bigint,
  'cycles' : bigint,
  'rts_memory_size' : bigint,
  'rts_total_allocation' : bigint,
  'rts_heap_size' : bigint,
  'rts_reclaimed' : bigint,
  'rts_version' : string,
}
export interface _SERVICE extends Router {}
