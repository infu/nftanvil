import type { Principal } from '@dfinity/principal';
export interface Router {
  'debug_reset' : () => Promise<undefined>,
  'getAvailable' : () => Promise<Principal>,
  'reportOutOfMemory' : () => Promise<undefined>,
}
export interface _SERVICE extends Router {}
