const auth = {
  identities: {},
};

auth.setIdentity = (address, identity) => {
  auth.identities[address] = identity;
};

auth.getAgentOptions = (address) => {
  let identity = address ? auth.identities[address] : false;

  return {
    identity: identity,
    host: process.env.REACT_APP_IC_GATEWAY || "https://ic0.app",
  };
};

export { auth as default };
