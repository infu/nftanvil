import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AccountIdentifier__1 = Array<number>;
export type AddResponse = Array<number>;
export type AnvEvent = { 'transfer' : EventFungibleTransaction };
export type Balance = bigint;
export type Balance__1 = bigint;
export type BlockIndex = bigint;
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = number;
export type CanisterSlot__1 = number;
export interface Class {
  'add' : (arg_0: EventInfo) => Promise<AddResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'info' : () => Promise<InfoResponse>,
  'list' : (arg_0: ListRequest) => Promise<ListResponse>,
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
export type Cooldown = number;
export interface Event { 'hash' : Array<number>, 'info' : EventInfo }
export interface EventFungibleMint {
  'created' : Timestamp,
  'user' : AccountIdentifier,
  'amount' : Balance,
}
export interface EventFungibleTransaction {
  'to' : AccountIdentifier,
  'created' : Timestamp,
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
export type ItemUse = { 'consume' : null } |
  { 'prove' : null } |
  { 'cooldown' : Cooldown };
export interface ListRequest { 'to' : EventIndex, 'from' : EventIndex }
export type ListResponse = Array<[] | [Event]>;
export type Memo = Array<number>;
export interface NFTPurchase {
  'created' : Time,
  'token' : TokenIdentifier__1,
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'seller' : AccountIdentifier__1,
  'author' : { 'share' : Share, 'address' : AccountIdentifier__1 },
  'recharge' : Balance__1,
  'purchaseAccount' : AccountIdentifier__1,
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier__1 }],
  'buyer' : AccountIdentifier__1,
  'amount' : ICP,
  'ledgerBlock' : BlockIndex,
}
export type NftEvent = {
    'use' : {
      'use' : ItemUse,
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }
  } |
  {
    'socket' : {
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
    }
  } |
  {
    'unsocket' : {
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
    }
  } |
  {
    'burn' : {
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }
  } |
  {
    'mint' : {
      'pwr' : Balance,
      'created' : Timestamp,
      'token' : TokenIdentifier,
    }
  } |
  {
    'approve' : {
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
      'spender' : Principal,
    }
  } |
  {
    'transfer' : {
      'to' : AccountIdentifier,
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }
  } |
  { 'purchase' : NFTPurchase };
export type PwrEvent = { 'withdraw' : PwrWithdraw } |
  { 'mint' : EventFungibleMint } |
  { 'transfer' : EventFungibleTransaction };
export interface PwrWithdraw {
  'to' : AccountIdentifier,
  'created' : Timestamp,
  'from' : AccountIdentifier,
  'amount' : Balance,
}
export type Share = number;
export type Time = bigint;
export type Timestamp = bigint;
export type TokenIdentifier = number;
export type TokenIdentifier__1 = number;
export type TreasuryEvent = { 'withdraw' : TreasuryWithdraw };
export interface TreasuryWithdraw {
  'created' : Timestamp,
  'user' : AccountIdentifier,
  'amount' : Balance,
}
export interface _SERVICE extends Class {}
