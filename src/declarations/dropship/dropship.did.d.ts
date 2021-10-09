import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = string;
export interface ApproveRequest {
  'token' : TokenIdentifier,
  'subaccount' : [] | [SubAccount],
  'allowance' : Balance,
  'spender' : Principal,
}
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier, 'user' : User }
export type BalanceResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export type BearerResponse = { 'ok' : AccountIdentifier } |
  { 'err' : CommonError };
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
  { 'nonfungible' : { 'metadata' : [] | [Array<number>] } };
export type MetadataResponse = { 'ok' : Metadata } |
  { 'err' : CommonError };
export interface MintRequest { 'to' : User, 'metadata' : [] | [Array<number>] }
export type MintResponse = { 'ok' : TokenIndex } |
  { 'err' : CommonError };
export interface Request {
  'token' : TokenIdentifier,
  'owner' : User,
  'spender' : Principal,
}
export type Response = { 'ok' : Balance } |
  { 'err' : CommonError };
export type SubAccount = Array<number>;
export type SupplyResponse = { 'ok' : Balance } |
  { 'err' : CommonError };
export interface Token {
  'allowance' : (arg_0: Request) => Promise<Response>,
  'approve' : (arg_0: ApproveRequest) => Promise<undefined>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier) => Promise<BearerResponse>,
  'extensions' : () => Promise<Array<Extension>>,
  'greet' : (arg_0: string) => Promise<string>,
  'metadata' : (arg_0: TokenIdentifier) => Promise<MetadataResponse>,
  'mintNFT' : (arg_0: MintRequest) => Promise<MintResponse>,
  'supply' : (arg_0: TokenIdentifier) => Promise<SupplyResponse>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
}
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
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Token {}
