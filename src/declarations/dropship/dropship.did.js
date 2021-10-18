export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const URL = IDL.Text;
  const Media = IDL.Variant({ 'img' : URL, 'video' : URL });
  const ItemClassId = IDL.Nat;
  const MintRequest = IDL.Record({
    'to' : User,
    'media' : IDL.Opt(Media),
    'thumb' : IDL.Opt(URL),
    'classId' : ItemClassId,
  });
  const TokenIndex = IDL.Nat32;
  const MintResponse = IDL.Variant({
    'ok' : TokenIndex,
    'err' : IDL.Variant({ 'Rejected' : IDL.Null, 'OutOfMemory' : IDL.Null }),
  });
  const Router = IDL.Service({
    'debug_reset' : IDL.Func([], [], []),
    'getCanisters' : IDL.Func(
        [],
        [IDL.Record({ 'nft' : IDL.Vec(IDL.Principal) })],
        ['query'],
      ),
    'mintNFT' : IDL.Func([MintRequest], [MintResponse], []),
  });
  return Router;
};
export const init = ({ IDL }) => { return []; };
