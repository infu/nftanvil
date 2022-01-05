import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface Class {
  'add' : (
      arg_0: AccountIdentifier,
      arg_1: TokenIndex,
      arg_2: bigint,
    ) => Promise<undefined>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'list' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<
      Array<TokenIdentifier>
    >,
  'rem' : (
      arg_0: AccountIdentifier,
      arg_1: TokenIndex,
      arg_2: bigint,
    ) => Promise<undefined>,
  'stats' : () => Promise<StatsResponse>,
}
export interface Config {
  'anv' : Principal,
  'nft' : Array<Principal>,
  'pwr' : Principal,
  'collection' : Principal,
  'slot' : bigint,
  'history' : Principal,
  'nft_avail' : Array<Principal>,
  'account' : Array<Principal>,
  'router' : Principal,
  'treasury' : Principal,
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
export type TokenIdentifier = string;
export type TokenIndex = number;
export interface _SERVICE extends Class {}
