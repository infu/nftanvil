export const idlFactory = ({ IDL }) => {
  const TransactionId = IDL.Vec(IDL.Nat8);
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
  const EventInfo = IDL.Variant({
    'anv' : AnvEvent,
    'nft' : NftEvent,
    'pwr' : PwrEvent,
  });
  const Transaction = IDL.Record({
    'hash' : IDL.Vec(IDL.Nat8),
    'info' : EventInfo,
  });
  const Class = IDL.Service({
    'check_tx' : IDL.Func([TransactionId], [IDL.Opt(Transaction)], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
