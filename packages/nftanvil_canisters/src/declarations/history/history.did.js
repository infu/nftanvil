export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Int;
  const Memo = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const EventFungibleTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'created' : Timestamp,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const AnvEvent = IDL.Variant({ 'transfer' : EventFungibleTransaction });
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consume' : IDL.Null,
    'prove' : IDL.Null,
    'cooldown' : Cooldown,
  });
  const TokenIdentifier = IDL.Nat64;
  const Share = IDL.Nat16;
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const Price = IDL.Record({
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier__1 })
    ),
    'amount' : IDL.Nat64,
  });
  const Time = IDL.Int;
  const TokenIdentifier__1 = IDL.Nat64;
  const Balance__1 = IDL.Nat64;
  const NFTPurchase = IDL.Record({
    'created' : Time,
    'token' : TokenIdentifier__1,
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier__1 })
    ),
    'seller' : AccountIdentifier__1,
    'author' : IDL.Record({
      'share' : Share,
      'address' : AccountIdentifier__1,
    }),
    'recharge' : Balance__1,
    'affiliate' : IDL.Opt(
      IDL.Record({ 'address' : AccountIdentifier__1, 'amount' : Balance__1 })
    ),
    'buyer' : AccountIdentifier__1,
    'amount' : Balance__1,
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
  const EventInfo = IDL.Variant({
    'anv' : AnvEvent,
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
    'history' : CanisterSlot,
    'nft_avail' : IDL.Vec(CanisterSlot),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
    'treasury' : CanisterSlot,
  });
  const EventIndex = IDL.Nat32;
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
    'add' : IDL.Func([EventInfo], [AddResponse], []),
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
