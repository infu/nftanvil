import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AccountIdentifier__2 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type BalanceResponse = bigint;
export type Balance__1 = bigint;
export type BlockIndex = bigint;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Class {
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier__2, Balance__1]>>,
  'notify_NFTPurchase' : (arg_0: NFTPurchase) => Promise<NFTPurchaseResponse>,
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
export interface ICP { 'e8s' : bigint }
export interface NFTPurchase {
  'created' : Time,
  'token' : TokenIdentifier,
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'seller' : AccountIdentifier__1,
  'author' : { 'share' : Share, 'address' : AccountIdentifier__1 },
  'purchaseAccount' : AccountIdentifier__1,
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'buyer' : AccountIdentifier__1,
  'amount' : ICP,
  'ledgerBlock' : BlockIndex,
}
export type NFTPurchaseResponse = { 'ok' : null } |
  { 'err' : string };
export type Share = number;
export type SubAccount = Array<number>;
export type Time = bigint;
export type TokenIdentifier = number;
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface WithdrawRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type WithdrawResponse = { 'ok' : Balance } |
  { 'err' : { 'NotEnoughForTransfer' : null } | { 'TransferFailed' : null } };
export interface _SERVICE extends Class {}
