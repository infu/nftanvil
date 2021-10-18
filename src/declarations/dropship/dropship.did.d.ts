import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = string;
export type ItemClassId = bigint;
export type Media = { 'img' : URL } |
  { 'video' : URL };
export interface MintRequest {
  'to' : User,
  'media' : [] | [Media],
  'thumb' : [] | [URL],
  'classId' : ItemClassId,
}
export type MintResponse = { 'ok' : TokenIndex } |
  { 'err' : { 'Rejected' : null } | { 'OutOfMemory' : null } };
export interface Router {
  'debug_reset' : () => Promise<undefined>,
  'getCanisters' : () => Promise<{ 'nft' : Array<Principal> }>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
}
export type TokenIndex = number;
export type URL = string;
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Router {}
