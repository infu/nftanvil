import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type AllowResponse = { 'ok' : null } |
  { 'err' : string };
export interface Class {
  'author_allow' : (arg_0: AccountIdentifier, arg_1: CollectionId) => Promise<
      AllowResponse
    >,
  'config_set' : (arg_0: Config) => Promise<undefined>,
  'create' : (arg_0: Collection) => Promise<CreateResponse>,
  'info' : (arg_0: CollectionId) => Promise<InfoResponse>,
  'mint_nextId' : (arg_0: AccountIdentifier, arg_1: CollectionId) => Promise<
      MintNextIdResponse
    >,
  'socket_allow' : (arg_0: SocketRequest, arg_1: CollectionId) => Promise<
      AllowResponse
    >,
}
export interface Collection {
  'max' : CollectionIndex,
  'contentType' : ContentType,
  'domain' : [] | [DomainName],
  'authors' : Array<AccountIdentifier>,
  'renderer' : [] | [Renderer],
  'socketable' : Array<CollectionId>,
  'lastIdx' : CollectionIndex,
}
export type CollectionId = number;
export type CollectionIndex = number;
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
export type ContentType = string;
export type CreateResponse = { 'ok' : CollectionId } |
  { 'err' : string };
export type DomainName = string;
export type ICPath = string;
export type IPFS_CID = string;
export type InfoResponse = { 'ok' : Collection } |
  { 'err' : { 'NotFound' : null } };
export type MintNextIdResponse = { 'ok' : CollectionIndex } |
  { 'err' : string };
export type Renderer = { 'wasm' : { 'ic' : ICPath } | { 'ipfs' : IPFS_CID } } |
  { 'canister' : { 'contentType' : ContentType } };
export interface SocketRequest {
  'socket' : TokenIdentifier,
  'plug' : TokenIdentifier,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type SubAccount = Array<number>;
export type TokenIdentifier = string;
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Class {}
