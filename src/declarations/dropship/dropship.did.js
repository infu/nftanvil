export const idlFactory = ({ IDL }) => {
  const Router = IDL.Service({
    'debug_reset' : IDL.Func([], [], []),
    'getAvailable' : IDL.Func([], [IDL.Principal], ['query']),
    'getCanisters' : IDL.Func(
        [],
        [IDL.Record({ 'nft' : IDL.Vec(IDL.Text) })],
        ['query'],
      ),
    'init' : IDL.Func([], [], []),
    'reportOutOfMemory' : IDL.Func([], [], []),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
