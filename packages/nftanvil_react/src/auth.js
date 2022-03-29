import { AuthClient } from "@dfinity/auth-client";

let client = null;

const auth = {
  client,
};

auth.create = async () => {
  auth.client = await AuthClient.create();
};

auth.getAgentOptions = () => {
  let identity = auth.client.getIdentity();

  return {
    identity,
    host: process.env.REACT_APP_IC_GATEWAY || "https://ic0.app",
  };
};

export { auth as default };
