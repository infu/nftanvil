import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AccountIdentifier__2 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest { 'user' : User__1 }
export type BalanceResponse = bigint;
export type Balance__1 = bigint;
export type BlockIndex = bigint;
export interface Class {
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier__2, Balance__1]>>,
  'purchase_claim' : (arg_0: PurchaseClaimRequest) => Promise<
      PurchaseClaimResponse
    >,
  'purchase_intent' : (arg_0: PurchaseIntentRequest) => Promise<
      PurchaseIntentResponse
    >,
  'tokenId' : () => Promise<TokenIdentifier>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
}
export interface ICP { 'e8s' : bigint }
export type Memo = bigint;
export interface PurchaseClaimRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseClaimResponse = { 'ok' : null } |
  { 'err' : { 'PaymentTooSmall' : null } | { 'Ledger' : TransferError } };
export interface PurchaseIntentRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseIntentResponse = { 'ok' : AccountIdentifier__1 } |
  { 'err' : string };
export type SubAccount = Array<number>;
export type TokenIdentifier = string;
export type TransferError = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : ICP } } |
  { 'TxDuplicate' : { 'duplicate_of' : BlockIndex } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : ICP } };
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