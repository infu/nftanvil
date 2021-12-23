import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
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
export type Attributes = Array<Attribute>;
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier, 'user' : User }
export type BalanceResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export type BearerResponse = { 'ok' : AccountIdentifier } |
  { 'err' : CommonError };
export interface BurnRequest {
  'token' : TokenIdentifier,
  'memo' : Memo,
  'user' : User,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type BurnResponse = { 'ok' : Balance } |
  { 'err' : TransferResponseError };
export interface Callback { 'token' : [] | [Token], 'body' : Array<number> }
export type CallbackFunc = () => Promise<undefined>;
export interface ClaimLinkRequest {
  'to' : User,
  'key' : Array<number>,
  'token' : TokenIdentifier,
}
export type ClaimLinkResponse = { 'ok' : null } |
  { 'err' : { 'Rejected' : null } | { 'Other' : string } };
export interface Class {
  'allowance' : (arg_0: Request__1) => Promise<Response__1>,
  'approve' : (arg_0: ApproveRequest) => Promise<ApproveResponse>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier) => Promise<BearerResponse>,
  'burn' : (arg_0: BurnRequest) => Promise<BurnResponse>,
  'claim_link' : (arg_0: ClaimLinkRequest) => Promise<ClaimLinkResponse>,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'cyclesAccept' : () => Promise<undefined>,
  'cyclesBalance' : () => Promise<bigint>,
  'fetchChunk' : (arg_0: FetchChunkRequest) => Promise<[] | [Array<number>]>,
  'http_request' : (arg_0: Request) => Promise<Response>,
  'http_request_streaming_callback' : (arg_0: Token) => Promise<Callback>,
  'metadata' : (arg_0: TokenIdentifier) => Promise<MetadataResponse>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
  'plug' : (arg_0: PlugRequest) => Promise<PlugResponse>,
  'purchase_claim' : (arg_0: PurchaseClaimRequest) => Promise<
      PurchaseClaimResponse
    >,
  'purchase_intent' : (arg_0: PurchaseIntentRequest) => Promise<
      PurchaseIntentResponse
    >,
  'set_price' : (arg_0: SetPriceRequest) => Promise<SetPriceResponse>,
  'socket' : (arg_0: SocketRequest) => Promise<SocketResponse>,
  'stats' : () => Promise<StatsResponse>,
  'supply' : (arg_0: TokenIdentifier) => Promise<SupplyResponse>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
  'transfer_link' : (arg_0: TransferLinkRequest) => Promise<
      TransferLinkResponse
    >,
  'unplug' : (arg_0: UnsocketRequest) => Promise<UnplugResponse>,
  'unsocket' : (arg_0: UnsocketRequest) => Promise<UnsocketResponse>,
  'uploadChunk' : (arg_0: UploadChunkRequest) => Promise<undefined>,
  'use' : (arg_0: UseRequest) => Promise<UseResponse>,
}
export type CollectionId = number;
export type CollectionIndex = number;
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
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
export type Content = {
    'internal' : { 'contentType' : ContentType, 'size' : number }
  } |
  {
    'ipfs' : { 'cid' : IPFS_CID, 'contentType' : ContentType, 'size' : number }
  } |
  { 'external' : null };
export type ContentType = string;
export type CustomData = Array<number>;
export interface FetchChunkRequest {
  'tokenIndex' : TokenIndex,
  'subaccount' : [] | [SubAccount],
  'chunkIdx' : number,
  'position' : { 'thumb' : null } |
    { 'content' : null },
}
export type HeaderField = [string, string];
export type IPFS_CID = string;
export type ItemLore = string;
export type ItemName = string;
export type ItemTransfer = { 'unrestricted' : null } |
  { 'bindsForever' : null } |
  { 'bindsDuration' : number };
