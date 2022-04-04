export const idlFactory = ({ IDL }) => {
  const TransactionId = IDL.Vec(IDL.Nat8);
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Class = IDL.Service({
    'check_tx' : IDL.Func([TransactionId], [Result], []),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
