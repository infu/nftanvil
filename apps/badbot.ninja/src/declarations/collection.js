import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./collection/collection.did.js";
export { idlFactory } from "./collection/collection.did.js";
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.REACT_APP_COLLECTION_CANISTER_ID;
console.log("REACT_APP_COLLECTION_CANISTER_ID", canisterId);
/**
 *
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./collection.did.js")._SERVICE>}
 */
export const createCollectionActor = (options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  // // Fetch root key for certificate validation during development
  // if (process.env.NODE_ENV !== "production") {
  //   agent.fetchRootKey().catch((err) => {
  //     console.warn(
  //       "Unable to fetch root key. Check to ensure that your local replica is running"
  //     );
  //     console.error(err);
  //   });
  // }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};
