export const idlFactory = ({ IDL }) => {
  const RecordId = IDL.Vec(IDL.Nat8);
  const Time = IDL.Int;
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TokenIdentifier = IDL.Text;
  const Memo = IDL.Nat64;
  const Balance = IDL.Nat64;
  const RecordFungibleTransaction = IDL.Record({
    'to' : AccountIdentifier,
    'token' : TokenIdentifier,
    'from' : AccountIdentifier,
    'memo' : Memo,
    'amount' : Balance,
  });
  const AnvRecord = IDL.Variant({ 'transaction' : RecordFungibleTransaction });
  const CustomId = IDL.Text;
  const Cooldown = IDL.Nat32;
  const ItemUse = IDL.Variant({
    'consumable' : IDL.Record({ 'useId' : CustomId }),
    'cooldown' : IDL.Record({ 'duration' : Cooldown, 'useId' : CustomId }),
  });
  const CollectionId = IDL.Nat32;
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
  const NftRecord = IDL.Variant({
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
      'amount' : Balance,
    }),
    'mint' : IDL.Record({
      'token' : TokenIdentifier,
      'collectionId' : CollectionId,
    }),
    'transaction' : IDL.Record({
      'to' : AccountIdentifier,
      'token' : TokenIdentifier,
      'from' : AccountIdentifier,
      'memo' : Memo,
    }),
    'purchase' : NFTPurchase,
  });
  const PwrRecord = IDL.Variant({ 'transaction' : RecordFungibleTransaction });
  const TreasuryRecord = IDL.Record({});
  const RecordInfo = IDL.Variant({
    'anv' : AnvRecord,
    'nft' : NftRecord,
    'pwr' : PwrRecord,
    'treasury' : TreasuryRecord,
  });
  const Record = IDL.Record({
    'id' : RecordId,
    'created' : Time,
    'info' : RecordInfo,
  });
  const AddRequest = IDL.Record({ 'record' : Record });
  const AddResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Record({}) });
  const Config = IDL.Record({
    'anv' : IDL.Principal,
    'nft' : IDL.Vec(IDL.Principal),
    'pwr' : IDL.Principal,
    'collection' : IDL.Principal,
    'slot' : IDL.Nat,
    'history' : IDL.Principal,
    'nft_avail' : IDL.Vec(IDL.Principal),
    'account' : IDL.Vec(IDL.Principal),
    'router' : IDL.Principal,
    'treasury' : IDL.Principal,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([AddRequest], [AddResponse], []),
    'config_set' : IDL.Func([Config], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
