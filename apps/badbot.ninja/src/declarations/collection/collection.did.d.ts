import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AnvEvent = { 'transfer' : EventFungibleTransaction };
export type Balance = bigint;
export interface Class {
  'check_tx' : (arg_0: TransactionId) => Promise<[] | [Transaction]>,
}
export type Cooldown = number;
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
export type EventInfo = { 'anv' : AnvEvent } |
  { 'nft' : NftEvent } |
  { 'pwr' : PwrEvent };
export type ItemUse = { 'consume' : null } |
  { 'prove' : null } |
  { 'cooldown' : Cooldown };
export type Memo = Array<number>;
export interface NFTPurchase {
  'created' : Time,
  'token' : TokenIdentifier,
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'seller' : AccountIdentifier,
  'author' : { 'share' : Share, 'address' : AccountIdentifier },
  'recharge' : Balance,
  'affiliate' : [] | [{ 'address' : AccountIdentifier, 'amount' : Balance }],
  'buyer' : AccountIdentifier,
  'amount' : Balance,
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
      'user' : AccountIdentifier,
    }
  } |
  {
    'unsocket' : {
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
      'user' : AccountIdentifier,
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
      'user' : AccountIdentifier,
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
    'price' : {
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
      'price' : Price,
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
export interface Price {
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'amount' : bigint,
}
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
export type TokenIdentifier = bigint;
export interface Transaction { 'hash' : Array<number>, 'info' : EventInfo }
export type TransactionId = Array<number>;
export interface _SERVICE extends Class {}
