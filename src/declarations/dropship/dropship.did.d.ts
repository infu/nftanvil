import type { Principal } from '@dfinity/principal';
export interface Router {
  'debug_reset' : () => Promise<undefined>,
  'getAvailable' : () => Promise<Principal>,
  'getCanisters' : () => Promise<{ 'nft' : Array<string> }>,
  'init' : () => Promise<undefined>,
  'reportOutOfMemory' : () => Promise<undefined>,
}
export interface _SERVICE extends Router {}
