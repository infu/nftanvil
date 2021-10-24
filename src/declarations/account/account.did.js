export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const TokenIndex = IDL.Nat32;
  const TokenIdentifier = IDL.Text;
  const Account = IDL.Service({
    'add' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
    'addAllowed' : IDL.Func([IDL.Principal, IDL.Nat32], [], []),
    'list' : IDL.Func(
        [AccountIdentifier, IDL.Nat],
        [IDL.Vec(TokenIdentifier)],
        [],
      ),
    'rem' : IDL.Func([AccountIdentifier, TokenIndex], [], []),
  });
  return Account;
};
export const init = ({ IDL }) => { return []; };
