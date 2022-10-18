import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export interface AccountRecordSerialized { 'tokens' : Array<TokenIdentifier> }
export type Attribute = [string, number];
export type Attributes = Array<Attribute>;
export type Balance = bigint;
export type Basket = Array<[] | [TokenIdentifier]>;
export interface BurnRequest {
  'token' : TokenIdentifier,
  'memo' : Memo,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type BurnResponse = { 'ok' : { 'transactionId' : TransactionId } } |
  { 'err' : TransferResponseError };
export type CanisterRange = [CanisterSlot, CanisterSlot];
export type CanisterSlot = bigint;
export interface Class {
  'add' : (arg_0: TokenIdentifier) => Promise<Result_4>,
  'airdrop_add' : (arg_0: Array<number>) => Promise<Result_4>,
  'airdrop_use' : (arg_0: AccountIdentifier, arg_1: Array<number>) => Promise<
      Result
    >,
  'burn' : (arg_0: BurnRequest) => Promise<BurnResponse>,
  'buy_tx' : (arg_0: TransactionId, arg_1: [] | [SubAccount]) => Promise<
      Result
    >,
  'claim' : (
      arg_0: AccountIdentifier,
      arg_1: [] | [SubAccount],
      arg_2: TokenIdentifier,
    ) => Promise<Result_4>,
  'icp_balance' : () => Promise<Result_3>,
  'icp_transfer' : (arg_0: AccountIdentifier, arg_1: Balance) => Promise<
      Result_2
    >,
  'nft_mint' : (arg_0: CanisterSlot, arg_1: MintRequest) => Promise<
      MintResponse
    >,
  'owned' : (arg_0: AccountIdentifier) => Promise<Result_1>,
  'set_admin' : (arg_0: Principal) => Promise<undefined>,
  'set_anvil_config' : (arg_0: Config) => Promise<undefined>,
  'set_params' : (
      arg_0: { 'airdrop' : bigint, 'purchase' : bigint },
    ) => Promise<undefined>,
  'stats' : () => Promise<
      {
        'total' : bigint,
        'added' : bigint,
        'available' : bigint,
        'airdrop' : bigint,
        'purchase' : bigint,
      }
    >,
  'ticket_tx' : (arg_0: TransactionId, arg_1: [] | [SubAccount]) => Promise<
      Result
    >,
}
export interface Config {
  'nft' : CanisterRange,
  'pwr' : CanisterRange,
  'anvil' : CanisterSlot,
  'history' : CanisterSlot,
  'nft_avail' : Array<CanisterSlot>,
  'space' : Array<Array<bigint>>,
  'account' : CanisterRange,
  'history_range' : CanisterRange,
  'router' : Principal,
  'treasury' : CanisterSlot,
}
export type Content = {
    'internal' : { 'contentType' : ContentType, 'size' : number }
  } |
  {
    'ipfs' : { 'cid' : IPFS_CID, 'contentType' : ContentType, 'size' : number }
  } |
  { 'external' : ExternalUrl };
export type ContentType = string;
export type CustomData = Array<number>;
export type CustomVar = Array<number>;
export type DomainName = string;
export type ExternalUrl = string;
export type IPFS_CID = string;
export type ItemTransfer = { 'unrestricted' : null } |
  { 'bindsForever' : null } |
  { 'bindsDuration' : number };
export type Memo = Array<number>;
export interface MetadataInput {
  'ttl' : [] | [number],
  'thumb' : Content,
  'content' : [] | [Content],
  'domain' : [] | [DomainName],
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
  'rechargeable' : boolean,
  'customVar' : [] | [CustomVar],
}
export interface MintRequest {
  'metadata' : MetadataInput,
  'user' : User,
  'subaccount' : [] | [SubAccount],
}
export type MintResponse = {
    'ok' : { 'tokenIndex' : TokenIndex, 'transactionId' : TransactionId }
  } |
  {
    'err' : { 'ICE' : string } |
      { 'Pwr' : TransferResponseError } |
      { 'Invalid' : string } |
      { 'InsufficientBalance' : null } |
      { 'Rejected' : null } |
      { 'Unauthorized' : null } |
      { 'ClassError' : string } |
      { 'OutOfMemory' : null }
  };
export interface Price {
  'marketplace' : [] | [{ 'share' : Share, 'address' : AccountIdentifier }],
  'amount' : bigint,
}
export type Quality = number;
export type Result = { 'ok' : Basket } |
  { 'err' : string };
export type Result_1 = { 'ok' : AccountRecordSerialized } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<number> } |
  { 'err' : string };
export type Result_3 = { 'ok' : Balance } |
  { 'err' : string };
export type Result_4 = { 'ok' : null } |
  { 'err' : string };
export type Share = number;
export type SubAccount = Array<number>;
export type Tag = string;
export type Tags = Array<Tag>;
export type TokenIdentifier = bigint;
export type TokenIndex = number;
export type TransactionId = Array<number>;
export type TransferResponseError = { 'ICE' : string } |
  { 'InsufficientBalance' : null } |
  { 'NotTransferable' : null } |
  { 'InvalidToken' : null } |
  { 'Rejected' : null } |
  { 'Unauthorized' : AccountIdentifier } |
  { 'OutOfPower' : null } |
  { 'Other' : string };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends Class {}
