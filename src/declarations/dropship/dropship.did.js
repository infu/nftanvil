export const idlFactory = ({ IDL }) => {
  const Router = IDL.Service({
    'debug_reset' : IDL.Func([], [], []),
    'fetchSetup' : IDL.Func(
        [],
        [IDL.Record({ 'access' : IDL.Text, 'acclist' : IDL.Vec(IDL.Text) })],
        ['query'],
      ),
    'getAvailable' : IDL.Func([], [IDL.Principal], ['query']),
    'reportOutOfMemory' : IDL.Func([], [], []),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
