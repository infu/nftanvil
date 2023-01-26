export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User__2 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({ 'user' : User__2 });
  const FTokenId = IDL.Nat64;
  const Balance = IDL.Nat64;
  const AccountRecordSerialized = IDL.Vec(IDL.Tuple(FTokenId, Balance));
  const Oracle__1 = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const BalanceResponse = IDL.Record({
    'ft' : AccountRecordSerialized,
    'anv' : Balance,
    'pwr' : Balance,
    'oracle' : Oracle__1,
  });
  const AccountIdentifier__2 = IDL.Vec(IDL.Nat8);
  const Balance__3 = IDL.Nat64;
  const FTKind = IDL.Variant({
    'normal' : IDL.Null,
    'fractionless' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
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
  const Balance__4 = IDL.Nat64;
  const FTokenId__2 = IDL.Nat64;
  const AddLiquidityRequest = IDL.Record({
    'aid' : AccountIdentifier,
    'token_two_amount' : Balance__4,
    'token_one_amount' : Balance__4,
    'token_one' : FTokenId__2,
    'token_two' : FTokenId__2,
  });
  const SubAccount__2 = IDL.Vec(IDL.Nat8);
  const AddLiquidityResponse = IDL.Variant({
    'ok' : IDL.Float64,
    'err' : IDL.Text,
  });
  const CreatePoolRequest = IDL.Record({
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const CreatePoolResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const RemLiquidityRequest = IDL.Record({
    'aid' : AccountIdentifier,
    'token_one' : FTokenId__2,
    'token_two' : FTokenId__2,
  });
  const RemLiquidityResponse = IDL.Variant({
    'ok' : IDL.Record({ 'one' : Balance__4, 'two' : Balance__4 }),
    'err' : IDL.Text,
  });
  const SwapRequest = IDL.Record({
    'reverse' : IDL.Bool,
    'amount_required' : Balance__4,
    'token_one' : FTokenId__2,
    'token_two' : FTokenId__2,
    'amount' : Balance__4,
  });
  const SwapResponse = IDL.Variant({
    'ok' : IDL.Record({ 'recieve' : IDL.Nat64, 'refund' : IDL.Nat64 }),
    'err' : IDL.Text,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const RegisterRequest = IDL.Record({
    'fee' : IDL.Nat64,
    'controller' : IDL.Principal,
    'decimals' : IDL.Nat8,
    'transferable' : IDL.Bool,
    'desc' : IDL.Text,
    'kind' : FTKind,
    'name' : IDL.Text,
    'origin' : IDL.Text,
    'image' : IDL.Vec(IDL.Nat8),
    'symbol' : IDL.Text,
  });
  const FtMintRequest = IDL.Record({
    'user' : User__2,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
    'options' : RegisterRequest,
  });
  const FtMintResponse = IDL.Variant({
    'ok' : IDL.Record({ 'id' : FTokenId, 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Text,
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
  const Tag = IDL.Text;
  const Tags = IDL.Vec(Tag);
  const Attribute = IDL.Tuple(IDL.Text, IDL.Nat16);
  const Attributes = IDL.Vec(Attribute);
  const ItemTransfer = IDL.Variant({
    'unrestricted' : IDL.Null,
    'bindsForever' : IDL.Null,
    'bindsDuration' : IDL.Nat32,
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
    'user' : User__2,
    'subaccount' : IDL.Opt(SubAccount__2),
  });
  const TokenIndex = IDL.Nat16;
  const TransactionId = IDL.Vec(IDL.Nat8);
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
  const TokenIdentifier = IDL.Nat64;
  const Balance__2 = IDL.Nat64;
  const FTokenId__1 = IDL.Nat64;
  const PurchaseRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User__2,
    'subaccount' : IDL.Opt(SubAccount__2),
    'payment_token_kind' : IDL.Variant({
      'normal' : IDL.Null,
      'fractionless' : IDL.Null,
    }),
    'affiliate' : IDL.Opt(
      IDL.Record({ 'address' : AccountIdentifier, 'amount' : Balance__2 })
    ),
    'amount' : Balance__2,
    'payment_token' : FTokenId__1,
  });
  const Time = IDL.Int;
  const NFTPurchase = IDL.Record({
    'created' : Time,
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'seller' : AccountIdentifier,
    'author' : IDL.Record({ 'share' : Share, 'address' : AccountIdentifier }),
    'recharge' : Balance__2,
    'affiliate' : IDL.Opt(
      IDL.Record({ 'address' : AccountIdentifier, 'amount' : Balance__2 })
    ),
    'buyer' : AccountIdentifier,
    'amount' : Balance__2,
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
      'InsufficientPayment' : Balance__2,
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
    'user' : User__2,
    'subaccount' : IDL.Opt(SubAccount__2),
    'amount' : Balance__2,
  });
  const RechargeResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientPayment' : Balance__2,
      'RechargeUnnecessary' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : IDL.Null,
    }),
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const EventPromoteTarget = IDL.Variant({ 'nft' : TokenIdentifier });
  const PromoteRequest = IDL.Record({
    'user' : User__2,
    'subaccount' : IDL.Opt(SubAccount),
    'target' : EventPromoteTarget,
    'amount' : Balance,
    'location' : IDL.Nat64,
    'payment_token' : FTokenId,
  });
  const PromoteResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Variant({
      'InsufficientPayment' : Balance,
      'RechargeUnnecessary' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : IDL.Null,
      'Rejected' : IDL.Null,
      'Unauthorized' : IDL.Null,
    }),
  });
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const PurchaseClaimRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const BlockIndex = IDL.Nat64;
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : ICP }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : ICP }),
  });
  const PurchaseClaimResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Variant({
      'PaymentTooSmall' : IDL.Null,
      'Ledger' : TransferError,
    }),
  });
  const PurchaseIntentRequest = IDL.Record({
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const PurchaseIntentResponse = IDL.Variant({
    'ok' : AccountIdentifier__1,
    'err' : IDL.Text,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferOldRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferOldResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : TransferResponseError,
  });
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount__1 = IDL.Vec(IDL.Nat8);
  const Balance__1 = IDL.Nat64;
  const WithdrawRequest = IDL.Record({
    'to' : User__1,
    'from' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
    'amount' : Balance__1,
  });
  const WithdrawResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : TransferResponseError,
  });
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : FTokenId,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : TransferResponseError,
  });
  const Class = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'balanceAddExternal' : IDL.Func(
        [FTokenId, AccountIdentifier__2, Balance__3, FTKind],
        [],
        [],
      ),
    'balanceAddExternalProtected' : IDL.Func(
        [FTokenId, AccountIdentifier__2, Balance__3, FTKind],
        [Result],
        [],
      ),
    'config_set' : IDL.Func([Config], [], []),
    'dex_add_liquidity' : IDL.Func(
        [AddLiquidityRequest, User__2, IDL.Opt(SubAccount__2)],
        [AddLiquidityResponse],
        [],
      ),
    'dex_create_pool' : IDL.Func(
        [CreatePoolRequest, User__2, IDL.Opt(SubAccount__2)],
        [CreatePoolResponse],
        [],
      ),
    'dex_rem_liquidity' : IDL.Func(
        [RemLiquidityRequest, User__2, IDL.Opt(SubAccount__2)],
        [RemLiquidityResponse],
        [],
      ),
    'dex_swap' : IDL.Func(
        [SwapRequest, User__2, IDL.Opt(SubAccount__2)],
        [SwapResponse],
        [],
      ),
    'exists' : IDL.Func([AccountIdentifier], [IDL.Bool], ['query']),
    'ft_mint' : IDL.Func(
        [
          IDL.Record({
            'id' : FTokenId,
            'aid' : AccountIdentifier__2,
            'kind' : FTKind,
            'amount' : Balance__3,
          }),
        ],
        [],
        [],
      ),
    'ft_register' : IDL.Func([FtMintRequest], [FtMintResponse], []),
    'nft_mint' : IDL.Func([CanisterSlot, MintRequest], [MintResponse], []),
    'nft_purchase' : IDL.Func(
        [CanisterSlot, PurchaseRequest],
        [PurchaseResponse],
        [],
      ),
    'nft_recharge' : IDL.Func(
        [CanisterSlot, RechargeRequest],
        [RechargeResponse],
        [],
      ),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'promote' : IDL.Func([PromoteRequest], [PromoteResponse], []),
    'pwr_purchase_claim' : IDL.Func(
        [PurchaseClaimRequest],
        [PurchaseClaimResponse],
        [],
      ),
    'pwr_purchase_intent' : IDL.Func(
        [PurchaseIntentRequest],
        [PurchaseIntentResponse],
        [],
      ),
    'pwr_transfer' : IDL.Func([TransferOldRequest], [TransferOldResponse], []),
    'pwr_withdraw' : IDL.Func([WithdrawRequest], [WithdrawResponse], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'cycles_recieved' : IDL.Nat,
            'total_accounts' : IDL.Nat,
            'rts_max_live_size' : IDL.Nat,
            'mint_accumulated' : IDL.Nat64,
            'cycles' : IDL.Nat,
            'rts_memory_size' : IDL.Nat,
            'rts_total_allocation' : IDL.Nat,
            'icp_withdrawn' : IDL.Nat64,
            'fees_charged' : IDL.Nat64,
            'distributed_anvil' : IDL.Nat64,
            'distributed_seller' : IDL.Nat64,
            'recharge_accumulated' : IDL.Nat64,
            'icp_deposited' : IDL.Nat64,
            'distributed_author' : IDL.Nat64,
            'distributed_marketplace' : IDL.Nat64,
            'purchases_accumulated' : IDL.Nat64,
            'rts_heap_size' : IDL.Nat,
            'distributed_affiliate' : IDL.Nat64,
            'rts_reclaimed' : IDL.Nat,
            'rts_version' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
