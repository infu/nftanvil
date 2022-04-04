import type { Principal } from '@dfinity/principal';
export interface Class {
  'check_tx' : (arg_0: TransactionId) => Promise<Result>,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
