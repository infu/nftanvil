import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./declarations/ledger/ledger.did.js";
export { idlFactory } from "./declarations/ledger/ledger.did.js";

export const canisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai"; //process.env.NFT_CANISTER_ID;

export const ledgerCanister = (options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

export const ledger = ledgerCanister(canisterId);
