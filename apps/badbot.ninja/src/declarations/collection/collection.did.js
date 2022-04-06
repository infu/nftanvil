export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const TransactionId = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const AccountRecordSerialized = IDL.Record({
    'tokens' : IDL.Vec(TokenIdentifier),
  });
  const Result = IDL.Variant({
    'ok' : AccountRecordSerialized,
    'err' : IDL.Text,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([TokenIdentifier], [], []),
    'buy_tx' : IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result_1], []),
    'claim' : IDL.Func(
        [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
        [Result_1],
        [],
      ),
    'owned' : IDL.Func([AccountIdentifier], [Result], ['query']),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
