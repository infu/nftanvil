import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./declarations/pwr/pwr.did.js";
export { idlFactory } from "./declarations/pwr/pwr.did.js";

export const pwrCanister = (canisterId, options) => {
  const agent = new HttpAgent({ ...(options ? options.agentOptions : {}) });

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
    canisterId: canisterId.toText ? canisterId.toText() : canisterId,
    ...(options ? options.actorOptions : {}),
  });
};
