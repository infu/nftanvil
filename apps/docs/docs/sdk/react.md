---
sidebar_position: 5
---

# React

This dapp https://github.com/infu/nftanvil/tree/main/apps/badbot.ninja demonstrates how `nftanvil-react` package is used.

The plan is to have plug and play components. For now it provides helper functions and you have to make the components yourself.

It makes sure you get properly prefixed AccountIdentifier and also automatically wraps ICP transfered to it.

Functions here - https://github.com/infu/nftanvil/tree/main/packages/nftanvil_react/src/reducers

### Installation

To add to existing React project:

```
npm i @vvv-interactive/nftanvil-react
```

In your index.js wrap your app with `AnvilProvider` it will give context to our functions and components - an internal Redux state to make our lives easier.

If you don't know how Redux works, you can go trough one of the https://redux.js.org/ tutorials and you will quickly figure it out.

:::tip
Install Redux DevTools to easily inspect the state and see whats going on under the hood https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
:::

```js
import { AnvilProvider } from "@vvv-interactive/nftanvil-react";

ReactDOM.render(
  <React.StrictMode>
    <AnvilProvider>
      <App />
    </AnvilProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
```

### Usage

Now you can interface with Anvil

```jsx
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
} from "@vvv-interactive/nftanvil-react";

export function User() {
  const dispatch = useAnvilDispatch();

  const address = useAnvilSelector((state) => state.user.address);

  return (
    <div>
      {address ? (
        <button
          onClick={() => {
            dispatch(user_logout());
          }}
        >
          Logout {address}
        </button>
      ) : (
        <button
          className="attention"
          onClick={() => {
            dispatch(user_login());
          }}
        >
          Login
        </button>
      )}
    </div>
  );
}
```

`useAnvilDispatch` allows you to dispatch actions and modify the state, while `useAnvilSelector` allows you to get state.

### Basic transfer

Another example with which you can make wrapped ICP transfer

```jsx
function MyButton() {
  const dispatch = useAnvilDispatch();

  return (
    <button
      onClick={() => {
        dispatch(
          user_transfer_icp({
            to: "a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a",
            amount: 10000,
          })
        );
      }}
    >
      Click me
    </button>
  );
}
```

`nftanvil-react` takes care of cluster discovery, identity management & canister targeting to make that one-liner work. You can find what `user_transfer_icp` does under the hood here https://github.com/infu/nftanvil/blob/main/packages/nftanvil_react/src/reducers/user.js
