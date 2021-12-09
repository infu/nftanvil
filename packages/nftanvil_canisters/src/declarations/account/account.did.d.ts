import type { Principal } from '@dfinity/principal';
export interface Account {
  'add' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'addAllowed' : (arg_0: Principal, arg_1: number) => Promise<undefined>,
  'list' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<
      Array<TokenIdentifier>
    >,
  'rem' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'stats' : () => Promise<StatsResponse>,
}
export type AccountIdentifier = Array<number>;
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
export interface _SERVICE extends Account {}
