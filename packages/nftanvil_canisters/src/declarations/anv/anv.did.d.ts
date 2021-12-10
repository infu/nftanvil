import type { Principal } from '@dfinity/principal';
export interface ANV {
  'adminAllocate' : (
      arg_0: { 'user' : User, 'amount' : TransactionAmount },
    ) => Promise<[BlockIndex, Block]>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier, Balance]>>,
  'dumpBlockchain' : () => Promise<Array<[BlockIndex, Block]>>,
  'tokenId' : () => Promise<TokenIdentifier>,
}
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier__1, 'user' : User }
export type BalanceResponse = { 'ok' : Balance__1 } |
  { 'err' : CommonError };
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
export type CommonError = { 'InvalidToken' : TokenIdentifier__1 } |
  { 'Other' : string };
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TransactionAmount = bigint;
export type TransactionFrom = Array<number>;
export type TransactionTo = Array<number>;
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier__1 };
export interface _SERVICE extends ANV {}
