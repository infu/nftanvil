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
export type Extension = string;
export type Memo = Array<number>;
export type Metadata = {
    'fungible' : {
      'decimals' : number,
      'metadata' : [] | [Array<number>],
      'name' : string,
      'symbol' : string,
    }
  } |
  {
    'nonfungible' : {
      'TTL' : [] | [number],
      'created' : Time,
      'metadata' : Array<number>,
      'minter' : Principal,
    }
  };
export type MetadataResponse = { 'ok' : Metadata__1 } |
  { 'err' : CommonError };
export type Metadata__1 = {
    'fungible' : {
      'decimals' : number,
      'metadata' : [] | [Array<number>],
      'name' : string,
      'symbol' : string,
    }
  } |
  {
    'nonfungible' : {
      'TTL' : [] | [number],
      'created' : Time,
      'metadata' : Array<number>,
      'minter' : Principal,
    }
  };
export type MintBatchResponse = { 'ok' : Array<TokenIndex__1> } |
  { 'err' : CommonError };
export interface MintRequest { 'to' : User, 'metadata' : Array<number> }
export type MintResponse = { 'ok' : TokenIndex__1 } |
  { 'err' : CommonError };
export interface OwnedResponse {
  'idx' : TokenIndex,
  'metadata' : [] | [Metadata],
}
export interface Request {
  'token' : TokenIdentifier,
  'owner' : User,
  'spender' : Principal,
}
export type Response = { 'ok' : Balance } |
  { 'err' : CommonError };
export interface StatsResponse {
  'transfers' : number,
  'minted' : number,
  'accounts' : number,
  'burned' : number,
}
export type SubAccount = Array<number>;
export type SupplyResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export type Time = bigint;
export interface Token {
  'allowance' : (arg_0: Request) => Promise<Response>,
  'approve' : (arg_0: ApproveRequest) => Promise<ApproveResponse>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier) => Promise<BearerResponse>,
  'burn' : (arg_0: BurnRequest) => Promise<BurnResponse>,
  'cyclesAccept' : () => Promise<undefined>,
  'cyclesBalance' : () => Promise<bigint>,
  'debugMode' : (arg_0: [] | [string]) => Promise<undefined>,
  'extensions' : () => Promise<Array<Extension>>,
  'metadata' : (arg_0: TokenIdentifier) => Promise<MetadataResponse>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
  'mintNFT_batch' : (arg_0: Array<MintRequest>) => Promise<MintBatchResponse>,
  'owned' : (arg_0: User__1) => Promise<Array<OwnedResponse>>,
  'stats' : () => Promise<StatsResponse>,
  'supply' : (arg_0: TokenIdentifier) => Promise<SupplyResponse>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
  'whoAmI' : () => Promise<Principal>,
}
export type TokenIdentifier = string;
export type TokenIndex = number;
export type TokenIndex__1 = number;
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
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export type User__1 = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Token {}
