import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = string;
export interface ApproveRequest {
  'token' : TokenIdentifier,
  'subaccount' : [] | [SubAccount],
  'allowance' : Balance,
  'spender' : Principal,
}
export type ApproveResponse = { 'ok' : null } |
  {
    'err' : { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export type Attribute = [string, number];
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier, 'user' : User }
export type BalanceResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export type BearerResponse = { 'ok' : AccountIdentifier } |
  { 'err' : CommonError };
export interface BurnRequest {
  'token' : TokenIdentifier,
  'notify' : boolean,
  'memo' : Memo,
  'user' : User,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type BurnResponse = { 'ok' : Balance } |
  {
    'err' : { 'CannotNotify' : AccountIdentifier } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export type Content = {
    'internal' : { 'contentType' : ContentType, 'size' : number }
  } |
  { 'external' : { 'idx' : [] | [number], 'contentType' : ContentType } };
export type ContentType = string;
export type Extension = string;
export interface FetchChunkRequest {
  'tokenIndex' : TokenIndex,
  'chunkIdx' : number,
  'position' : { 'thumb' : null } |
    { 'content' : null },
}
export type ItemHold = { 'external' : { 'desc' : string, 'holdId' : string } };
export type ItemTransfer = { 'unrestricted' : null } |
  { 'bindsForever' : null } |
  { 'bindsDuration' : number };
export type ItemUse = { 'consumable' : { 'desc' : string, 'useId' : string } } |
  { 'cooldown' : { 'duration' : number, 'desc' : string, 'useId' : string } };
export type Memo = Array<number>;
export interface Metadata {
  'ttl' : [] | [number],
  'use' : [] | [ItemUse],
  'thumb' : Content,
  'created' : number,
  'content' : [] | [Content],
  'extensionCanister' : [] | [Principal],
  'quality' : [] | [number],
  'hold' : [] | [ItemHold],
  'lore' : [] | [string],
  'name' : [] | [string],
  'minter' : [] | [Principal],
  'secret' : boolean,
  'level' : number,
  'entropy' : Array<number>,
  'attributes' : Array<Attribute>,
  'transfer' : [] | [ItemTransfer],
}
export interface MetadataInput {
  'ttl' : [] | [number],
  'use' : [] | [ItemUse],
  'thumb' : Content,
  'content' : [] | [Content],
  'extensionCanister' : [] | [Principal],
  'quality' : [] | [number],
  'hold' : [] | [ItemHold],
  'lore' : [] | [string],
  'name' : [] | [string],
  'secret' : boolean,
  'attributes' : Array<Attribute>,
  'transfer' : [] | [ItemTransfer],
}
export type MetadataResponse = {
    'ok' : { 'data' : Metadata, 'vars' : MetavarsFrozen }
  } |
  { 'err' : CommonError };
export interface MetavarsFrozen {
  'cooldownUntil' : [] | [number],
  'boundUntil' : [] | [number],
}
export interface MintRequest { 'to' : User, 'metadata' : MetadataInput }
export type MintResponse = { 'ok' : TokenIndex } |
  { 'err' : { 'Rejected' : null } | { 'OutOfMemory' : null } };
export interface NFT {
  'allowance' : (arg_0: Request) => Promise<Response>,
  'approve' : (arg_0: ApproveRequest) => Promise<ApproveResponse>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier) => Promise<BearerResponse>,
  'burn' : (arg_0: BurnRequest) => Promise<BurnResponse>,
  'cyclesAccept' : () => Promise<undefined>,
  'cyclesBalance' : () => Promise<bigint>,
  'extensions' : () => Promise<Array<Extension>>,
  'fetchChunk' : (arg_0: FetchChunkRequest) => Promise<[] | [Array<number>]>,
  'metadata' : (arg_0: TokenIdentifier) => Promise<MetadataResponse>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
  'stats' : () => Promise<StatsResponse>,
  'supply' : (arg_0: TokenIdentifier) => Promise<SupplyResponse>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
  'uploadChunk' : (arg_0: UploadChunkRequest) => Promise<undefined>,
}
export interface Request {
  'token' : TokenIdentifier,
  'owner' : User,
  'spender' : Principal,
}
export type Response = { 'ok' : Balance } |
  { 'err' : CommonError };
export interface StatsResponse {
  'rts_max_live_size' : bigint,
  'transfers' : number,
  'minted' : number,
  'cycles' : bigint,
  'rts_memory_size' : bigint,
  'rts_total_allocation' : bigint,
  'accounts' : number,
  'burned' : number,
  'rts_heap_size' : bigint,
  'rts_reclaimed' : bigint,
  'rts_version' : string,
}
export type SubAccount = Array<number>;
export type SupplyResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export type TokenIdentifier = string;
export type TokenIndex = number;
export interface TransferRequest {
  'to' : User,
  'token' : TokenIdentifier,
  'notify' : boolean,
  'from' : User,
  'memo' : Memo,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferResponse = { 'ok' : Balance } |
  {
    'err' : { 'CannotNotify' : AccountIdentifier } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export interface UploadChunkRequest {
  'tokenIndex' : TokenIndex,
  'data' : Array<number>,
  'chunkIdx' : number,
  'position' : { 'thumb' : null } |
    { 'content' : null },
}
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends NFT {}
