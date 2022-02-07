import type { Principal } from '@dfinity/principal';
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = bigint;
export type CanisterSlot__1 = bigint;
export interface Class { 'config_set' : (arg_0: Config) => Promise<undefined> }
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
export interface _SERVICE extends Class {}
