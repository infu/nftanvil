import path from "path";
import dfidentity from "@dfinity/identity";
import fs from "fs";
import getRandomValues from "get-random-values";

const newIdentity = () => {
  const entropy = getRandomValues(new Uint8Array(32));
  const identity = dfidentity.Ed25519KeyIdentity.generate(entropy);
  return identity;
};

export const fileIdentity = () => {
  let identity;

  try {
    const identityJson = JSON.parse(
      fs.readFileSync(path.resolve("identity.json"))
    );
    identity = dfidentity.Ed25519KeyIdentity.fromParsedJson(identityJson);

    return identity;
  } catch (e) {
    console.log("Creating new identity and saving it in identity.json");
    identity = newIdentity();

    fs.writeFileSync("./identity.json", JSON.stringify(identity));

    return identity;
  }
};
