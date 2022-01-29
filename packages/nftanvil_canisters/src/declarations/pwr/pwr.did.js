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
    'balance' : Balance,
    'oracle' : Oracle__1,
  });
  const CanisterSlot__1 = IDL.Nat16;
  const CanisterSlot = IDL.Nat16;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'anv' : CanisterSlot__1,
    'nft' : CanisterRange,
    'pwr' : CanisterSlot__1,
    'history' : CanisterSlot__1,
    'nft_avail' : IDL.Vec(CanisterSlot__1),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'router' : CanisterSlot__1,
    'treasury' : CanisterSlot__1,
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
  });
  const SubAccount__1 = IDL.Vec(IDL.Nat8);
  const MintRequest = IDL.Record({
    'metadata' : MetadataInput,
    'user' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
  });
  const TokenIndex = IDL.Nat32;
  const TokenIdentifier = IDL.Nat32;
  const TransferResponseError = IDL.Variant({
    'InsufficientBalance' : IDL.Null,
    'NotTransferable' : IDL.Null,
    'InvalidToken' : TokenIdentifier,
    'Rejected' : IDL.Null,
    'Unauthorized' : AccountIdentifier,
    'OutOfPower' : IDL.Null,
    'Other' : IDL.Text,
  });
  const MintResponse = IDL.Variant({
    'ok' : IDL.Record({
      'tokenIndex' : TokenIndex,
      'transactionId' : IDL.Vec(IDL.Nat8),
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
  const Balance__1 = IDL.Nat64;
  const PurchaseRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User__1,
    'subaccount' : IDL.Opt(SubAccount__1),
    'priceIdx' : IDL.Nat32,
    'amount' : Balance__1,
  });
  const PurchaseResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Variant({
      'TreasuryNotifyFailed' : IDL.Null,
      'Refunded' : IDL.Null,
      'InsufficientPayment' : Balance__1,
      'ErrorWhileRefunding' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
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
      'InvalidToken' : TokenIdentifier,
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
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier__2, Balance__2))],
        ['query'],
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
    'purchase_claim' : IDL.Func(
        [PurchaseClaimRequest],
        [PurchaseClaimResponse],
        [],
      ),
    'purchase_intent' : IDL.Func(
        [PurchaseIntentRequest],
        [PurchaseIntentResponse],
        [],
      ),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'withdraw' : IDL.Func([WithdrawRequest], [WithdrawResponse], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
