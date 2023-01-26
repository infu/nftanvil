export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const TokenIndex = IDL.Nat16;
  const TransactionId = IDL.Vec(IDL.Nat8);
  const CanisterSlot = IDL.Nat64;
  const CanisterRange = IDL.Tuple(CanisterSlot, CanisterSlot);
  const Config = IDL.Record({
    'nft' : CanisterRange,
    'pwr' : CanisterRange,
    'anvil' : CanisterSlot,
    'tokenregistry' : CanisterSlot,
    'history' : CanisterSlot,
    'nft_avail' : IDL.Vec(CanisterSlot),
    'space' : IDL.Vec(IDL.Vec(IDL.Nat64)),
    'account' : CanisterRange,
    'history_range' : CanisterRange,
    'router' : IDL.Principal,
    'treasury' : CanisterSlot,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const CFT = IDL.Record({ 'id' : IDL.Nat64, 'balance' : Balance });
  const CNFT = IDL.Record({ 'id' : IDL.Nat64 });
  const ContainerToken = IDL.Variant({ 'ft' : CFT, 'nft' : CNFT });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const Result_2 = IDL.Variant({
    'ok' : IDL.Record({
      'containerId' : IDL.Nat,
      'c_aid' : AccountIdentifier__1,
    }),
    'err' : IDL.Text,
  });
  const ContainerId = IDL.Nat;
  const ContainerPublic = IDL.Record({
    'unlocked' : IDL.Bool,
    'tokens' : IDL.Vec(ContainerToken),
    'verifications' : IDL.Vec(IDL.Bool),
    'requirements' : IDL.Vec(ContainerToken),
  });
  const Result_1 = IDL.Variant({ 'ok' : ContainerPublic, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TokenIdentifier__1 = IDL.Nat64;
  const TokenIdentifier = IDL.Nat64;
  const AddressInfo = IDL.Record({
    'background' : TokenIdentifier,
    'name' : IDL.Text,
    'avatar' : TokenIdentifier,
  });
  const AccountMeta = IDL.Record({
    'info' : IDL.Opt(AddressInfo),
    'transactions' : IDL.Vec(TransactionId),
  });
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const Class = IDL.Service({
    'add' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'add_transaction' : IDL.Func([AccountIdentifier, TransactionId], [], []),
    'config_set' : IDL.Func([Config], [], []),
    'container_create' : IDL.Func(
        [IDL.Opt(SubAccount), IDL.Vec(ContainerToken), IDL.Vec(ContainerToken)],
        [Result_2],
        [],
      ),
    'container_info' : IDL.Func(
        [AccountIdentifier__1, ContainerId],
        [Result_1],
        ['query'],
      ),
    'container_list' : IDL.Func(
        [IDL.Opt(SubAccount)],
        [IDL.Vec(IDL.Tuple(ContainerId, ContainerPublic))],
        [],
      ),
    'container_swap' : IDL.Func(
        [IDL.Opt(SubAccount), ContainerId, ContainerId, AccountIdentifier__1],
        [Result],
        [],
      ),
    'container_unlock' : IDL.Func(
        [AccountIdentifier__1, ContainerId],
        [Result],
        [],
      ),
    'container_verify' : IDL.Func(
        [IDL.Opt(SubAccount), ContainerId, IDL.Nat],
        [Result],
        [],
      ),
    'list' : IDL.Func(
        [AccountIdentifier, IDL.Nat, IDL.Nat],
        [IDL.Vec(TokenIdentifier__1)],
        ['query'],
      ),
    'meta' : IDL.Func([AccountIdentifier], [IDL.Opt(AccountMeta)], ['query']),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'rem' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'stats' : IDL.Func(
        [],
        [
          IDL.Record({
            'cycles_recieved' : IDL.Nat,
            'total_accounts' : IDL.Nat,
            'rts_max_live_size' : IDL.Nat,
            'cycles' : IDL.Nat,
            'rts_memory_size' : IDL.Nat,
            'rts_total_allocation' : IDL.Nat,
            'rts_heap_size' : IDL.Nat,
            'rts_reclaimed' : IDL.Nat,
            'rts_version' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
