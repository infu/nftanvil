const path = require("path");
const dfidentity = require("@dfinity/identity");
const fs = require("fs");
const getRandomValues = require("get-random-values");

const newIdentity = () => {
  const entropy = getRandomValues(new Uint8Array(32));
  const identity = dfidentity.Ed25519KeyIdentity.generate(entropy);
  return identity;
};

export const fileIdentity = () => {
  let identity;

  try {
    const identityJson = require(path.resolve("identity.json"));
    identity = dfidentity.Ed25519KeyIdentity.fromParsedJson(identityJson);
    return identity;
  } catch (e) {
    console.log("Creating new identity and saving it in identity.json");
    identity = newIdentity();

    fs.writeFileSync("./identity.json", JSON.stringify(identity));

    return identity;
  }
};
