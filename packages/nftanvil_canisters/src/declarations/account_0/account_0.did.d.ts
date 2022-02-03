import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface AccountMeta {
  'info' : [] | [AddressInfo],
  'transactions' : Array<TransactionId>,
}
export interface AddressInfo {
  'background' : TokenIdentifier,
  'name' : string,
  'avatar' : TokenIdentifier,
}
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Class {
  'add' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'add_transaction' : (
      arg_0: AccountIdentifier,
      arg_1: TransactionId,
    ) => Promise<undefined>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'list' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<
      Array<TokenIdentifier__1>
    >,
  'meta' : (arg_0: AccountIdentifier) => Promise<[] | [AccountMeta]>,
  'rem' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'stats' : () => Promise<StatsResponse>,
}
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
export interface StatsResponse {
  'rts_max_live_size' : bigint,
  'cycles' : bigint,
  'rts_memory_size' : bigint,
  'rts_total_allocation' : bigint,
  'rts_heap_size' : bigint,
  'rts_reclaimed' : bigint,
  'rts_version' : string,
}
export type TokenIdentifier = number;
export type TokenIdentifier__1 = number;
export type TokenIndex = number;
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
