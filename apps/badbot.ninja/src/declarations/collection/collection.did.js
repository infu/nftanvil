export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TransactionId = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const Result_2 = IDL.Variant({ 'ok' : Balance, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  const AccountRecordSerialized = IDL.Record({
    'tokens' : IDL.Vec(TokenIdentifier),
  });
  const Result = IDL.Variant({
    'ok' : AccountRecordSerialized,
    'err' : IDL.Text,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([TokenIdentifier], [Result_3], []),
    'airdrop_add' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_3], []),
    'airdrop_use' : IDL.Func(
        [AccountIdentifier, IDL.Vec(IDL.Nat8)],
        [Result_3],
        [],
      ),
    'buy_tx' : IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result_3], []),
    'claim' : IDL.Func(
        [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
        [Result_3],
        [],
      ),
    'icp_balance' : IDL.Func([], [Result_2], []),
    'icp_transfer' : IDL.Func([AccountIdentifier, Balance], [Result_1], []),
    'owned' : IDL.Func([AccountIdentifier], [Result], ['query']),
    'set_admin' : IDL.Func([IDL.Principal], [], ['oneway']),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'available' : IDL.Nat,
            'airdrop' : IDL.Nat,
            'purchase' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
