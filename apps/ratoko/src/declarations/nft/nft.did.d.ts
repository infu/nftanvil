import type { Principal } from '@dfinity/principal';
export interface Callback { 'token' : [] | [Token], 'body' : Array<number> }
export type CallbackFunc = () => Promise<undefined>;
export type HeaderField = [string, string];
export interface Renderer {
  'http_request' : (arg_0: Request) => Promise<Response>,
  'http_request_streaming_callback' : (arg_0: Token) => Promise<Callback>,
  'set' : (arg_0: bigint, arg_1: bigint, arg_2: string) => Promise<undefined>,
}
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface Response {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type StreamingStrategy = {
    'Callback' : { 'token' : Token, 'callback' : CallbackFunc }
  };
export interface Token {
  'key' : string,
  'sha256' : [] | [Array<number>],
  'index' : bigint,
  'content_encoding' : string,
}
export interface _SERVICE extends Renderer {}
