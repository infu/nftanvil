import type { Principal } from '@dfinity/principal';
export interface Router {
  'addNFT' : () => Promise<undefined>,
  'debug_reset' : () => Promise<undefined>,
  'fetchNFTCan' : (arg_0: bigint) => Promise<string>,
  'fetchNFTCanisters' : () => Promise<Array<string>>,
  'fetchSetup' : () => Promise<
      { 'accesslist' : Array<string>, 'acclist' : Array<string> }
    >,
  'getAvailable' : () => Promise<Array<string>>,
  'reportOutOfMemory' : () => Promise<undefined>,
  'setNFTOut' : (arg_0: Principal) => Promise<undefined>,
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
