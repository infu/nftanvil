export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const CollectionId = IDL.Nat32;
  const AllowResponse = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Config = IDL.Record({
    'anv' : IDL.Principal,
    'nft' : IDL.Vec(IDL.Principal),
    'pwr' : IDL.Principal,
    'collection' : IDL.Principal,
    'slot' : IDL.Nat,
    'history' : IDL.Principal,
    'nft_avail' : IDL.Vec(IDL.Principal),
    'account' : IDL.Vec(IDL.Principal),
    'router' : IDL.Principal,
    'treasury' : IDL.Principal,
  });
  const CollectionIndex = IDL.Nat32;
  const ContentType = IDL.Text;
  const DomainName = IDL.Text;
  const ICPath = IDL.Text;
  const IPFS_CID = IDL.Text;
  const Renderer = IDL.Variant({
    'wasm' : IDL.Variant({ 'ic' : ICPath, 'ipfs' : IPFS_CID }),
    'canister' : IDL.Record({ 'contentType' : ContentType }),
  });
  const Collection = IDL.Record({
    'max' : CollectionIndex,
    'contentType' : ContentType,
    'domain' : IDL.Opt(DomainName),
    'authors' : IDL.Vec(AccountIdentifier),
    'renderer' : IDL.Opt(Renderer),
    'socketable' : IDL.Vec(CollectionId),
    'lastIdx' : CollectionIndex,
  });
  const CreateResponse = IDL.Variant({ 'ok' : CollectionId, 'err' : IDL.Text });
  const InfoResponse = IDL.Variant({
    'ok' : Collection,
    'err' : IDL.Variant({ 'NotFound' : IDL.Null }),
  });
  const MintNextIdResponse = IDL.Variant({
    'ok' : CollectionIndex,
    'err' : IDL.Text,
  });
  const TokenIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const SocketRequest = IDL.Record({
    'socket' : TokenIdentifier,
    'plug' : TokenIdentifier,
    'user' : User,
    'subaccount' : IDL.Opt(SubAccount),
  });
  const Class = IDL.Service({
    'author_allow' : IDL.Func(
        [AccountIdentifier, CollectionId],
        [AllowResponse],
        ['query'],
      ),
    'config_set' : IDL.Func([Config], [], []),
    'create' : IDL.Func([Collection], [CreateResponse], []),
    'info' : IDL.Func([CollectionId], [InfoResponse], ['query']),
    'mint_nextId' : IDL.Func(
        [AccountIdentifier, CollectionId],
        [MintNextIdResponse],
        [],
      ),
    'socket_allow' : IDL.Func(
        [SocketRequest, CollectionId],
        [AllowResponse],
        ['query'],
      ),
  });
  return Class;
};
export const init = ({ IDL }) => { return []; };
