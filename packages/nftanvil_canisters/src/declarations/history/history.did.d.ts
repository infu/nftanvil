import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export interface AddRequest { 'record' : Record }
export type AddResponse = { 'ok' : null } |
  { 'err' : {} };
export type AnvRecord = { 'transaction' : RecordFungibleTransaction };
export type Balance = bigint;
export type BlockIndex = bigint;
export interface Class {
  'add' : (arg_0: AddRequest) => Promise<AddResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
}
export type CollectionId = number;
export interface Config {
  'anv' : Principal,
  'nft' : Array<Principal>,
  'pwr' : Principal,
  'collection' : Principal,
  'slot' : bigint,
  'history' : Principal,
  'nft_avail' : Array<Principal>,
  'account' : Array<Principal>,
  'router' : Principal,
  'treasury' : Principal,
}
export type Cooldown = number;
export type CustomId = string;
export interface ICP { 'e8s' : bigint }
export type ItemUse = { 'consumable' : { 'useId' : CustomId } } |
  { 'cooldown' : { 'duration' : Cooldown, 'useId' : CustomId } };
export type Memo = bigint;
export interface NFTPurchase {
  'token' : TokenIdentifier__1,
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'seller' : AccountIdentifier__1,
  'author' : { 'share' : Share, 'address' : AccountIdentifier__1 },
  'purchaseAccount' : AccountIdentifier__1,
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'buyer' : AccountIdentifier__1,
  'amount' : ICP,
  'ledgerBlock' : BlockIndex,
}
export type NftRecord = {
    'use' : {
      'use' : ItemUse,
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }
  } |
  { 'socket' : { 'socket' : TokenIdentifier, 'plug' : TokenIdentifier } } |
  { 'unsocket' : { 'socket' : TokenIdentifier, 'plug' : TokenIdentifier } } |
  {
    'burn' : {
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
      'amount' : Balance,
    }
  } |
  { 'mint' : { 'token' : TokenIdentifier, 'collectionId' : CollectionId } } |
  {
    'transaction' : {
      'to' : AccountIdentifier,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }
  } |
  { 'purchase' : NFTPurchase };
export type PwrRecord = { 'transaction' : RecordFungibleTransaction };
export interface Record {
  'id' : RecordId,
  'created' : Time,
  'info' : RecordInfo,
}
export interface RecordFungibleTransaction {
  'to' : AccountIdentifier,
  'token' : TokenIdentifier,
  'from' : AccountIdentifier,
  'memo' : Memo,
  'amount' : Balance,
}
export type RecordId = Array<number>;
export type RecordInfo = { 'anv' : AnvRecord } |
  { 'nft' : NftRecord } |
  { 'pwr' : PwrRecord } |
  { 'treasury' : TreasuryRecord };
export type Share = number;
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TreasuryRecord = {};
export interface _SERVICE extends Class {}
