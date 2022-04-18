import { AuthClient } from "@dfinity/auth-client";

let client = null;

const auth = {
  client,
};

auth.create = async () => {
  const storage = new MyStorage();
  auth.client = await AuthClient.create({ storage });
};

auth.getAgentOptions = () => {
  let identity = auth.client.getIdentity();

  return {
    identity,
    host: process.env.REACT_APP_IC_GATEWAY || "https://ic0.app",
  };
};

//

class MyStorage {
  constructor() {
    this.my = {};
  }

  async get(key) {
    return this.my[key];
  }

  async set(key, value) {
    this.my[key] = value;
  }

  async remove(key) {
    delete this.my[key];
  }
}

export { auth as default };
