export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  });
  const Request = IDL.Record({
    token: TokenIdentifier,
    owner: User,
    spender: IDL.Principal,
  });
  const Balance = IDL.Nat;
  const CommonError = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  });
  const Response = IDL.Variant({ ok: Balance, err: CommonError });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ApproveRequest = IDL.Record({
    token: TokenIdentifier,
    subaccount: IDL.Opt(SubAccount),
    allowance: Balance,
    spender: IDL.Principal,
  });
  const ApproveResponse = IDL.Variant({
    ok: IDL.Null,
    err: IDL.Variant({
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  });
  const BalanceRequest = IDL.Record({
    token: TokenIdentifier,
    user: User,
  });
  const BalanceResponse = IDL.Variant({ ok: Balance, err: CommonError });
  const BearerResponse = IDL.Variant({
    ok: AccountIdentifier,
    err: CommonError,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const BurnRequest = IDL.Record({
    token: TokenIdentifier,
    notify: IDL.Bool,
    memo: Memo,
    user: User,
    subaccount: IDL.Opt(SubAccount),
    amount: Balance,
  });
  const BurnResponse = IDL.Variant({
    ok: Balance,
    err: IDL.Variant({
      CannotNotify: AccountIdentifier,
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier,
      Rejected: IDL.Null,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  });
  const Extension = IDL.Text;
  const Time = IDL.Int;
  const Metadata__1 = IDL.Variant({
    fungible: IDL.Record({
      decimals: IDL.Nat8,
      metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
      name: IDL.Text,
      symbol: IDL.Text,
    }),
    nonfungible: IDL.Record({
      TTL: IDL.Opt(IDL.Nat32),
      created: Time,
      metadata: IDL.Vec(IDL.Nat8),
      minter: AccountIdentifier,
    }),
  });
  const MetadataResponse = IDL.Variant({
    ok: Metadata__1,
    err: CommonError,
  });
  const MintRequest = IDL.Record({
    to: User,
    // TTL: IDL.Opt(IDL.Nat32),
    metadata: IDL.Vec(IDL.Nat8),
    // 'minter' : AccountIdentifier,
  });
  const TokenIndex__1 = IDL.Nat32;
  const MintResponse = IDL.Variant({
    ok: TokenIndex__1,
    err: CommonError,
  });
  const MintBatchResponse = IDL.Variant({
    ok: IDL.Vec(TokenIndex__1),
    err: CommonError,
  });
  const User__1 = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  });
  const TokenIndex = IDL.Nat32;
  const Metadata = IDL.Variant({
    fungible: IDL.Record({
      decimals: IDL.Nat8,
      metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
      name: IDL.Text,
      symbol: IDL.Text,
    }),
    nonfungible: IDL.Record({
      TTL: IDL.Opt(IDL.Nat32),
      created: Time,
      metadata: IDL.Vec(IDL.Nat8),
      minter: AccountIdentifier,
    }),
  });
  const OwnedResponse = IDL.Record({
    idx: TokenIndex,
    metadata: IDL.Opt(Metadata),
  });
  const StatsResponse = IDL.Record({
    transfers: IDL.Nat32,
    minted: IDL.Nat32,
    accounts: IDL.Nat32,
    burned: IDL.Nat32,
  });
  const SupplyResponse = IDL.Variant({ ok: Balance, err: CommonError });
  const TransferRequest = IDL.Record({
    to: User,
    token: TokenIdentifier,
    notify: IDL.Bool,
    from: User,
    memo: Memo,
    subaccount: IDL.Opt(SubAccount),
    amount: Balance,
  });
  const TransferResponse = IDL.Variant({
    ok: Balance,
    err: IDL.Variant({
      CannotNotify: AccountIdentifier,
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier,
      Rejected: IDL.Null,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  });
  const Token = IDL.Service({
    allowance: IDL.Func([Request], [Response], ["query"]),
    approve: IDL.Func([ApproveRequest], [ApproveResponse], []),
    balance: IDL.Func([BalanceRequest], [BalanceResponse], ["query"]),
    bearer: IDL.Func([TokenIdentifier], [BearerResponse], ["query"]),
    burn: IDL.Func([BurnRequest], [BurnResponse], []),
    cyclesAccept: IDL.Func([], [], []),
    cyclesBalance: IDL.Func([], [IDL.Nat], ["query"]),
    extensions: IDL.Func([], [IDL.Vec(Extension)], ["query"]),
    init: IDL.Func([IDL.Text, IDL.Principal], [], []),
    metadata: IDL.Func([TokenIdentifier], [MetadataResponse], ["query"]),
    mintNFT: IDL.Func([MintRequest], [MintResponse], []),
    mintNFT_batch: IDL.Func([IDL.Vec(MintRequest)], [MintBatchResponse], []),
    owned: IDL.Func([User__1], [IDL.Vec(OwnedResponse)], ["query"]),
    stats: IDL.Func([], [StatsResponse], ["query"]),
    supply: IDL.Func([TokenIdentifier], [SupplyResponse], ["query"]),
    transfer: IDL.Func([TransferRequest], [TransferResponse], []),
    whoAmI: IDL.Func([], [IDL.Principal], []),
  });
  return Token;
};
export const init = ({ IDL }) => {
  return [];
};
