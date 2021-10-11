import logo from './logo.svg';
import './App.css';
import { AuthClient } from "@dfinity/auth-client";
import { dropship, createActor } from "./canisters/dropship";
import {principalToAccountIdentifier, encodeTokenId} from "./purefunc/token";

import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment, dincr } from './reducers/user'

const onAuthenticate = async () => {

     let authClient = await new Promise(async (resolve, reject) => {

        let client = await AuthClient.create();
        client.login({
          identityProvider: "http://localhost:8000?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai",
          onSuccess: async (e) => {
            // authClient now has an identity
            console.log("Success")

            resolve(client)
          },
          onError: reject
        })
    });


    const identity = await authClient.getIdentity();
    let principal = identity.getPrincipal().toString();
    console.log("principal: ", principal);
    let accountId = principalToAccountIdentifier(principal);
    console.log("accountId: ", accountId);

    let owned = await dropship.owned({"address": accountId});
    console.log("Owned: ", owned)

    console.log("DROPSHIP CANISTER ID "+process.env.REACT_APP_DROPSHIP_CANISTER_ID);

    let dropshipCid = process.env.DROPSHIP_CANISTER_ID;

    let a1 = await dropship.whoAmI();
    let actor = createActor(process.env.DROPSHIP_CANISTER_ID, {agentOptions:{identity}});
    let a2 = await actor.whoAmI();
    console.log("a1",a1.toString());
    console.log("a2",a2.toString());

    let tokenId = encodeTokenId(dropshipCid,15);
    console.log("Token id: "+tokenId)
}




function App() {
  const count = useSelector(state => state.user.value)
  const dispatch = useDispatch()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={onAuthenticate} >Auth</button>
        {count} <button onClick={() => dispatch(dincr())}>+</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
