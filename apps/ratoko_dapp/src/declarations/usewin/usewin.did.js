export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const TokenIdentifier = IDL.Nat64;
  const Result_4 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Balance = IDL.Nat64;
  const Result_3 = IDL.Variant({ 'ok' : Balance, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  const AccountRecordSerialized = IDL.Record({
    'tokens' : IDL.Vec(TokenIdentifier),
  });
  const Result_1 = IDL.Variant({
    'ok' : AccountRecordSerialized,
    'err' : IDL.Text,
  });
  const TransactionId = IDL.Vec(IDL.Nat8);
  const Basket = IDL.Vec(IDL.Opt(TokenIdentifier));
  const Result = IDL.Variant({ 'ok' : Basket, 'err' : IDL.Text });
  const Class = IDL.Service({
    'claim' : IDL.Func(
        [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
        [Result_4],
        [],
      ),
    'get_script_address' : IDL.Func([], [IDL.Text], ['query']),
    'icp_balance' : IDL.Func([], [Result_3], []),
    'icp_transfer' : IDL.Func([AccountIdentifier, Balance], [Result_2], []),
    'init_inventory' : IDL.Func([IDL.Nat], [], []),
    'init_random' : IDL.Func([], [], []),
    'owned' : IDL.Func([AccountIdentifier], [Result_1], ['query']),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'added' : IDL.Nat,
            'available' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'use_tx' : IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
