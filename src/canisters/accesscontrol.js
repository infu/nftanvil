import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "../declarations/accesscontrol/accesscontrol.did.js";
export { idlFactory } from "../declarations/accesscontrol/accesscontrol.did.js";

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.REACT_APP_ACCESSCONTROL_CANISTER_ID;

export const createActor = (canisterId, options) => {
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

export const access = {
  principal: canisterId,
};
access.setOptions = (options) => {
  let actor = createActor(canisterId, options);

  for (let key in actor) {
    access[key] = (...arg) => actor[key](...arg);
  }
};

access.setOptions();
