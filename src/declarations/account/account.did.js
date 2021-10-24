export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const TokenIndex = IDL.Nat32;
  const Account = IDL.Service({
    'add' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'addAllowed' : IDL.Func([IDL.Principal], [], []),
    'list' : IDL.Func([AccountIdentifier], [IDL.Vec(TokenIndex)], []),
    'rem' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'setup' : IDL.Func([IDL.Record({ 'slot' : IDL.Nat32 })], [], []),
  });
  return Account;
};
export const init = ({ IDL }) => { return []; };
