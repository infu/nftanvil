import {
  Principal,
  routerConnect,
  nftCanister,
  encodeTokenId,
} from "@vvv-interactive/nftanvil";

const main = async () => {
  let { principal, address, router } = await routerConnect();

  console.log("Principal: ", principal.toText());
  console.log("Address: ", address);

  let nft = nftCanister(await router.getAvailable());

  let metadata = {
    name: ["Excalibur"],
    lore: [],
    use: [],
    transfer: { unrestricted: null },
    hold: [],
    quality: 1,
    ttl: [],
    attributes: [],
    content: [],
    thumb: { external: { idx: 1, contentType: "image/jpeg" } },
    secret: false,
    extensionCanister: [Principal.fromText("aaaaa-aa")],
  };

  try {
    let s = await nft.mintNFT({ to: { address }, metadata });
    if (s.ok) {
      let tid = encodeTokenId(nftcan.toText(), s.ok);
      console.log("Minted Token Id: ", tid);
    } else {
      console.log(s);
    }
  } catch (e) {
    console.log("Error minting: ", e.message);
  }
};

main();
