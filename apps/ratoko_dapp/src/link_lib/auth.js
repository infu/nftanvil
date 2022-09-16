import { AuthClient } from "@dfinity/auth-client";

let client = null;

const defaultOptions = { cookie: false };

const auth = {
  client,
  options: defaultOptions,
};

auth.setOptions = (opt) => {
  auth.options = { ...defaultOptions, ...opt };
};

auth.create = async () => {
  const storage = new MyStorage();
  auth.client = await AuthClient.create(auth.options.cookie ? {} : { storage });
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
