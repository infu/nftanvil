import type { Principal } from '@dfinity/principal';
export interface Router {
  'debug_reset' : () => Promise<undefined>,
  'fetchAcclist' : () => Promise<Array<string>>,
  'getAvailable' : () => Promise<Principal>,
  'reportOutOfMemory' : () => Promise<undefined>,
}
export interface _SERVICE extends Router {}
