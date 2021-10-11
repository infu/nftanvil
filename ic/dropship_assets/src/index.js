import { dropship, createActor } from "../../declarations/dropship";

import {principalToAccountIdentifier, encodeTokenId} from "./accountIdentifier";


import { AuthClient } from "@dfinity/auth-client";
let actor;

document.getElementById("auth").addEventListener('click', async () => {

  var authClient;
    await new Promise(async (resolve, reject) => {

      authClient = await AuthClient.create();
      authClient.login({
         identityProvider: "http://localhost:8000?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai",
        onSuccess: async (e) => {
          // authClient now has an identity
          console.log("Success")
 
          resolve()
        },
        onError: reject
      })
  })

  const identity = await authClient.getIdentity();
  let principal = identity.getPrincipal().toString();
  console.log("principal: ", principal);
  let accountId = principalToAccountIdentifier(principal);
  console.log("accountId: ", accountId);

  let owned = await dropship.owned({"address": accountId});
  console.log("Owned: ", owned)
  // console.log("n0: " + principalToAccountIdentifier("wo5qg-ysjiq-5da"));
  // console.log("n2: " + principalToAccountIdentifier("wo5qg-ysjiq-5da",1234));
  // Fetch root key for certificate validation during development
  console.log("DROPSHIP CANISTER ID "+process.env.DROPSHIP_CANISTER_ID);

  let dropshipCid = process.env.DROPSHIP_CANISTER_ID;

  let a1 = await dropship.whoAmI();
  actor = createActor(process.env.DROPSHIP_CANISTER_ID, {agentOptions:{identity}});
  let a2 = await actor.whoAmI();
  console.log("a1",a1.toString());
  console.log("a2",a2.toString());

  let tokenId = encodeTokenId(dropshipCid,15);
  console.log("Token id: "+tokenId)
})


document.getElementById("clickMeBtn").addEventListener("click", async () => {
  console.log(await actor.getPrincipal().toString());

  //   // dropship.mintNFT({to:my_user, metadata:"ewrwer",minter:minter_one, TTL:1000})



});


