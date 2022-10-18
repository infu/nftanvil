---
sidebar_position: 2
---

# Motoko

We believe Motoko is the way to go when creating smart contracts. The alternative - Rust was never made for smart contracts and is way too powerful. What we mean is that in Motoko you can include third-party scripts and be secure, because they can't break out of their shell and do any harm. Because of its simplicity, Motoko is also easier to read and that is crucial characteristic contracts need to have.

We use Vessel package manager.
https://github.com/dfinity/vessel

In order to install Anvil motoko package, you need to create a file called package-set.dhall which specifies package sources. This will get greatly simplified in the future. For now, just make sure the line with anvils version is updated with the latest one `version = "v0.1.7"` from https://github.com/infu/anvil.mo releases page

```js
let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.20-20220131/package-set.dhall
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions = [
  { name = "anvil"
  , repo = "https://github.com/infu/anvil.mo"
  , version = "v0.1.7"
  , dependencies = ["array", "base", "hash", "encoding", "sha"]
  },
  { name = "sha"
   , repo = "https://github.com/aviate-labs/sha.mo"
   , version = "v0.1.1"
   , dependencies = [ "base" ]
  },
  { name = "array"
  , repo = "https://github.com/aviate-labs/array.mo"
  , version = "v0.1.1"
  , dependencies = [ "base" ]
  },
  { name = "hash"
  , repo = "https://github.com/aviate-labs/hash.mo"
  , version = "v0.1.0"
  , dependencies = [ "base" ]
  },
  { name = "encoding"
  , repo = "https://github.com/aviate-labs/encoding.mo"
  , version = "v0.3.0"
  , dependencies = [ "base", "array" ]
  },
  { name = "principal"
  , repo = "https://github.com/aviate-labs/principal.mo"
  , version = "v0.2.3"
  , dependencies = [ "array", "base", "hash", "encoding", "sha" ],
  }
]

in  upstream # additions
```

You will also need `vessel.dhall` file with the packages you want to install.

```js
{
  dependencies = [ "anvil","base","encoding","principal","sha","hash","array"],
  compiler = Some "0.6.20"
}
```

Then all you have to do is run

```bash
vessel install
```

and it will download all packages and place them in `.vessel` directory

You can now import the Anvil package like so

```motoko
import Anvil "mo:anvil/base/Anvil";
```

If you have trouble making it work, you can check how it's done at https://github.com/infu/nftanvil/tree/main/apps/badbot.ninja

Because it needs to download the cluster configuration and cache it, we need to create a global object like so

```motoko
shared({caller = _installer}) actor class Class() : async IF.Interface = this {
    ...

    private let anvil = Anvil.Anvil();
```

and then you can fetch the information for a transaction from the Anvil cluster

```motoko
let tx = await anvil.getTransaction(tx_id);
```

It will download the cluster config once `anvil.conf` and `anvil.oracle` and cache them for an hour.

You will need `anvil.conf` for various functions.

Check https://github.com/infu/nftanvil/blob/main/apps/badbot.ninja/mo/ito.mo as an example initial token offering contract which uses Anvil protocol

```motoko
import Cluster  "mo:anvil/type/Cluster";  // creates objects for inter-canister calls
import Nft  "mo:anvil/type/Nft";    // has important types and pure functions
import Anvil "mo:anvil/base/Anvil"; // holds config and will have shortcuts/ aliases of functions

...

private let anvil = Anvil.Anvil();

...

public shared({caller}) func test(token_id: Nft.TokenIdentifier) : async () {

    if (anvil.needsUpdate()) await anvil.update();

    let nftcan = Cluster.nftFromTid(anvil.conf, token_id);

    let response = await nftcan.transfer({
                from = ...
                to = ...
                token = token_id
                memo = ...
                subaccount = ...;
                });
```

If anvil.config needs an update, it will automatically fetch it.

Then it will create an interface object of the exact canister holding our target token and then initiate the inter-canister call and wait for the response.

[Cluster.mo](/docs/motoko/cluster/factory)
has all the object factory functions you will need to send calls to the Anvil cluster.

To figure out what are the inputs/outputs of functions and what they do, you can check their interfaces specs here:

[Nft.mo](/docs/motoko/nft/interface) NFTs data, metadata, transfer, use, burn...

[Account.mo](/docs/motoko/account/interface) Inventory. Reverse index, AccountIdentifier -> TokenIdentifier

[Pwr.mo](/docs/motoko/pwr/interface) Holds wrapped ICP (called PWR). Minting, recharging, purchasing

[History.mo](/docs/motoko/history/interface) Anvil transaction history

[Ledger.mo](/docs/motoko/ledger/interface) NNS ledger added in the package for convenience
