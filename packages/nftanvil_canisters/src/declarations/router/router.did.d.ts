import type { Principal } from '@dfinity/principal';
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Config {
  'anv' : CanisterSlot__1,
  'nft' : CanisterRange,
  'pwr' : CanisterSlot__1,
  'history' : CanisterSlot__1,
  'nft_avail' : Array<CanisterSlot__1>,
  'space' : Array<Array<bigint>>,
  'account' : CanisterRange,
  'router' : CanisterSlot__1,
  'treasury' : CanisterSlot__1,
}
export interface Router {
  'config_get' : () => Promise<Config>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
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
