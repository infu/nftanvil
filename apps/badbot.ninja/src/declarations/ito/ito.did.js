export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Nat64;
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Basket = IDL.Vec(IDL.Opt(TokenIdentifier));
  const Result_4 = IDL.Variant({ 'ok' : Basket, 'err' : IDL.Text });
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
  const Class = IDL.Service({
    'add' : IDL.Func([TokenIdentifier], [Result_3], []),
    'airdrop_add' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_3], []),
    'airdrop_use' : IDL.Func(
        [AccountIdentifier, IDL.Vec(IDL.Nat8)],
        [Result_4],
        [],
      ),
    'buy_tx' : IDL.Func([TransactionId, IDL.Opt(SubAccount)], [Result_4], []),
    'claim' : IDL.Func(
        [AccountIdentifier, IDL.Opt(SubAccount), TokenIdentifier],
        [Result_3],
        [],
      ),
    'icp_balance' : IDL.Func([], [Result_2], []),
    'icp_transfer' : IDL.Func([AccountIdentifier, Balance], [Result_1], []),
    'owned' : IDL.Func([AccountIdentifier], [Result], ['query']),
    'set_admin' : IDL.Func([IDL.Principal], [], ['oneway']),
    'set_anvil_config' : IDL.Func([Config], [], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'added' : IDL.Nat,
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
