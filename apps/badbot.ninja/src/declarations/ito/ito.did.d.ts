import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface AccountRecordSerialized { 'tokens' : Array<TokenIdentifier> }
export type Balance = bigint;
export type Basket = Array<[] | [TokenIdentifier]>;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = bigint;
export interface Class {
  'add' : (arg_0: TokenIdentifier) => Promise<Result_3>,
  'airdrop_add' : (arg_0: Array<number>) => Promise<Result_3>,
  'airdrop_use' : (arg_0: AccountIdentifier, arg_1: Array<number>) => Promise<
      Result_4
    >,
  'buy_tx' : (arg_0: TransactionId, arg_1: [] | [SubAccount]) => Promise<
      Result_4
    >,
  'claim' : (
      arg_0: AccountIdentifier,
      arg_1: [] | [SubAccount],
      arg_2: TokenIdentifier,
    ) => Promise<Result_3>,
  'icp_balance' : () => Promise<Result_2>,
  'icp_transfer' : (arg_0: AccountIdentifier, arg_1: Balance) => Promise<
      Result_1
    >,
  'owned' : (arg_0: AccountIdentifier) => Promise<Result>,
  'set_admin' : (arg_0: Principal) => Promise<undefined>,
  'set_anvil_config' : (arg_0: Config) => Promise<undefined>,
  'stats' : () => Promise<
      {
        'total' : bigint,
        'added' : bigint,
        'available' : bigint,
        'airdrop' : bigint,
        'purchase' : bigint,
      }
    >,
}
export interface Config {
  'nft' : CanisterRange,
  'pwr' : CanisterRange,
  'anvil' : CanisterSlot,
  'history' : CanisterSlot,
  'nft_avail' : Array<CanisterSlot>,
  'space' : Array<Array<bigint>>,
  'account' : CanisterRange,
  'history_range' : CanisterRange,
  'router' : Principal,
  'treasury' : CanisterSlot,
}
export type Result = { 'ok' : AccountRecordSerialized } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<number> } |
  { 'err' : string };
export type Result_2 = { 'ok' : Balance } |
  { 'err' : string };
export type Result_3 = { 'ok' : null } |
  { 'err' : string };
export type Result_4 = { 'ok' : Basket } |
  { 'err' : string };
export type SubAccount = Array<number>;
export type TokenIdentifier = bigint;
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
