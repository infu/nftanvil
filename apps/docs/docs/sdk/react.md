---
sidebar_position: 5
---

# React

This dapp https://github.com/infu/nftanvil/tree/main/apps/badbot.ninja demonstrates how `nftanvil-react` package is used.

The plan is to have plug-and-play components. For now, it provides helper functions and you have to make the components yourself.

It makes sure you get properly prefixed AccountIdentifier and also automatically wraps ICP transferred to it.

Functions here - https://github.com/infu/nftanvil/tree/main/packages/nftanvil_react/src/reducers

### Installation

To add to the existing React project:

```
npm i @vvv-interactive/nftanvil-react
```

In your index.js wrap your app with `AnvilProvider` it will give context to our functions and components - an internal Redux state to make our lives easier.

If you don't know how Redux works, you can go through one of the https://redux.js.org/ tutorials and you will quickly figure it out.

:::tip
Install Redux DevTools to easily inspect the state and see what's going on under the hood https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
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

### Marketplace component

Importing components

```jsx
import {
  MarketplaceLoad,
  MarketplaceFilters,
} from "@vvv-interactive/nftanvil-react/cjs/components/Marketplace";
```

Fetching items by author id

```jsx
 <MarketplaceLoad
        author={
          "a00aa2d5f5f9738e300615f21104cd06bbeb86bb8daee215525ac2ffde621bed"
        }
      >
        {(items) => (
          ...
        )}
</MarketplaceLoad>
```

Creating marketplace gallery filters and sorting. Provides various useful shortcuts

```jsx
<MarketplaceFilters
      items={items} // Items laded from <MarketplaceLoad>

      filterTags={["tagone","tagtwo"]} // These tags will be filtered out

      attributes={[ // These will add sort options
          ["attack", "with attack"],
          ["airdrops", "width airdrops"],
      ]}

      tags={[["blue","gold","red"],["head","torso","legs","waist"]]}
      // These will create multiple tag select inputs inside resulting `fTags`

    >
      {({
        goPageBack, //button - go prev page
        goPageNext, //button - go next page
        stats,      //object - stats - stdLow, floor, mean, high
        fOrder,     //input - select with sorting options
        fQuality,   //input - select with quality options
        fTags,      //array of inputs - custom selects
        slice,      //items remaining after all the filtering is done
        tagsLeft,   //all the tags remaining after filtering is done
      }) => {
      ...
      }}
</MarketplaceFilters>
```

### Inventory component

This component can be used inside a marketplace context or standalone.

```jsx
<InventoryLarge
  items={slice.map((x) => tokenToText(x[0]))} //input slice of items to visualize
  custom={(meta) => {
    // what to display in the bottom left corner of the large nft thumb
    return <div style={{ paddingTop: "8px", width: "80%" }}>{meta.name}</div>;
  }}
  onOpenNft={(id) => {
    // what happens when the nft is clicked
    navigate("/" + id);
  }}
/>
```