export type Memo = bigint;
export interface Metadata {
  'classIndex' : [] | [CollectionIndex],
  'thumb' : Content,
  'created' : number,
  'content' : [] | [Content],
  'collectionId' : [] | [CollectionId],
  'authorShare' : Share,
  'custom' : [] | [CustomData],
  'quality' : Quality,
  'lore' : [] | [ItemLore],
  'name' : [] | [ItemName],
  'tags' : Tags,
  'secret' : boolean,
  'author' : AccountIdentifier,
  'entropy' : Array<number>,
  'attributes' : Attributes,
  'transfer' : ItemTransfer,
}
export interface MetadataInput {
  'ttl' : [] | [number],
  'thumb' : Content,
  'content' : [] | [Content],
  'collectionId' : [] | [CollectionId],
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
  'pwr' : bigint,
  'ttl' : [] | [number],
  'cooldownUntil' : [] | [number],
  'boundUntil' : [] | [number],
  'sockets' : Sockets,
  'price' : Price,
}
export interface MintRequest {
  'to' : User,
  'metadata' : MetadataInput,
  'subaccount' : [] | [SubAccount],
}
export type MintResponse = { 'ok' : TokenIndex } |
  {
    'err' : { 'Pwr' : TransferResponseError } |
      { 'Invalid' : string } |
      { 'InsufficientBalance' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : null } |
      { 'ClassError' : string } |
      { 'OutOfMemory' : null }
  };
export interface PlugRequest {
  'socket' : TokenIdentifier,
  'plug' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PlugResponse = { 'ok' : null } |
  {
    'err' : { 'InsufficientBalance' : null } |
      { 'SocketError' : SocketError } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export interface Price {
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'affiliate' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'amount' : bigint,
}
export interface PurchaseClaimRequest {
  'token' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseClaimResponse = { 'ok' : null } |
  {
    'err' : { 'TreasuryNotifyFailed' : null } |
      { 'Refunded' : null } |
      { 'ErrorWhileRefunding' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'NotForSale' : null } |
      { 'NotEnoughToRefund' : null }
  };
export interface PurchaseIntentRequest {
  'token' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type PurchaseIntentResponse = {
    'ok' : { 'paymentAddress' : AccountIdentifier, 'price' : Price }
  } |
  { 'err' : { 'InvalidToken' : TokenIdentifier } | { 'NotForSale' : null } };
export type Quality = number;
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
export interface SetPriceRequest {
  'token' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
  'price' : Price,
}
export type SetPriceResponse = { 'ok' : null } |
  {
    'err' : { 'TooHigh' : null } |
      { 'InsufficientBalance' : null } |
      { 'NotTransferable' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'TooLow' : null } |
      { 'Other' : string }
  };
export type Share = number;
export type SocketError = { 'InsufficientBalance' : null } |
  { 'NotLegitimateCaller' : null } |
  { 'InvalidToken' : TokenIdentifier } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'ClassError' : string } |
  { 'Other' : string } |
  { 'SocketsFull' : null };
export interface SocketRequest {
  'socket' : TokenIdentifier,
  'plug' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type SocketResponse = { 'ok' : null } |
  { 'err' : SocketError };
export type Sockets = Array<TokenIdentifierBlob>;
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
export type Tag = string;
export type Tags = Array<Tag>;
export interface Token {
  'key' : string,
  'sha256' : [] | [Array<number>],
  'index' : bigint,
  'content_encoding' : string,
}
export type TokenIdentifier = string;
export type TokenIdentifierBlob = Array<number>;
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
  'from' : User,
  'memo' : Memo,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferResponse = { 'ok' : Balance } |
  { 'err' : TransferResponseError };
export type TransferResponseError = { 'InsufficientBalance' : null } |
  { 'NotTransferable' : null } |
  { 'InvalidToken' : TokenIdentifier } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'Other' : string };
export type UnplugError = { 'InsufficientBalance' : null } |
  { 'NotLegitimateCaller' : null } |
  { 'InvalidToken' : TokenIdentifier } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'Other' : string };
export type UnplugResponse = { 'ok' : null } |
  { 'err' : UnplugError };
export interface UnsocketRequest {
  'socket' : TokenIdentifier,
  'plug' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type UnsocketResponse = { 'ok' : null } |
  {
    'err' : { 'UnplugError' : UnplugError } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export interface UploadChunkRequest {
  'tokenIndex' : TokenIndex,
  'data' : Array<number>,
  'subaccount' : [] | [SubAccount],
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
export interface _SERVICE extends Class {}
