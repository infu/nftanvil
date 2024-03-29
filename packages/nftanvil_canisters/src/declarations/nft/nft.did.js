export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const Request__1 = IDL.Record({
    'token' : TokenIdentifier,
    'owner' : User,
    'spender' : IDL.Principal,
  });
  const Balance = IDL.Nat64;
  const CommonError = IDL.Variant({
    'InvalidToken' : IDL.Null,
    'Other' : IDL.Text,
  });
  const Response__1 = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ApproveRequest = IDL.Record({
    'token' : TokenIdentifier,
    'subaccount' : IDL.Opt(SubAccount),
    'allowance' : Balance,
    'spender' : IDL.Principal,
  });
  const TransactionId = IDL.Vec(IDL.Nat8);
  const ApproveResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({
      'ICE' : IDL.Text,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
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
    'memo' : Memo,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const TransferResponseError = IDL.Variant({
    'ICE' : IDL.Text,
    'InsufficientBalance' : IDL.Null,
    'NotTransferable' : IDL.Null,
    'InvalidToken' : IDL.Null,
    'Rejected' : IDL.Null,
    'Unauthorized' : AccountIdentifier,
    'OutOfPower' : IDL.Null,
    'Other' : IDL.Text,
  });
  const BurnResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : TransferResponseError,
  });
  const ClaimLinkRequest = IDL.Record({
    'to' : User,
    'key' : IDL.Vec(IDL.Nat8),
    'token' : TokenIdentifier,
  });
  const ClaimLinkResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({ 'Rejected' : IDL.Null, 'Other' : IDL.Text }),
  });
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'nft' : CanisterRange,
    'pwr' : CanisterRange,
    'anvil' : CanisterSlot,
    'tokenregistry' : CanisterSlot,
    'history' : CanisterSlot,
    'nft_avail' : IDL.Vec(CanisterSlot),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
    'treasury' : CanisterSlot,
  });
  const TokenIndex = IDL.Nat16;
  const FetchChunkRequest = IDL.Record({
    'tokenIndex' : TokenIndex,
    'subaccount' : IDL.Opt(SubAccount),
    'chunkIdx' : IDL.Nat32,
    'position' : IDL.Variant({ 'thumb' : IDL.Null, 'content' : IDL.Null }),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const Request = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const Token = IDL.Record({
    'key' : IDL.Text,
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const CallbackFunc = IDL.Func([], [], []);
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({ 'token' : Token, 'callback' : CallbackFunc }),
  });
  const Response = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const Callback = IDL.Record({
    'token' : IDL.Opt(Token),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const ContentType = IDL.Text;
  const IPFS_CID = IDL.Text;
  const ExternalUrl = IDL.Text;
  const Content = IDL.Variant({
    'internal' : IDL.Record({
      'contentType' : ContentType,
      'size' : IDL.Nat32,
    }),
    'ipfs' : IDL.Record({
      'cid' : IPFS_CID,
      'contentType' : ContentType,
      'size' : IDL.Nat32,
    }),
    'external' : ExternalUrl,
  });
  const DomainName = IDL.Text;
  const Share = IDL.Nat16;
  const CustomData = IDL.Vec(IDL.Nat8);
  const Quality = IDL.Nat8;
  const ItemLore = IDL.Text;
  const ItemName = IDL.Text;
  const Tag = IDL.Text;
  const Tags = IDL.Vec(Tag);
  const Attribute = IDL.Tuple(IDL.Text, IDL.Nat16);
  const Attributes = IDL.Vec(Attribute);
  const ItemTransfer = IDL.Variant({
    'unrestricted' : IDL.Null,
    'bindsForever' : IDL.Null,
    'bindsDuration' : IDL.Nat32,
  });
  const Metadata = IDL.Record({
    'thumb' : Content,
    'created' : IDL.Nat32,
    'content' : IDL.Opt(Content),
    'domain' : IDL.Opt(DomainName),
    'authorShare' : Share,
    'custom' : IDL.Opt(CustomData),
    'quality' : Quality,
    'lore' : IDL.Opt(ItemLore),
    'name' : IDL.Opt(ItemName),
    'tags' : Tags,
    'secret' : IDL.Bool,
    'author' : AccountIdentifier,
    'entropy' : IDL.Vec(IDL.Nat8),
    'attributes' : Attributes,
    'transfer' : ItemTransfer,
    'rechargeable' : IDL.Bool,
  });
  const Sockets = IDL.Vec(TokenIdentifier);
  const Price = IDL.Record({
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'amount' : IDL.Nat64,
  });
  const MetavarsFrozen = IDL.Record({
    'ttl' : IDL.Opt(IDL.Nat32),
    'cooldownUntil' : IDL.Opt(IDL.Nat32),
    'boundUntil' : IDL.Opt(IDL.Nat32),
    'sockets' : Sockets,
    'history' : IDL.Vec(IDL.Vec(IDL.Nat8)),
    'pwrOps' : IDL.Nat64,
    'pwrStorage' : IDL.Nat64,
    'allowance' : IDL.Opt(IDL.Principal),
    'price' : Price,
  });
  const MetadataResponse = IDL.Variant({
    'ok' : IDL.Record({
      'data' : Metadata,
      'vars' : MetavarsFrozen,
      'bearer' : AccountIdentifier,
    }),
    'err' : CommonError,
  });
  const CustomVar = IDL.Vec(IDL.Nat8);
  const MetadataInput = IDL.Record({
    'ttl' : IDL.Opt(IDL.Nat32),
    'thumb' : Content,
    'content' : IDL.Opt(Content),
    'domain' : IDL.Opt(DomainName),
    'authorShare' : Share,
    'custom' : IDL.Opt(CustomData),
    'quality' : Quality,
    'lore' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'tags' : Tags,
    'secret' : IDL.Bool,
    'attributes' : Attributes,
    'transfer' : ItemTransfer,
    'rechargeable' : IDL.Bool,
    'customVar' : IDL.Opt(CustomVar),
  });
  const MintRequest = IDL.Record({
    'metadata' : MetadataInput,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const MintResponse = IDL.Variant({
    'ok' : IDL.Record({
      'tokenIndex' : TokenIndex,
      'transactionId' : TransactionId,
    }),
    'err' : IDL.Variant({
      'ICE' : IDL.Text,
      'Pwr' : TransferResponseError,
      'Invalid' : IDL.Text,
      'InsufficientBalance' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : IDL.Null,
      'ClassError' : IDL.Text,
      'OutOfMemory' : IDL.Null,
    }),
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const PlugRequest = IDL.Record({
    'socket' : TokenIdentifier,
    'memo' : Memo,
    'plug' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const SocketError = IDL.Variant({
    'InsufficientBalance' : IDL.Null,
    'NotLegitimateCaller' : IDL.Null,
    'InvalidToken' : IDL.Null,
    'Rejected' : IDL.Null,
    'Unauthorized' : AccountIdentifier,
    'ClassError' : IDL.Text,
    'Other' : IDL.Text,
    'SocketsFull' : IDL.Null,
  });
  const PlugResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'SocketError' : SocketError,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
      'Other' : IDL.Text,
    }),
  });
  const FTokenId = IDL.Nat64;
  const PurchaseRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'payment_token_kind' : IDL.Variant({
      'normal' : IDL.Null,
      'fractionless' : IDL.Null,
    }),
    'affiliate' : IDL.Opt(
      IDL.Record({ 'address' : AccountIdentifier, 'amount' : Balance })
    ),
    'amount' : Balance,
    'payment_token' : FTokenId,
  });
  const Time = IDL.Int;
  const NFTPurchase = IDL.Record({
    'created' : Time,
    'token' : TokenIdentifier,
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'seller' : AccountIdentifier,
    'author' : IDL.Record({ 'share' : Share, 'address' : AccountIdentifier }),
    'recharge' : Balance,
    'affiliate' : IDL.Opt(
      IDL.Record({ 'address' : AccountIdentifier, 'amount' : Balance })
    ),
    'buyer' : AccountIdentifier,
    'amount' : Balance,
  });
  const PurchaseResponse = IDL.Variant({
    'ok' : IDL.Record({
      'purchase' : NFTPurchase,
      'transactionId' : TransactionId,
    }),
    'err' : IDL.Variant({
      'ICE' : IDL.Text,
      'TreasuryNotifyFailed' : IDL.Null,
      'Refunded' : IDL.Null,
      'InsufficientPayment' : Balance,
      'ErrorWhileRefunding' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : IDL.Null,
      'NotForSale' : IDL.Null,
      'NotEnoughToRefund' : IDL.Null,
    }),
  });
  const RechargeRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const RechargeResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientPayment' : Balance,
      'RechargeUnnecessary' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : IDL.Null,
    }),
  });
  const SetPriceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'price' : Price,
  });
  const SetPriceResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({
      'ICE' : IDL.Text,
      'TooHigh' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'NotTransferable' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
      'TooLow' : IDL.Null,
      'Other' : IDL.Text,
    }),
  });
  const SocketRequest = IDL.Record({
    'socket' : TokenIdentifier,
    'plug' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const SocketResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : SocketError });
  const SupplyResponse = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const TransferResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : TransferResponseError,
  });
  const TransferLinkRequest = IDL.Record({
    'token' : TokenIdentifier,
    'from' : User,
    'hash' : IDL.Vec(IDL.Nat8),
    'subaccount' : IDL.Opt(SubAccount),
  });
  const TransferLinkResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
      'Other' : IDL.Text,
    }),
  });
  const UnsocketRequest = IDL.Record({
    'socket' : TokenIdentifier,
    'memo' : Memo,
    'plug' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const UnplugError = IDL.Variant({
    'InsufficientBalance' : IDL.Null,
    'NotLegitimateCaller' : IDL.Null,
    'InvalidToken' : IDL.Null,
    'Rejected' : IDL.Null,
    'Unauthorized' : AccountIdentifier,
    'Other' : IDL.Text,
  });
  const UnplugResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : UnplugError });
  const UnsocketResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({
      'UnplugError' : UnplugError,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
      'Other' : IDL.Text,
    }),
  });
  const UploadChunkRequest = IDL.Record({
    'tokenIndex' : TokenIndex,
    'data' : IDL.Vec(IDL.Nat8),
    'subaccount' : IDL.Opt(SubAccount),
    'chunkIdx' : IDL.Nat32,
    'position' : IDL.Variant({ 'thumb' : IDL.Null, 'content' : IDL.Null }),
  });
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consume' : IDL.Null,
    'prove' : IDL.Null,
    'cooldown' : Cooldown,
  });
  const UseRequest = IDL.Record({
    'use' : ItemUse,
    'token' : TokenIdentifier,
    'memo' : Memo,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'customVar' : IDL.Opt(CustomVar),
  });
  const UseResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : TransactionId }),
    'err' : IDL.Variant({
      'ICE' : IDL.Text,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'OutOfPower' : IDL.Null,
      'ExtensionError' : IDL.Text,
      'Other' : IDL.Text,
      'OnCooldown' : IDL.Null,
    }),
  });
  const Class = IDL.Service({
    'allowance' : IDL.Func([Request__1], [Response__1], ['query']),
    'approve' : IDL.Func([ApproveRequest], [ApproveResponse], []),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier], [BearerResponse], ['query']),
    'burn' : IDL.Func([BurnRequest], [BurnResponse], []),
    'claim_link' : IDL.Func([ClaimLinkRequest], [ClaimLinkResponse], []),
    'config_set' : IDL.Func([Config], [], []),
    'fetch_chunk' : IDL.Func(
        [FetchChunkRequest],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        [],
      ),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'http_request_streaming_callback' : IDL.Func(
        [Token],
        [Callback],
        ['query'],
      ),
    'metadata' : IDL.Func([TokenIdentifier], [MetadataResponse], ['query']),
    'mint' : IDL.Func([MintRequest], [MintResponse], []),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'plug' : IDL.Func([PlugRequest], [PlugResponse], []),
    'purchase' : IDL.Func([PurchaseRequest], [PurchaseResponse], []),
    'recharge' : IDL.Func([RechargeRequest], [RechargeResponse], []),
    'set_price' : IDL.Func([SetPriceRequest], [SetPriceResponse], []),
    'socket' : IDL.Func([SocketRequest], [SocketResponse], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'cycles_recieved' : IDL.Nat,
            'rts_max_live_size' : IDL.Nat,
            'transfers' : IDL.Nat32,
            'minted' : IDL.Nat16,
            'cycles' : IDL.Nat,
            'icall_errors' : IDL.Nat,
            'rts_memory_size' : IDL.Nat,
            'rts_total_allocation' : IDL.Nat,
            'burned' : IDL.Nat32,
            'rts_heap_size' : IDL.Nat,
            'rts_reclaimed' : IDL.Nat,
            'rts_version' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'supply' : IDL.Func([TokenIdentifier], [SupplyResponse], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'transfer_link' : IDL.Func(
        [TransferLinkRequest],
        [TransferLinkResponse],
        [],
      ),
    'unplug' : IDL.Func([UnsocketRequest], [UnplugResponse], []),
    'unsocket' : IDL.Func([UnsocketRequest], [UnsocketResponse], []),
    'upload_chunk' : IDL.Func([UploadChunkRequest], [], []),
    'use' : IDL.Func([UseRequest], [UseResponse], []),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
