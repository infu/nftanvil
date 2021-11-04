import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./declarations/router/router.did.js";
export { idlFactory } from "./declarations/router/router.did.js";

// CANISTER_ID is replaced by webpack based on node environment
export const routerCanister = (canisterId, options) => {
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
  let actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: canisterId.toText ? canisterId.toText() : canisterId,
    ...options?.actorOptions,
  });
  return { router: actor, agent };
};

export const router = {};

router.setOptions = (canisterId, options) => {
  let x = routerCanister(canisterId, options);

  for (let key in x.router) {
    router[key] = (...arg) => x.router[key](...arg);
  }
};
