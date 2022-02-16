export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const User__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({ 'user' : User__1 });
  const Balance = IDL.Nat64;
  const Oracle__1 = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const BalanceResponse = IDL.Record({
    'anv' : Balance,
    'pwr' : Balance,
    'oracle' : Oracle__1,
  });
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const CanisterSlot__1 = IDL.Nat64;
  const Config = IDL.Record({
    'nft' : CanisterRange,
    'pwr' : CanisterSlot__1,
    'history' : CanisterSlot__1,
    'nft_avail' : IDL.Vec(CanisterSlot__1),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
  });
  const AccountIdentifier__2 = IDL.Vec(IDL.Nat8);
  const Balance__2 = IDL.Nat64;
  const ContentType = IDL.Text;
  const IPFS_CID = IDL.Text;
  const ICPath = IDL.Text;
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
    'external' : ICPath,
  });
  const DomainName = IDL.Text;
  const Share = IDL.Nat16;
  const CustomData = IDL.Vec(IDL.Nat8);
  const Quality = IDL.Nat8;
  const Tag = IDL.Text;
  const Tags = IDL.Vec(Tag);
  const Attribute = IDL.Tuple(IDL.Text, IDL.Nat16);
  const Attributes = IDL.Vec(Attribute);
  const Price = IDL.Record({
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'affiliate' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'amount' : IDL.Nat64,
  });
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
    'price' : Price,
    'transfer' : ItemTransfer,
    'rechargeable' : IDL.Bool,
    'customVar' : IDL.Opt(CustomVar),
  });
  const SubAccount__1 = IDL.Vec(IDL.Nat8);
  const MintRequest = IDL.Record({
    'metadata' : MetadataInput,
    'user' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
  });
  const TokenIndex = IDL.Nat16;
  const TransactionId = IDL.Vec(IDL.Nat8);
  const TransferResponseError = IDL.Variant({
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
  const Balance__1 = IDL.Nat64;
  const PurchaseRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
    'amount' : Balance__1,
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
    'recharge' : Balance__1,
    'affiliate' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'buyer' : AccountIdentifier,
    'amount' : Balance__1,
  });
  const PurchaseResponse = IDL.Variant({
    'ok' : IDL.Record({
      'purchase' : NFTPurchase,
      'transactionId' : TransactionId,
    }),
    'err' : IDL.Variant({
      'TreasuryNotifyFailed' : IDL.Null,
      'Refunded' : IDL.Null,
      'InsufficientPayment' : Balance__1,
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
    'user' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
    'amount' : Balance__1,
  });
  const RechargeResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientPayment' : Balance__1,
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
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
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
  const TransferRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : TransferResponseError,
  });
  const WithdrawRequest = IDL.Record({
    'to' : User,
    'from' : User,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const WithdrawResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : TransferResponseError,
  });
  const Class = IDL.Service({
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'faucet' : IDL.Func(
        [IDL.Record({ 'aid' : AccountIdentifier__2, 'amount' : Balance__2 })],
        [],
        [],
      ),
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
    'pwr_transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
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
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
