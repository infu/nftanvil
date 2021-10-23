export const idlFactory = ({ IDL }) => {
  const Router = IDL.Service({
    'debug_reset' : IDL.Func([], [], []),
    'getAvailable' : IDL.Func([], [IDL.Principal], ['query']),
    'reportOutOfMemory' : IDL.Func([], [], []),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
