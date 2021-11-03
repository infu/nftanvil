import type { Principal } from '@dfinity/principal';
export interface AccessControl {
  'addAllowed' : (arg_0: Principal) => Promise<undefined>,
  'addTokens' : (arg_0: Principal, arg_1: bigint) => Promise<undefined>,
  'consumeAccess' : (arg_0: Principal, arg_1: bigint) => Promise<Result_1>,
  'getBalance' : (arg_0: Principal) => Promise<bigint>,
  'getChallenge' : () => Promise<Array<number>>,
  'reset' : () => Promise<undefined>,
  'sendSolution' : (arg_0: string) => Promise<Result>,
}
export type CommonError = { 'NotEnough' : null } |
  { 'Unauthorized' : null } |
  { 'WrongSolution' : null };
export type Result = { 'ok' : bigint } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : boolean } |
  { 'err' : CommonError };
export interface _SERVICE extends AccessControl {}
