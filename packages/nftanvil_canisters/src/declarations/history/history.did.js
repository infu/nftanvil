export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TokenIdentifier = IDL.Text;
  const Memo = IDL.Nat64;
  const Balance = IDL.Nat64;
  const EventFungibleTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'token' : TokenIdentifier,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const AnvEvent = IDL.Variant({ 'transaction' : EventFungibleTransaction });
  const CustomId = IDL.Text;
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consumable' : IDL.Record({ 'useId' : CustomId }),
    'cooldown' : IDL.Record({ 'duration' : Cooldown, 'useId' : CustomId }),
  });
  const TokenIdentifier__1 = IDL.Text;
  const Share = IDL.Nat16;
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const BlockIndex = IDL.Nat64;
  const NFTPurchase = IDL.Record({
    'token' : TokenIdentifier__1,
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
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'socket' : IDL.Record({
      'socket' : TokenIdentifier,
      'plug' : TokenIdentifier,
    }),
    'unsocket' : IDL.Record({
      'socket' : TokenIdentifier,
      'plug' : TokenIdentifier,
    }),
    'burn' : IDL.Record({
      'token' : TokenIdentifier,
      'memo' : Memo,
      'user' : AccountIdentifier,
    }),
    'mint' : IDL.Record({ 'token' : TokenIdentifier }),
    'transaction' : IDL.Record({
      'to' : AccountIdentifier,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
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
  const Event = IDL.Record({ 'created' : Time, 'info' : EventInfo });
  const AddResponse = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({ 'NotLegitimateCaller' : IDL.Null }),
  });
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
  const ListResponse = IDL.Vec(IDL.Opt(Event));
  const Class = IDL.Service({
    'add' : IDL.Func([Event], [AddResponse], []),
    'config_set' : IDL.Func([Config], [], []),
    'info' : IDL.Func([], [InfoResponse], ['query']),
    'list' : IDL.Func([ListRequest], [ListResponse], ['query']),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
