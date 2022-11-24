export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat64;
  const FTokenId = IDL.Nat64;
  const AddLiquidityRequest = IDL.Record({
    'aid' : AccountIdentifier,
    'token_two_amount' : Balance,
    'token_one_amount' : Balance,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const AddLiquidityResponse = IDL.Variant({
    'ok' : IDL.Float64,
    'err' : IDL.Text,
  });
  const BalanceLiquidityRequest = IDL.Record({
    'aid' : AccountIdentifier,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const BalanceLiquidityResponse = IDL.Variant({
    'ok' : IDL.Float64,
    'err' : IDL.Text,
  });
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
  const CreatePoolRequest = IDL.Record({
    'token_two_decimals' : IDL.Nat8,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
    'token_one_decimals' : IDL.Nat8,
  });
  const CreatePoolResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const PoolsRequest = IDL.Record({ 'aid' : AccountIdentifier });
  const LPKey = IDL.Tuple(IDL.Nat64, IDL.Nat64);
  const PoolPublic = IDL.Record({
    'id' : LPKey,
    'total' : IDL.Float64,
    'token_two_decimals' : IDL.Nat8,
    'balance' : IDL.Float64,
    'reserve_one' : IDL.Nat64,
    'reserve_two' : IDL.Nat64,
    'token_one_decimals' : IDL.Nat8,
  });
  const PoolsResponse = IDL.Vec(PoolPublic);
  const Oracle = IDL.Record({
    'icpFee' : IDL.Nat64,
    'anvFee' : IDL.Nat64,
    'icpCycles' : IDL.Nat64,
    'pwrFee' : IDL.Nat64,
  });
  const RemLiquidityRequest = IDL.Record({
    'aid' : AccountIdentifier,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
  });
  const RemLiquidityResponse = IDL.Variant({
    'ok' : IDL.Record({ 'one' : Balance, 'two' : Balance }),
    'err' : IDL.Text,
  });
  const SwapRequest = IDL.Record({
    'reverse' : IDL.Bool,
    'amount_required' : Balance,
    'token_one' : FTokenId,
    'token_two' : FTokenId,
    'amount' : Balance,
  });
  const SwapResponse = IDL.Variant({
    'ok' : IDL.Record({ 'recieve' : IDL.Nat64, 'refund' : IDL.Nat64 }),
    'err' : IDL.Text,
  });
  const Class = IDL.Service({
    'add_liquidity' : IDL.Func(
        [AddLiquidityRequest],
        [AddLiquidityResponse],
        [],
      ),
    'balance_liquidity' : IDL.Func(
        [BalanceLiquidityRequest],
        [BalanceLiquidityResponse],
        ['query'],
      ),
    'config_set' : IDL.Func([Config], [], []),
    'create_pool' : IDL.Func([CreatePoolRequest], [CreatePoolResponse], []),
    'get_pools' : IDL.Func([PoolsRequest], [PoolsResponse], ['query']),
    'oracle_set' : IDL.Func([Oracle], [], []),
    'rem_liquidity' : IDL.Func(
        [RemLiquidityRequest],
        [RemLiquidityResponse],
        [],
      ),
    'swap' : IDL.Func([SwapRequest], [SwapResponse], []),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
