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
  const TokenIdentifier = IDL.Nat32;
  const Time = IDL.Int;
  const TokenIdentifier__1 = IDL.Nat32;
  const Share = IDL.Nat16;
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const Balance__1 = IDL.Nat64;
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const BlockIndex = IDL.Nat64;
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
    'purchaseAccount' : AccountIdentifier__1,
    'affiliate' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier__1 })
    ),
    'buyer' : AccountIdentifier__1,
    'amount' : ICP,
    'ledgerBlock' : BlockIndex,
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
    }),
    'unsocket' : IDL.Record({
      'created' : Timestamp,
      'socket' : TokenIdentifier,
      'memo' : Memo,
      'plug' : TokenIdentifier,
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
    }),
    'approve' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifier,
      'user' : AccountIdentifier,
      'spender' : IDL.Principal,
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
  const TreasuryWithdraw = IDL.Record({
    'created' : Timestamp,
    'user' : AccountIdentifier,
    'amount' : Balance,
  });
  const TreasuryEvent = IDL.Variant({ 'withdraw' : TreasuryWithdraw });
  const EventInfo = IDL.Variant({
    'anv' : AnvEvent,
    'nft' : NftEvent,
    'pwr' : PwrEvent,
    'treasury' : TreasuryEvent,
  });
  const AddResponse = IDL.Vec(IDL.Nat8);
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
  const EventIndex = IDL.Nat32;
  const InfoResponse = IDL.Record({
    'total' : EventIndex,
    'previous' : IDL.Opt(IDL.Principal),
  });
  const ListRequest = IDL.Record({ 'to' : EventIndex, 'from' : EventIndex });
  const Event = IDL.Record({ 'hash' : IDL.Vec(IDL.Nat8), 'info' : EventInfo });
  const ListResponse = IDL.Vec(IDL.Opt(Event));
  const Class = IDL.Service({
    'add' : IDL.Func([EventInfo], [AddResponse], []),
    'config_set' : IDL.Func([Config], [], []),
    'info' : IDL.Func([], [InfoResponse], ['query']),
    'list' : IDL.Func([ListRequest], [ListResponse], ['query']),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
