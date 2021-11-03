import type { Principal } from '@dfinity/principal';
export interface Account {
  'add' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
  'addAllowed' : (arg_0: Principal, arg_1: number) => Promise<undefined>,
  'list' : (arg_0: AccountIdentifier, arg_1: bigint) => Promise<
      Array<TokenIdentifier>
    >,
  'rem' : (arg_0: AccountIdentifier, arg_1: TokenIndex) => Promise<undefined>,
}
export type AccountIdentifier = string;
export type TokenIdentifier = string;
export type TokenIndex = number;
export interface _SERVICE extends Account {}
