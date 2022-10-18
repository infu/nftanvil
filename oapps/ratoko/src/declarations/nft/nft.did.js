export const idlFactory = ({ IDL }) => {
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const Request = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const Token = IDL.Record({
    'key' : IDL.Text,
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const CallbackFunc = IDL.Func([], [], []);
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({ 'token' : Token, 'callback' : CallbackFunc }),
  });
  const Response = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const Callback = IDL.Record({
    'token' : IDL.Opt(Token),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const Renderer = IDL.Service({
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'http_request_streaming_callback' : IDL.Func(
        [Token],
        [Callback],
        ['query'],
      ),
    'set' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [], []),
  });
  return Renderer;
};
export const init = ({ IDL }) => { return []; };
