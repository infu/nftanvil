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
export interface Callback { 'token' : [] | [Token], 'body' : Array<number> }
export type CallbackFunc = () => Promise<undefined>;
export interface ClaimLinkRequest {
  'to' : User,
  'key' : Array<number>,
  'token' : TokenIdentifier,
}
export type ClaimLinkResponse = { 'ok' : null } |
  { 'err' : { 'Rejected' : null } };
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export type Content = {
    'internal' : { 'contentType' : ContentType, 'size' : number }
  } |
  { 'external' : { 'idx' : number, 'contentType' : ContentType } };
export type ContentType = string;
export type Extension = string;
export interface FetchChunkRequest {
  'tokenIndex' : TokenIndex,
  'subaccount' : [] | [SubAccount],
  'chunkIdx' : number,
  'position' : { 'thumb' : null } |
    { 'content' : null },
}
export type HeaderField = [string, string];
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
  'domain' : [] | [string],
  'extensionCanister' : [] | [Principal],
  'quality' : number,
  'hold' : [] | [ItemHold],
  'lore' : [] | [string],
  'name' : [] | [string],
  'minter' : Principal,
  'secret' : boolean,
  'entropy' : Array<number>,
  'attributes' : Array<Attribute>,
  'transfer' : ItemTransfer,
}
export interface MetadataInput {
  'ttl' : [] | [number],
  'use' : [] | [ItemUse],
  'thumb' : Content,
  'content' : [] | [Content],
  'domain' : [] | [string],
  'extensionCanister' : [] | [Principal],
  'quality' : number,
  'hold' : [] | [ItemHold],
  'lore' : [] | [string],
  'name' : [] | [string],
  'secret' : boolean,
  'attributes' : Array<Attribute>,
  'transfer' : ItemTransfer,
}
export type MetadataResponse = {
    'ok' : {
      'data' : Metadata,
      'vars' : MetavarsFrozen,
      'bearer' : AccountIdentifier,
    }
  } |
  { 'err' : CommonError };
export interface MetavarsFrozen {
  'cooldownUntil' : [] | [number],
  'boundUntil' : [] | [number],
}
export interface MintRequest { 'to' : User, 'metadata' : MetadataInput }
export type MintResponse = { 'ok' : TokenIndex } |
  {
    'err' : { 'Invalid' : string } |
      { 'InsufficientBalance' : null } |
      { 'Rejected' : null } |
      { 'OutOfMemory' : null }
  };
export interface NFT {
  'allowance' : (arg_0: Request__1) => Promise<Response__1>,
  'approve' : (arg_0: ApproveRequest) => Promise<ApproveResponse>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier) => Promise<BearerResponse>,
  'burn' : (arg_0: BurnRequest) => Promise<BurnResponse>,
  'claim_link' : (arg_0: ClaimLinkRequest) => Promise<ClaimLinkResponse>,
  'cyclesAccept' : () => Promise<undefined>,
  'cyclesBalance' : () => Promise<bigint>,
  'extensions' : () => Promise<Array<Extension>>,
  'fetchChunk' : (arg_0: FetchChunkRequest) => Promise<[] | [Array<number>]>,
  'http_request' : (arg_0: Request) => Promise<Response>,
  'http_request_streaming_callback' : (arg_0: Token) => Promise<Callback>,
  'metadata' : (arg_0: TokenIdentifier) => Promise<MetadataResponse>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
  'stats' : () => Promise<StatsResponse>,
  'supply' : (arg_0: TokenIdentifier) => Promise<SupplyResponse>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
  'transfer_link' : (arg_0: TransferLinkRequest) => Promise<
      TransferLinkResponse
    >,
  'uploadChunk' : (arg_0: UploadChunkRequest) => Promise<undefined>,
  'use' : (arg_0: UseRequest) => Promise<UseResponse>,
}
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface Request__1 {
  'token' : TokenIdentifier,
  'owner' : User,
  'spender' : Principal,
}
export interface Response {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type Response__1 = { 'ok' : Balance } |
  { 'err' : CommonError };
export interface StatsResponse {
  'rts_max_live_size' : bigint,
  'transfers' : number,
  'minted' : number,
  'cycles' : bigint,
  'rts_memory_size' : bigint,
  'rts_total_allocation' : bigint,
  'burned' : number,
  'rts_heap_size' : bigint,
  'rts_reclaimed' : bigint,
  'rts_version' : string,
}
export type StreamingStrategy = {
    'Callback' : { 'token' : Token, 'callback' : CallbackFunc }
  };
export type SubAccount = Array<number>;
export type SupplyResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export interface Token {
  'key' : string,
  'sha256' : [] | [Array<number>],
  'index' : bigint,
  'content_encoding' : string,
}
export type TokenIdentifier = string;
export type TokenIndex = number;
export interface TransferLinkRequest {
  'token' : TokenIdentifier,
  'from' : User,
  'hash' : Array<number>,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferLinkResponse = { 'ok' : number } |
  {
    'err' : { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
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
export interface UseRequest {
  'token' : TokenIdentifier,
  'memo' : Memo,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type UseResponse = {
    'ok' : { 'consumed' : null } |
      { 'cooldown' : number }
  } |
  {
    'err' : { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'ExtensionError' : string } |
      { 'Other' : string } |
      { 'OnCooldown' : null }
  };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends NFT {}