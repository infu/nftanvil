export const idlFactory = ({ IDL }) => {
  const FTokenId__1 = IDL.Nat64;
  const FTKind = IDL.Variant({
    'normal' : IDL.Null,
    'fractionless' : IDL.Null,
  });
  const FTShort = IDL.Record({
    'id' : FTokenId__1,
    'controller' : IDL.Principal,
    'transferable' : IDL.Bool,
    'kind' : FTKind,
    'name' : IDL.Text,
    'origin' : IDL.Text,
    'symbol' : IDL.Text,
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
  const FTokenId = IDL.Nat64;
  const FTMeta = IDL.Record({
    'fee' : IDL.Nat64,
    'controller' : IDL.Principal,
    'decimals' : IDL.Nat8,
    'transferable' : IDL.Bool,
    'desc' : IDL.Text,
    'kind' : FTKind,
    'name' : IDL.Text,
    'origin' : IDL.Text,
    'mintable' : IDL.Bool,
    'total_supply' : IDL.Nat64,
    'symbol' : IDL.Text,
  });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const MintRequest = IDL.Record({
    'id' : FTokenId__1,
    'aid' : AccountIdentifier,
    'mintable' : IDL.Bool,
    'amount' : IDL.Nat64,
  });
  const MintResponse = IDL.Variant({
    'ok' : IDL.Record({ 'transactionId' : IDL.Vec(IDL.Nat8) }),
    'err' : IDL.Text,
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
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
  const RegisterResponse = IDL.Variant({
    'ok' : FTokenId__1,
    'err' : IDL.Text,
  });
  const StatsResponse = IDL.Record({
    'cycles_recieved' : IDL.Nat,
    'rts_max_live_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'rts_memory_size' : IDL.Nat,
    'rts_total_allocation' : IDL.Nat,
    'rts_heap_size' : IDL.Nat,
    'rts_reclaimed' : IDL.Nat,
    'rts_version' : IDL.Text,
  });
  const FTLogistics = IDL.Record({
    'fee' : IDL.Nat64,
    'decimals' : IDL.Nat8,
    'transferable' : IDL.Bool,
    'kind' : FTKind,
  });
  const Class = IDL.Service({
    'all_tokens' : IDL.Func([], [IDL.Vec(FTShort)], ['query']),
    'config_set' : IDL.Func([Config], [], []),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'meta' : IDL.Func([FTokenId], [FTMeta], ['query']),
    'mint' : IDL.Func([MintRequest], [MintResponse], []),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'register' : IDL.Func([RegisterRequest], [RegisterResponse], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
    'token_logistics' : IDL.Func([FTokenId], [FTLogistics], ['query']),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
