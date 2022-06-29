import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface AccountRecordSerialized { 'tokens' : Array<TokenIdentifier> }
export type Balance = bigint;
export type Basket = Array<[] | [TokenIdentifier]>;
export interface Class {
  'claim' : (
      arg_0: AccountIdentifier,
      arg_1: [] | [SubAccount],
      arg_2: TokenIdentifier,
    ) => Promise<Result_4>,
  'get_script_address' : () => Promise<string>,
  'icp_balance' : () => Promise<Result_3>,
  'icp_transfer' : (arg_0: AccountIdentifier, arg_1: Balance) => Promise<
      Result_2
    >,
  'init_inventory' : (arg_0: bigint) => Promise<undefined>,
  'init_random' : () => Promise<undefined>,
  'owned' : (arg_0: AccountIdentifier) => Promise<Result_1>,
  'stats' : () => Promise<
      { 'total' : bigint, 'added' : bigint, 'available' : bigint }
    >,
  'use_tx' : (arg_0: TransactionId, arg_1: [] | [SubAccount]) => Promise<
      Result
    >,
}
export type Result = { 'ok' : Basket } |
  { 'err' : string };
export type Result_1 = { 'ok' : AccountRecordSerialized } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<number> } |
  { 'err' : string };
export type Result_3 = { 'ok' : Balance } |
  { 'err' : string };
export type Result_4 = { 'ok' : null } |
  { 'err' : string };
export type SubAccount = Array<number>;
export type TokenIdentifier = bigint;
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
