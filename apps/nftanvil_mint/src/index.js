import { easyMint, routerCanister } from "@vvv-interactive/nftanvil";

const main = async () => {
  let { principal, address } = await routerCanister();
  console.log("Script address ", address);
  console.log("Script principal ", principal.toText());

  let myaddress =
    "D1B158C1E1B8376761295F759F8907E29E10AAF6F556D7F90BE2C580A2E42DA1";

  // Currently agent-js candid implementation doesn't supply the user with very informative errors,
  // so a creating correct metadata record will be hard. Add one change at a time and test.
  let metadata = {
    name: ["Excalibur IPFS"],
    domain: [],
    lore: [],
    use: [],
    transfer: { unrestricted: null },
    hold: [],
    quality: 1,
    ttl: [],
    attributes: [],
    content: [],
    thumb: {
      ipfs: { contentType: "image/jpeg", path: "./some.jpg" },
    },
    secret: false,
    extensionCanister: [],
    custom: [],
    tags: [],
  };

  try {
    let resp = await easyMint([
      {
        to: { address: myaddress },
        metadata,
      },
    ]);
    console.log("resp", resp);
  } catch (e) {
    console.log(e);
  }
};

main();
