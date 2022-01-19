import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AccountIdentifier__2 = Array<number>;
export type Balance = bigint;
export interface BalanceRequest { 'user' : User__1 }
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
  'oracle_set' : (arg_0: Oracle) => Promise<undefined>,
  'purchase_claim' : (arg_0: PurchaseClaimRequest) => Promise<
      PurchaseClaimResponse
    >,
  'purchase_intent' : (arg_0: PurchaseIntentRequest) => Promise<
      PurchaseIntentResponse
    >,
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
export interface ICP { 'e8s' : bigint }
export type Memo = Array<number>;
export interface Oracle {
  'cycle_to_pwr' : number,
  'icpFee' : bigint,
  'anvFee' : bigint,
  'pwrFee' : bigint,
}
export interface PurchaseClaimRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseClaimResponse = {
    'ok' : { 'transactionId' : Array<number> }
  } |
  { 'err' : { 'PaymentTooSmall' : null } | { 'Ledger' : TransferError } };
export interface PurchaseIntentRequest {
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseIntentResponse = { 'ok' : AccountIdentifier__1 } |
  { 'err' : string };
export type SubAccount = Array<number>;
export type TokenIdentifier = number;
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
export type TransferResponse = { 'ok' : { 'transactionId' : Array<number> } } |
  { 'err' : TransferResponseError };
export type TransferResponseError = { 'InsufficientBalance' : null } |
  { 'NotTransferable' : null } |
  { 'InvalidToken' : TokenIdentifier } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'Other' : string };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export type User__1 = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Class {}
