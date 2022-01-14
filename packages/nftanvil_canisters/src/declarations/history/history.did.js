export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Int;
  const TokenIdentifierBlob = IDL.Vec(IDL.Nat8);
  const Memo = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const EventFungibleTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'created' : Timestamp,
    'token' : TokenIdentifierBlob,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const AnvEvent = IDL.Variant({ 'transaction' : EventFungibleTransaction });
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consume' : IDL.Null,
    'prove' : IDL.Null,
    'cooldown' : Cooldown,
  });
  const Time = IDL.Int;
  const TokenIdentifierBlob__1 = IDL.Vec(IDL.Nat8);
  const Share = IDL.Nat16;
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const BlockIndex = IDL.Nat64;
  const NFTPurchase = IDL.Record({
    'created' : Time,
    'token' : TokenIdentifierBlob__1,
    'marketplace' : IDL.Opt(
      IDL.Record({ 'share' : Share, 'address' : AccountIdentifier__1 })
    ),
    'seller' : AccountIdentifier__1,
    'author' : IDL.Record({
      'share' : Share,
      'address' : AccountIdentifier__1,
    }),
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
      'token' : TokenIdentifierBlob,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'socket' : IDL.Record({
      'created' : Timestamp,
      'socket' : TokenIdentifierBlob,
      'memo' : Memo,
      'plug' : TokenIdentifierBlob,
    }),
    'unsocket' : IDL.Record({
      'created' : Timestamp,
      'socket' : TokenIdentifierBlob,
      'memo' : Memo,
      'plug' : TokenIdentifierBlob,
    }),
    'burn' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifierBlob,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'mint' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifierBlob,
    }),
    'transaction' : IDL.Record({
      'to' : AccountIdentifier,
      'created' : Timestamp,
      'token' : TokenIdentifierBlob,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }),
    'approve' : IDL.Record({
      'created' : Timestamp,
      'token' : TokenIdentifierBlob,
      'user' : AccountIdentifier,
      'spender' : IDL.Principal,
    }),
    'purchase' : NFTPurchase,
  });
  const PwrEvent = IDL.Variant({ 'transaction' : EventFungibleTransaction });
  const TreasuryEvent = IDL.Record({});
  const EventInfo = IDL.Variant({
    'anv' : AnvEvent,
    'nft' : NftEvent,
    'pwr' : PwrEvent,
    'treasury' : TreasuryEvent,
  });
  const AddResponse = IDL.Vec(IDL.Nat8);
  const Config = IDL.Record({
    'anv' : IDL.Principal,
    'nft' : IDL.Vec(IDL.Principal),
    'pwr' : IDL.Principal,
    'slot' : IDL.Nat,
    'history' : IDL.Principal,
    'nft_avail' : IDL.Vec(IDL.Principal),
    'account' : IDL.Vec(IDL.Principal),
    'router' : IDL.Principal,
    'treasury' : IDL.Principal,
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
