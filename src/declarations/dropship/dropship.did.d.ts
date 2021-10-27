import type { Principal } from '@dfinity/principal';
export interface Router {
  'debug_reset' : () => Promise<undefined>,
  'fetchSetup' : () => Promise<
      { 'access' : string, 'acclist' : Array<string> }
    >,
  'getAvailable' : () => Promise<Principal>,
  'reportOutOfMemory' : () => Promise<undefined>,
}
export interface _SERVICE extends Router {}
