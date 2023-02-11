export const idlFactory = ({ IDL }) => {
  const Timestamp = IDL.Int;
  const FTokenId = IDL.Nat64;
  const Memo = IDL.Vec(IDL.Nat8);
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const FtBurn = IDL.Record({
    'created' : Timestamp,
    'token' : FTokenId,
    'memo' : Memo,
    'user' : AccountIdentifier,
    'amount' : Balance,
  });
  const FtMint = IDL.Record({
    'created' : Timestamp,
    'token' : FTokenId,
    'user' : AccountIdentifier,
    'amount' : Balance,
  });
  const FtRegister = IDL.Record({
    'created' : Timestamp,
    'token' : FTokenId,
    'cost' : Balance,
    'user' : AccountIdentifier,
  });
  const FtTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'created' : Timestamp,
    'token' : FTokenId,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const TokenIdentifier = IDL.Nat64;
  const EventPromoteTarget = IDL.Variant({ 'nft' : TokenIdentifier });
  const EventPromote = IDL.Record({
    'created' : Timestamp,
    'user' : AccountIdentifier,
    'target' : EventPromoteTarget,
    'amount' : Balance,
    'location' : IDL.Nat64,
    'payment_token' : FTokenId,
  });
  const FtEvent = IDL.Variant({
    'burn' : FtBurn,
    'mint' : FtMint,
    'register' : FtRegister,
    'transfer' : FtTransaction,
    'promote' : EventPromote,
  });
  const EventFungibleTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'created' : Timestamp,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const AnvEvent = IDL.Variant({ 'transfer' : EventFungibleTransaction });
  const DexAddLiquidity = IDL.Record({
    'created' : Timestamp,
    'token_two_amount' : Balance,
    'user' : AccountIdentifier,
    'token_one_amount' : Balance,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const DexSwap = IDL.Record({
    'created' : Timestamp,
    'reverse' : IDL.Bool,
    'user' : AccountIdentifier,
    'amount_recieved' : Balance,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
    'amount' : Balance,
  });
  const DexRemLiquidity = IDL.Record({
    'created' : Timestamp,
    'token_two_amount' : Balance,
    'user' : AccountIdentifier,
    'token_one_amount' : Balance,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const DexCreatePool = IDL.Record({
    'created' : Timestamp,
    'cost' : Balance,
    'user' : AccountIdentifier,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const DexEvent = IDL.Variant({
    'add_liquidity' : DexAddLiquidity,
    'swap' : DexSwap,
    'rem_liquidity' : DexRemLiquidity,
    'create_pool' : DexCreatePool,
  });
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consume' : IDL.Null,
    'prove' : IDL.Null,
    'cooldown' : Cooldown,
  });
  const Share = IDL.Nat16;
  const Price = IDL.Record({
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier })
    ),
    'amount' : IDL.Nat64,
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
  const NftEvent = IDL.Variant({
    'use' : IDL.Record({
      'use' : ItemUse,
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'socket' : IDL.Record({
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
      'user' : AccountIdentifier,
    }),
    'unsocket' : IDL.Record({
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
      'user' : AccountIdentifier,
    }),
    'burn' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'mint' : IDL.Record({
      'pwr' : Balance,
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
    }),
    'approve' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
      'spender' : IDL.Principal,
    }),
    'price' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
      'price' : Price,
    }),
    'transfer' : IDL.Record({
      'to' : AccountIdentifier,
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }),
    'purchase' : NFTPurchase,
  });
  const PwrWithdraw = IDL.Record({
    'to' : AccountIdentifier,
    'created' : Timestamp,
    'from' : AccountIdentifier,
    'amount' : Balance,
  });
  const EventFungibleMint = IDL.Record({
    'created' : Timestamp,
    'user' : AccountIdentifier,
    'amount' : Balance,
  });
  const PwrEvent = IDL.Variant({
    'withdraw' : PwrWithdraw,
    'mint' : EventFungibleMint,
    'transfer' : EventFungibleTransaction,
  });
  const EventInfo__1 = IDL.Variant({
    'ft' : FtEvent,
    'anv' : AnvEvent,
    'dex' : DexEvent,
    'nft' : NftEvent,
    'pwr' : PwrEvent,
  });
  const AddResponse = IDL.Vec(IDL.Nat8);
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
  const EventIndex = IDL.Nat32;
  const EventInfo = IDL.Variant({
    'ft' : FtEvent,
    'anv' : AnvEvent,
    'dex' : DexEvent,
    'nft' : NftEvent,
    'pwr' : PwrEvent,
  });
  const Event = IDL.Record({ 'hash' : IDL.Vec(IDL.Nat8), 'info' : EventInfo });
  const InfoResponse = IDL.Record({
    'total' : EventIndex,
    'previous' : IDL.Opt(IDL.Principal),
  });
  const ListRequest = IDL.Record({ 'to' : EventIndex, 'from' : EventIndex });
  const ListResponse = IDL.Vec(IDL.Opt(Event));
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([EventInfo__1], [AddResponse], []),
    'config_set' : IDL.Func([Config], [], []),
    'get' : IDL.Func([EventIndex], [IDL.Opt(Event)], ['query']),
    'info' : IDL.Func([], [InfoResponse], ['query']),
    'list' : IDL.Func([ListRequest], [ListResponse], ['query']),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'cycles_recieved' : IDL.Nat,
            'rts_max_live_size' : IDL.Nat,
            'cycles' : IDL.Nat,
            'rts_memory_size' : IDL.Nat,
            'rts_total_allocation' : IDL.Nat,
            'transactions' : IDL.Nat32,
            'rts_heap_size' : IDL.Nat,
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
