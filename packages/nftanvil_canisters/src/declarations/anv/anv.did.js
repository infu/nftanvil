export const idlFactory = ({ IDL }) => {
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier__1,
  });
  const TransactionAmount = IDL.Nat64;
  const BlockIndex = IDL.Nat32;
  const TransactionFrom = IDL.Vec(IDL.Nat8);
  const TransactionTo = IDL.Vec(IDL.Nat8);
  const BlockTimestamp = IDL.Int;
  const BlockHash = IDL.Vec(IDL.Nat8);
  const Block = IDL.Tuple(
    TransactionFrom,
    TransactionTo,
    TransactionAmount,
    BlockTimestamp,
    BlockHash,
  );
  const TokenIdentifier__1 = IDL.Text;
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier__1,
    'user' : User,
  });
  const Balance__1 = IDL.Nat64;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier__1,
    'Other' : IDL.Text,
  });
  const BalanceResponse = IDL.Variant({
    'ok' : Balance__1,
    'err' : CommonError,
  });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const TokenIdentifier = IDL.Text;
  const ANV = IDL.Service({
    'adminAllocate' : IDL.Func(
        [IDL.Record({ 'user' : User, 'amount' : TransactionAmount })],
        [BlockIndex, Block],
        [],
      ),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'dumpBalances' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(AccountIdentifier, Balance))],
        ['query'],
      ),
    'dumpBlockchain' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(BlockIndex, Block))],
        ['query'],
      ),
    'tokenId' : IDL.Func([], [TokenIdentifier], ['query']),
  });
  return ANV;
};
export const init = ({ IDL }) => { return []; };
