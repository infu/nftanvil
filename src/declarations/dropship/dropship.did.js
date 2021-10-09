export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const Request = IDL.Record({
    'token' : TokenIdentifier,
    'owner' : User,
    'spender' : IDL.Principal,
  });
  const Balance = IDL.Nat;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Response = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ApproveRequest = IDL.Record({
    'token' : TokenIdentifier,
    'subaccount' : IDL.Opt(SubAccount),
    'allowance' : Balance,
    'spender' : IDL.Principal,
  });
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const BalanceResponse = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const BearerResponse = IDL.Variant({
    'ok' : AccountIdentifier,
    'err' : CommonError,
  });
  const Extension = IDL.Text;
  const Metadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const MetadataResponse = IDL.Variant({
    'ok' : Metadata,
    'err' : CommonError,
  });
  const MintRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TokenIndex = IDL.Nat32;
  const MintResponse = IDL.Variant({ 'ok' : TokenIndex, 'err' : CommonError });
  const SupplyResponse = IDL.Variant({ 'ok' : Balance, 'err' : CommonError });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const Token = IDL.Service({
    'allowance' : IDL.Func([Request], [Response], ['query']),
    'approve' : IDL.Func([ApproveRequest], [], []),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier], [BearerResponse], ['query']),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'metadata' : IDL.Func([TokenIdentifier], [MetadataResponse], ['query']),
    'mintNFT' : IDL.Func([MintRequest], [MintResponse], []),
    'supply' : IDL.Func([TokenIdentifier], [SupplyResponse], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return Token;
};
export const init = ({ IDL }) => { return []; };
