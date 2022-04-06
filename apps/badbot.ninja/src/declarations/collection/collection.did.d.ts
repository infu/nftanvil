import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface AccountRecordSerialized { 'tokens' : Array<TokenIdentifier> }
export interface Class {
  'add' : (arg_0: TokenIdentifier) => Promise<undefined>,
  'buy_tx' : (arg_0: TransactionId, arg_1: [] | [SubAccount]) => Promise<
      Result_1
    >,
  'claim' : (
      arg_0: AccountIdentifier,
      arg_1: [] | [SubAccount],
      arg_2: TokenIdentifier,
    ) => Promise<Result_1>,
  'owned' : (arg_0: AccountIdentifier) => Promise<Result>,
}
export type Result = { 'ok' : AccountRecordSerialized } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type SubAccount = Array<number>;
export type TokenIdentifier = bigint;
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
