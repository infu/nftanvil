import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AccountIdentifier__2 = Array<number>;
export type Attribute = [string, number];
export type Attributes = Array<Attribute>;
export type Balance = bigint;
export interface BalanceRequest { 'user' : User__1 }
export interface BalanceResponse { 'balance' : Balance, 'oracle' : Oracle__1 }
export type Balance__1 = bigint;
export type Balance__2 = bigint;
export type BlockIndex = bigint;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = bigint;
export type CanisterSlot__1 = bigint;
export interface Class {
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'dumpBalances' : () => Promise<Array<[AccountIdentifier__2, Balance__2]>>,
  'nft_mint' : (arg_0: CanisterSlot, arg_1: MintRequest) => Promise<
      MintResponse
    >,
  'nft_purchase' : (arg_0: CanisterSlot, arg_1: PurchaseRequest) => Promise<
      PurchaseResponse
    >,
  'nft_recharge' : (arg_0: CanisterSlot, arg_1: RechargeRequest) => Promise<
      RechargeResponse
    >,
  'oracle_set' : (arg_0: Oracle) => Promise<undefined>,
  'purchase_claim' : (arg_0: PurchaseClaimRequest) => Promise<
      PurchaseClaimResponse
    >,
  'purchase_intent' : (arg_0: PurchaseIntentRequest) => Promise<
      PurchaseIntentResponse
    >,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
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
export type Content = {
    'internal' : { 'contentType' : ContentType, 'size' : number }
  } |
  {
    'ipfs' : { 'cid' : IPFS_CID, 'contentType' : ContentType, 'size' : number }
  } |
  { 'external' : ICPath };
export type ContentType = string;
export type CustomData = Array<number>;
export type CustomVar = Array<number>;
export type DomainName = string;
export interface ICP { 'e8s' : bigint }
export type ICPath = string;
export type IPFS_CID = string;
export type ItemTransfer = { 'unrestricted' : null } |
  { 'bindsForever' : null } |
  { 'bindsDuration' : number };
export type Memo = Array<number>;
export interface MetadataInput {
  'ttl' : [] | [number],
  'thumb' : Content,
  'content' : [] | [Content],
  'domain' : [] | [DomainName],
  'authorShare' : Share,
  'custom' : [] | [CustomData],
  'quality' : Quality,
  'lore' : [] | [string],
  'name' : [] | [string],
  'tags' : Tags,
  'secret' : boolean,
  'attributes' : Attributes,
  'price' : Price,
  'transfer' : ItemTransfer,
  'rechargeable' : boolean,
  'customVar' : [] | [CustomVar],
}
export interface MintRequest {
  'metadata' : MetadataInput,
  'user' : User__1,
  'subaccount' : [] | [SubAccount__1],
}
export type MintResponse = {
    'ok' : { 'tokenIndex' : TokenIndex, 'transactionId' : TransactionId }
  } |
  {
    'err' : { 'Pwr' : TransferResponseError } |
      { 'Invalid' : string } |
      { 'InsufficientBalance' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : null } |
      { 'ClassError' : string } |
      { 'OutOfMemory' : null }
  };
export interface NFTPurchase {
  'created' : Time,
  'token' : TokenIdentifier,
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'seller' : AccountIdentifier,
  'author' : { 'share' : Share, 'address' : AccountIdentifier },
  'recharge' : Balance__1,
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'buyer' : AccountIdentifier,
  'amount' : Balance__1,
}
export interface Oracle {
  'icpFee' : bigint,
  'anvFee' : bigint,
  'icpCycles' : bigint,
  'pwrFee' : bigint,
}
export interface Oracle__1 {
  'icpFee' : bigint,
  'anvFee' : bigint,
  'icpCycles' : bigint,
  'pwrFee' : bigint,
}
export interface Price {
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'amount' : bigint,
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
export interface PurchaseRequest {
  'token' : TokenIdentifier,
  'user' : User__1,
  'subaccount' : [] | [SubAccount__1],
  'amount' : Balance__1,
}
export type PurchaseResponse = {
    'ok' : { 'purchase' : NFTPurchase, 'transactionId' : TransactionId }
  } |
  {
    'err' : { 'TreasuryNotifyFailed' : null } |
      { 'Refunded' : null } |
      { 'InsufficientPayment' : Balance__1 } |
      { 'ErrorWhileRefunding' : null } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : null } |
      { 'NotForSale' : null } |
      { 'NotEnoughToRefund' : null }
  };
export type Quality = number;
export interface RechargeRequest {
  'token' : TokenIdentifier,
  'user' : User__1,
  'subaccount' : [] | [SubAccount__1],
  'amount' : Balance__1,
}
export type RechargeResponse = { 'ok' : null } |
  {
    'err' : { 'InsufficientPayment' : Balance__1 } |
      { 'RechargeUnnecessary' : null } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : null }
  };
export type Share = number;
export type SubAccount = Array<number>;
export type SubAccount__1 = Array<number>;
export type Tag = string;
export type Tags = Array<Tag>;
export type Time = bigint;
export type TokenIdentifier = bigint;
export type TokenIndex = number;
export type TransactionId = Array<number>;
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
  { 'InvalidToken' : null } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'OutOfPower' : null } |
  { 'Other' : string };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export type User__1 = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface WithdrawRequest {
  'to' : User,
  'from' : User,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type WithdrawResponse = { 'ok' : { 'transactionId' : Array<number> } } |
  { 'err' : TransferResponseError };
export interface _SERVICE extends Class {}
