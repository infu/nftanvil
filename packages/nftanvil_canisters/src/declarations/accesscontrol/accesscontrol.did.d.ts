import type { Principal } from '@dfinity/principal';
export interface AccessControl {
  'addAllowed' : (arg_0: Principal) => Promise<undefined>,
  'addTokens' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<undefined>,
  'consumeAccess' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<
      Result_1
    >,
  'getBalance' : (arg_0: AccountIdentifier) => Promise<bigint>,
  'getChallenge' : () => Promise<Array<number>>,
  'sendSolution' : (arg_0: string) => Promise<Result>,
  'showAllowed' : () => Promise<Array<string>>,
  'stats' : () => Promise<StatsResponse>,
}
export type AccountIdentifier = Array<number>;
export type CommonError = { 'NotEnough' : null } |
  { 'Unauthorized' : null } |
  { 'WrongSolution' : null } |
  { 'Other' : string };
export type Result = { 'ok' : bigint } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : boolean } |
  { 'err' : CommonError };
export interface StatsResponse {
  'rts_max_live_size' : bigint,
  'cycles' : bigint,
  'rts_memory_size' : bigint,
  'rts_total_allocation' : bigint,
  'rts_heap_size' : bigint,
  'rts_reclaimed' : bigint,
  'rts_version' : string,
}
export interface _SERVICE extends AccessControl {}
