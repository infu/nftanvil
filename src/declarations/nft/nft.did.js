export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const Request = IDL.Record({
    'token' : TokenIdentifier,
    'owner' : User,
    'spender' : IDL.Principal,
  });
  const Balance = IDL.Nat;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Response = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ApproveRequest = IDL.Record({
    'token' : TokenIdentifier,
    'subaccount' : IDL.Opt(SubAccount),
    'allowance' : Balance,
    'spender' : IDL.Principal,
  });
  const ApproveResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const BalanceResponse = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const BearerResponse = IDL.Variant({
    'ok' : AccountIdentifier,
    'err' : CommonError,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const BurnRequest = IDL.Record({
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'memo' : Memo,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const BurnResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const Extension = IDL.Text;
  const TokenIndex = IDL.Nat32;
  const FetchChunkRequest = IDL.Record({
    'tokenIndex' : TokenIndex,
    'chunkIdx' : IDL.Nat32,
    'position' : IDL.Variant({ 'thumb' : IDL.Null, 'content' : IDL.Null }),
  });
  const Media = IDL.Text;
  const ItemClassId = IDL.Nat;
  const MetadataOut__1 = IDL.Record({
    'thumb' : IDL.Opt(Media),
    'created' : IDL.Nat32,
    'content' : IDL.Opt(Media),
    'cooldownUntil' : IDL.Opt(IDL.Nat32),
    'boundUntil' : IDL.Opt(IDL.Nat32),
    'classId' : ItemClassId,
    'entropy' : IDL.Vec(IDL.Nat8),
  });
  const MetadataResponse = IDL.Variant({
    'ok' : MetadataOut__1,
    'err' : CommonError,
  });
  const MintRequest = IDL.Record({ 'to' : User, 'classId' : ItemClassId });
  const MintResponse = IDL.Variant({
    'ok' : TokenIndex,
    'err' : IDL.Variant({ 'Rejected' : IDL.Null, 'OutOfMemory' : IDL.Null }),
  });
  const MintBatchResponse = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const TokenIndex__1 = IDL.Nat32;
  const MetadataOut = IDL.Record({
    'thumb' : IDL.Opt(Media),
    'created' : IDL.Nat32,
    'content' : IDL.Opt(Media),
    'cooldownUntil' : IDL.Opt(IDL.Nat32),
    'boundUntil' : IDL.Opt(IDL.Nat32),
    'classId' : ItemClassId,
    'entropy' : IDL.Vec(IDL.Nat8),
  });
  const OwnedResponse = IDL.Record({
    'idx' : TokenIndex__1,
    'metadata' : IDL.Opt(MetadataOut),
  });
  const StatsResponse = IDL.Record({
    'rts_max_live_size' : IDL.Nat,
    'transfers' : IDL.Nat32,
    'minted' : IDL.Nat32,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'accounts' : IDL.Nat32,
    'burned' : IDL.Nat32,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const SupplyResponse = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const UploadChunkRequest = IDL.Record({
    'tokenIndex' : TokenIndex,
    'data' : IDL.Vec(IDL.Nat8),
    'chunkIdx' : IDL.Nat32,
    'position' : IDL.Variant({ 'thumb' : IDL.Null, 'content' : IDL.Null }),
  });
  const NFT = IDL.Service({
    'allowance' : IDL.Func([Request], [Response], ['query']),
    'approve' : IDL.Func([ApproveRequest], [ApproveResponse], []),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier], [BearerResponse], ['query']),
    'burn' : IDL.Func([BurnRequest], [BurnResponse], []),
    'cyclesAccept' : IDL.Func([], [], []),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'debugMode' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'fetchChunk' : IDL.Func(
        [FetchChunkRequest],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        [],
      ),
    'metadata' : IDL.Func([TokenIdentifier], [MetadataResponse], ['query']),
    'mintNFT' : IDL.Func([MintRequest], [MintResponse], []),
    'mintNFT_batch' : IDL.Func([IDL.Vec(MintRequest)], [MintBatchResponse], []),
    'owned' : IDL.Func([User__1], [IDL.Vec(OwnedResponse)], ['query']),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
    'supply' : IDL.Func([TokenIdentifier], [SupplyResponse], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'uploadChunk' : IDL.Func([UploadChunkRequest], [], []),
  });
  return NFT;
};
export const init = ({ IDL }) => { return []; };
