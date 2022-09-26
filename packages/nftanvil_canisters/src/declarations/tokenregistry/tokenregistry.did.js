export const idlFactory = ({ IDL }) => {
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
    'decimals' : IDL.Nat8,
    'transferable' : IDL.Bool,
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'mintable' : IDL.Bool,
    'accounts' : IDL.Nat32,
    'total_supply' : IDL.Nat64,
    'symbol' : IDL.Text,
  });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Result = IDL.Variant({
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
    'decimals' : IDL.Nat8,
    'transferable' : IDL.Bool,
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'image' : IDL.Vec(IDL.Nat8),
    'max_accounts' : IDL.Nat32,
    'symbol' : IDL.Text,
  });
  const FTokenId__1 = IDL.Nat64;
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
    'transferable' : IDL.Bool,
    'account_creation_allowed' : IDL.Bool,
  });
  const Class = IDL.Service({
    'config_set' : IDL.Func([Config], [], []),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'meta' : IDL.Func([FTokenId], [FTMeta], ['query']),
    'mint' : IDL.Func(
        [
          IDL.Record({
            'id' : FTokenId,
            'aid' : AccountIdentifier,
            'amount' : IDL.Nat64,
          }),
        ],
        [Result],
        [],
      ),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'register' : IDL.Func([RegisterRequest], [RegisterResponse], []),
    'stats' : IDL.Func([], [StatsResponse], ['query']),
    'token_logistics' : IDL.Func([FTokenId], [FTLogistics], ['query']),
    'track_usage' : IDL.Func([FTokenId, IDL.Int32], [], ['oneway']),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
