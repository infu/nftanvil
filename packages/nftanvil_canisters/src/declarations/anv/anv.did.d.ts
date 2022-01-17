import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AccountIdentifier__2 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest { 'user' : User__1 }
export type BalanceResponse = bigint;
export type Balance__1 = bigint;
export type Block = [
  TransactionFrom,
  TransactionTo,
  TransactionAmount,
  BlockTimestamp,
  BlockHash,
];
export type BlockHash = Array<number>;
export type BlockIndex = number;
export type BlockTimestamp = bigint;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Class {
  'adminAllocate' : (
      arg_0: { 'user' : User__1, 'amount' : TransactionAmount },
    ) => Promise<[BlockIndex, Block]>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier__2, Balance__1]>>,
  'dumpBlockchain' : () => Promise<Array<[BlockIndex, Block]>>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
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
export type Memo = Array<number>;
export type SubAccount = Array<number>;
export type TransactionAmount = bigint;
export type TransactionFrom = Array<number>;
export type TransactionTo = Array<number>;
export interface TransferRequest {
  'to' : User,
  'from' : User,
  'memo' : Memo,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferResponse = { 'ok' : Balance } |
  {
    'err' : { 'InsufficientBalance' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier__1 } |
      { 'Other' : string }
  };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export type User__1 = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Class {}
