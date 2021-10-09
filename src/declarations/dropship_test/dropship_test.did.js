export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'test' : IDL.Func([], [IDL.Text], []) });
};
export const init = ({ IDL }) => { return []; };
