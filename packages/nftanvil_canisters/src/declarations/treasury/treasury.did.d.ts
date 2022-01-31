import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type BalanceResponse = bigint;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Class {
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier__1, Balance]>>,
  'withdraw' : (arg_0: WithdrawRequest) => Promise<WithdrawResponse>,
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
export type SubAccount = Array<number>;
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface WithdrawRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type WithdrawResponse = { 'ok' : { 'transactionId' : Array<number> } } |
  { 'err' : { 'NotEnoughForTransfer' : null } | { 'TransferFailed' : null } };
export interface _SERVICE extends Class {}
