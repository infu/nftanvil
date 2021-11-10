import { easyMint, routerCanister } from "@vvv-interactive/nftanvil";

const main = async () => {
  let { principal, address } = await routerCanister();
  console.log("Script address ", address);
  console.log("Script principal ", principal.toText());

  let myaddress =
    "9753428aee3376d3738ef8e94767608f37c8ae675c38acb80884f09efaa99b32";

  // Currently agent-js candid implementation doesn't supply the user with very informative errors,
  // so a creating correct metadata record will be hard. Add one change at a time and test.
  let metadata = {
    name: ["Excalibur"],
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
      internal: { contentType: "image/jpeg", path: "./some.jpg" },
    },
    secret: false,
    extensionCanister: [],
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
