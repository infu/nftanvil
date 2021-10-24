import type { Principal } from '@dfinity/principal';
export interface Account {
  'add' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'addAllowed' : (arg_0: Principal) => Promise<undefined>,
  'list' : (arg_0: AccountIdentifier) => Promise<Array<TokenIndex>>,
  'rem' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'setup' : (arg_0: { 'slot' : number }) => Promise<undefined>,
}
export type AccountIdentifier = string;
export type TokenIndex = number;
export interface _SERVICE extends Account {}
