---
sidebar_position: 3
---

# Js

You can see Anvil NPM packages here https://www.npmjs.com/org/vvv-interactive

### @vvv-interactive/nftanvil

Intended to be used by backend node.js scripts. Has File Identity and node-fetch.

Also has the `npx anvil` cli.

Its usage is demonstrated at https://github.com/infu/nftanvil/tree/main/apps/nftanvil_mint

### @vvv-interactive/nftanvil-canisters

Can be used by frontends. Has js factories for creating objects to communicate with the cluster.

Example:

```js
import { ledgerCanister } from "@vvv-interactive/nftanvil-canisters/cjs/ledger.js";

let ledger = ledgerCanister({
  agentOptions: authentication.getAgentOptions(),
});

let response = await ledger.account_balance({
  account: AccountIdentifier.TextToArray(address),
});
```

### @vvv-interactive/nftanvil-tools

Has pure functions which will help you transform objects, generate and parse ids. Without them you will hardly do anything. There are plenty of usage examples all across the monorepo.

```
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

let aid = AccountIdentifier.TextToArray("a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a");
```

This will transform an Account Identifier to `[Nat8]` which is the required input format when calling functions

You can find all available tools here https://github.com/infu/nftanvil/tree/main/packages/nftanvil_tools/src

The combination of `nftanvil-canisters` + `nftanvil-tools` is all you need to communicate with Anvil from a web app.

If you are fluent with React, you can also use `nftanvil-react` package.
