import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AddResponse = { 'ok' : null } |
  { 'err' : { 'NotLegitimateCaller' : null } };
export type AnvEvent = { 'transaction' : EventFungibleTransaction };
export type Balance = bigint;
export type BlockIndex = bigint;
export interface Class {
  'add' : (arg_0: Event) => Promise<AddResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'info' : () => Promise<InfoResponse>,
  'list' : (arg_0: ListRequest) => Promise<ListResponse>,
}
export interface Config {
  'anv' : Principal,
  'nft' : Array<Principal>,
  'pwr' : Principal,
  'slot' : bigint,
  'history' : Principal,
  'nft_avail' : Array<Principal>,
  'account' : Array<Principal>,
  'router' : Principal,
  'treasury' : Principal,
}
export type Cooldown = number;
export type CustomId = string;
export interface Event { 'created' : Time, 'info' : EventInfo }
export interface EventFungibleTransaction {
  'to' : AccountIdentifier,
  'token' : TokenIdentifier,
  'from' : AccountIdentifier,
  'memo' : Memo,
  'amount' : Balance,
}
export type EventIndex = number;
export type EventInfo = { 'anv' : AnvEvent } |
  { 'nft' : NftEvent } |
  { 'pwr' : PwrEvent } |
  { 'treasury' : TreasuryEvent };
export interface ICP { 'e8s' : bigint }
export interface InfoResponse {
  'total' : EventIndex,
  'previous' : [] | [Principal],
}
export type ItemUse = { 'consumable' : { 'useId' : CustomId } } |
  { 'cooldown' : { 'duration' : Cooldown, 'useId' : CustomId } };
export interface ListRequest { 'to' : EventIndex, 'from' : EventIndex }
export type ListResponse = Array<[] | [Event]>;
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
export type NftEvent = {
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
    }
  } |
  { 'mint' : { 'token' : TokenIdentifier } } |
  {
    'transaction' : {
      'to' : AccountIdentifier,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }
  } |
  { 'purchase' : NFTPurchase };
export type PwrEvent = { 'transaction' : EventFungibleTransaction };
export type Share = number;
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TreasuryEvent = {};
export interface _SERVICE extends Class {}
