export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const Result_4 = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Basket = IDL.Vec(IDL.Opt(TokenIdentifier));
  const Result = IDL.Variant({ ok: Basket, err: IDL.Text });
  const Memo = IDL.Vec(IDL.Nat8);
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const BurnRequest = IDL.Record({
    token: TokenIdentifier,
    memo: Memo,
    user: User,
    subaccount: IDL.Opt(SubAccount),
  });
  const TransactionId = IDL.Vec(IDL.Nat8);
  const TransferResponseError = IDL.Variant({
    ICE: IDL.Text,
    InsufficientBalance: IDL.Null,
    NotTransferable: IDL.Null,
    InvalidToken: IDL.Null,
    Rejected: IDL.Null,
    Unauthorized: AccountIdentifier,
    OutOfPower: IDL.Null,
    Other: IDL.Text,
  });
  const BurnResponse = IDL.Variant({
    ok: IDL.Record({ transactionId: TransactionId }),
    err: TransferResponseError,
  });
  const Balance = IDL.Nat64;
  const Result_3 = IDL.Variant({ ok: Balance, err: IDL.Text });
  const Result_2 = IDL.Variant({ ok: IDL.Vec(IDL.Nat8), err: IDL.Text });
  const CanisterSlot = IDL.Nat64;
  const ContentType = IDL.Text;
  const IPFS_CID = IDL.Text;
  const ExternalUrl = IDL.Text;
  const Content = IDL.Variant({
    internal: IDL.Record({
      contentType: ContentType,
      size: IDL.Nat32,
    }),
    ipfs: IDL.Record({
      cid: IPFS_CID,
      contentType: ContentType,
      size: IDL.Nat32,
    }),
    external: ExternalUrl,
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
    marketplace: IDL.Opt(
      IDL.Record({ share: Share, address: AccountIdentifier })
    ),
    amount: IDL.Nat64,
  });
  const ItemTransfer = IDL.Variant({
    unrestricted: IDL.Null,
    bindsForever: IDL.Null,
    bindsDuration: IDL.Nat32,
  });
  const CustomVar = IDL.Vec(IDL.Nat8);
  const MetadataInput = IDL.Record({
    ttl: IDL.Opt(IDL.Nat32),
    thumb: Content,
    content: IDL.Opt(Content),
    domain: IDL.Opt(DomainName),
    authorShare: Share,
    custom: IDL.Opt(CustomData),
    quality: Quality,
    lore: IDL.Opt(IDL.Text),
    name: IDL.Opt(IDL.Text),
    tags: Tags,
    secret: IDL.Bool,
    attributes: Attributes,
    price: Price,
    transfer: ItemTransfer,
    rechargeable: IDL.Bool,
    customVar: IDL.Opt(CustomVar),
  });
  const MintRequest = IDL.Record({
    metadata: MetadataInput,
    user: User,
    subaccount: IDL.Opt(SubAccount),
  });
  const TokenIndex = IDL.Nat16;
  const MintResponse = IDL.Variant({
    ok: IDL.Record({
      tokenIndex: TokenIndex,
      transactionId: TransactionId,
    }),
    err: IDL.Variant({
      ICE: IDL.Text,
      Pwr: TransferResponseError,
      Invalid: IDL.Text,
      InsufficientBalance: IDL.Null,
      Rejected: IDL.Null,
      Unauthorized: IDL.Null,
      ClassError: IDL.Text,
      OutOfMemory: IDL.Null,
    }),
  });
  const AccountRecordSerialized = IDL.Record({
    tokens: IDL.Vec(TokenIdentifier),
  });
  const Result_1 = IDL.Variant({
    ok: AccountRecordSerialized,
    err: IDL.Text,
  });
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    nft: CanisterRange,
    pwr: CanisterRange,
    anvil: CanisterSlot,
    history: CanisterSlot,
    nft_avail: IDL.Vec(CanisterSlot),
    space: IDL.Vec(IDL.Vec(IDL.Nat64)),
    account: CanisterRange,
    history_range: CanisterRange,
    router: IDL.Principal,
    treasury: CanisterSlot,
  });
  const Class = IDL.Service({
    add: IDL.Func([TokenIdentifier], [Result_4], []),
    airdrop_add: IDL.Func([IDL.Vec(IDL.Nat8)], [Result_4], []),
    airdrop_use: IDL.Func([AccountIdentifier, IDL.Vec(IDL.Nat8)], [Result], []),
    burn: IDL.Func([BurnRequest], [BurnResponse], []),
    buy_tx: IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result], []),
    claim: IDL.Func(
      [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
      [Result_4],
      []
    ),
    icp_balance: IDL.Func([], [Result_3], []),
    icp_transfer: IDL.Func([AccountIdentifier, Balance], [Result_2], []),
    nft_mint: IDL.Func([CanisterSlot, MintRequest], [MintResponse], []),
    owned: IDL.Func([AccountIdentifier], [Result_1], ["query"]),
    set_admin: IDL.Func([IDL.Principal], [], ["oneway"]),
    set_anvil_config: IDL.Func([Config], [], []),
    set_params: IDL.Func(
      [IDL.Record({ airdrop: IDL.Nat, purchase: IDL.Nat })],
      [],
      ["oneway"]
    ),
    stats: IDL.Func(
      [],
      [
        IDL.Record({
          total: IDL.Nat,
          added: IDL.Nat,
          available: IDL.Nat,
          airdrop: IDL.Nat,
          purchase: IDL.Nat,
        }),
      ],
      ["query"]
    ),
    ticket_tx: IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result], []),
  });
  return Class;
};
export const init = ({ IDL }) => {
  return [];
};
