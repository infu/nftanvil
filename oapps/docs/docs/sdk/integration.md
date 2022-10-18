# Integration

## Discovery

Our router has permanent canister id `kbzti-laaaa-aaaai-qe2ma-cai` and by using its `config_get` from this interface [https://docs.nftanvil.com/docs/motoko/router/interface](https://docs.nftanvil.com/docs/motoko/router/interface) you can obtain our ever-changing router map, which looks like this:

```jsx
{
    "nft": [ // NFT data & metadata canisters
        "0",
        "5000"
    ],
    "pwr": [ // reverse index account id -> fungible token balance
        "5050",
        "5082"
    ],
    "anvil": "5003", // unused
    "nft_avail": [ // currently available for minting nft canisters
        "9", "10", "11", "12", "13", "14", "15", "16", "17"
    ],
    "space": [ // start and end of our sequential cluster
        [
            "17830671",
            "17836454"
        ]
    ],
    "account": [ // reverse index account id -> NFT
        "5010",
        "5042"
    ],
    "history": "5100", // the current history canister
    "history_range": [ // range for future history canisters
        "5100",
        "5500"
    ],
    "router": "kbzti-laaaa-aaaai-qe2ma-cai",
    "treasury": "5004" // used for communicating with nns ledger
}
```

Take a look at `"history": "5100"` This means that the currently used history canister has slot `5100` . This slot number can be converted to `canister id`. To do that we also need the `space` property, which holds a range from `17830671` to `17836454`. That range points to the first and last canister held by Anvil cluster. These are sequential canisters all registered by us.

Converting history slot to canister id can be done by adding the slot number 5100 to the first canister 17830671 and then after proper formatting, we will have dlrec-viaaa-aaaai-qe35q-cai.

**Why we don’t store canister ids ?** The above-mentioned system reduces memory significantly. Instead of having to keep thousands of canister id map in every canister or relying on inter-canister calls to query who is who, we have a simple map that helps us programmatically convert slots to canister ids and vice versa. The reverse transformation is useful when trying to figure if a canister id is part of the Anvil cluster or not.

**Motoko transformation `(range, slot) → canister-id`**

Can be found here [`https://docs.nftanvil.com/docs/motoko/nft/aprincipal`](https://docs.nftanvil.com/docs/motoko/nft/aprincipal)

You can use that function and all others after installing our Motoko package [https://docs.nftanvil.com/docs/sdk/motoko](https://docs.nftanvil.com/docs/sdk/motoko)

We have made helper functions here, which will help you easily establish communication with our cluster. [https://docs.nftanvil.com/docs/motoko/cluster/factory](https://docs.nftanvil.com/docs/motoko/cluster/factory)

For example `Cluster.nftFromTid(conf : Config, tid : Nft.TokenIdentifier) : Nft.Interface` will take `Config` and a `Token identifier` and return the exact actor where the NFT is, so you can start making inter-canister calls.

**Js transformation `(range, slot) → canister-id`**

[https://github.com/infu/nftanvil/blob/main/packages/nftanvil_tools/src/principal.js](https://github.com/infu/nftanvil/blob/main/packages/nftanvil_tools/src/principal.js)

It is available after installing our npm package **`@vvv-interactive/nftanvil-tools`[](https://docs.nftanvil.com/docs/sdk/js#vvv-interactivenftanvil-tools)**

You can see how we are using it in many places around the repo like this one [https://github.com/infu/nftanvil/blob/main/packages/nftanvil_react/src/reducers/nft.js](https://github.com/infu/nftanvil/blob/main/packages/nftanvil_react/src/reducers/nft.js)

To establish communication having a config map and token identifier, you can do this

```jsx
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import {
  encodeTokenId,
  decodeTokenId,
  tokenToText,
  tokenFromText,
  tokenUrl,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { nftCanister } from "@vvv-interactive/nftanvil-canisters/cjs/nft.js";

const map = await router.config_get();

const id = "nfta6p09nz0ql1uu4bbf";

const tid = tokenFromText(id);

const { index, slot } = decodeTokenId(tid);

const canister = PrincipalFromSlot(map.space, slot).toText();

const nftcan = nftCanister(canister, {
  // Provide your identity here or you will call as anonymous
  // agentOptions: {identity},
});

const my_metadata = await nftcan.metadata(tid);

const my_thumb_url = tokenUrl(map.space, tid, "thumb");
// https://pzv3i-3aaaa-aaaai-qcmkq-cai.raw.ic0.app/4d10001

const my_content_url = tokenUrl(map.space, tid, "thumb");
// https://pzv3i-3aaaa-aaaai-qcmkq-cai.raw.ic0.app/4d10000
```

Notice how the NFTA Token Identifier gets decoded into to numbers `index` and `slot` . The index is its position inside the canister at that slot. In the example above we have the metadata, thumb and content urls of the NFT.

### How to set NFT price with internal Anvil protocol

It’s worth mentioning that you don’t have to use the Anvil protocol and you can use your trading contract. It can own and transfer NFTs while executing a custom trade logic. If you use ours, we charge 0.5% fee.

Let’s start from the example above where we have `nftcan` and we also provided our own `identity` which is of the nft owner. We have also turned our identity principle into `address` and `subaccount` (This depends on which identity provider we use)

```jsx
const price = {
  amount: 100000000, // price in e8s
  marketplace: [
    {
      address: AccountIdentifier.TextToArray("a00c....727a"),
      share: 50,
    },
  ],
};

await nftcan.set_price({
  user: { address: AccountIdentifier.TextToArray(address) },
  token: tid,
  price: price,
  subaccount: AccountIdentifier.TextToArray(subaccount),
});
```

You set your marketplace share where 50 = 0.5%

Once your marketplace is set, if other dApps sell this NFT you will still earn 0.5% from it. Only the dapp where NFT is positioned can use `set_price`. In other words, the dApp where the NFT is located takes the marketplace fee.

Other dApps can still sell it and they can also take a fee, but this time its during purchase and its called `affiliate fee`

Keep in mind, that if we set 100000000 e8s (1 ICP) amount and we reduce 0.5% Anvil protocol fee, 0.5% Author royalty fee 0.5% Marketplace fee, then the seller will receive 1.5% less than what's specified in `amount`.

### Purchasing NFT

```jsx
let pwr = pwrCanister(
  PrincipalFromSlot(map.space, AccountIdentifier.TextToSlot(address, map.pwr)),
  {
    agentOptions: { identity },
  }
);
```

First we instantiate an actor to the exact Pwr canister which depends on the user account id.

Pwr is where fungible tokens are held, including our wrapped ICP. There are currently 32 canisters and each user gets serviced by exactly one of these depending on their account id.

```jsx
const result = await pwr.nft_purchase(BigInt(slot), {
  token: tokenFromText(id),
  user: { address: AccountIdentifier.TextToArray(address) },
  subaccount: AccountIdentifier.TextToArray(subaccount),
  affiliate: [],
  amount,
});
```

Amount comes from the price data in `metadata`

`affiliate` could be empty or hold the following

```jsx
{
  address: AccountIdentifier.TextToArray("a00c....727a"),
  share: 50,
}
```

This will attempt to buy the NFT for `amount` and additionally take 0.5% of the amount and send it to the affiliate address. In this case, make sure your interface has a +0.5% price increase from the price you get from metadata. There is also an additional 10000 e8s fee.

If the purchase was successful, NFT will now have a different account id as owner and the purchase amount will be distributed among the seller, author, Anvil protocol, marketplace and, affiliate.

### Wrapping & unwrapping ICP with the Anvil protocol

You can basically use your own trade contracts with your own wrapped ICP. If you use ours you will need our wrapped ICP. That is valid for everything except minting and recharging. These are currently only available for our wrapped ICP, but we have plans to make them also support native cycle transfer, which will make everything a lot easier.

To wrap ICP, we first make NNS ledger transaction and send all ICP to a special temporary address generated from our original address, but controlled by the wrapping canister. The temporary address is always the same for one original address, it just holds ICP temporarily.

The second step is to call the wrapping canister from our frontend and notify it that we have sent the ICP. Then it will move all of the ICP to treasury and if successful it will give the original address wrapped ICP.

```jsx
const amount = 100000000; // 1 ICP

let intent = await pwr.pwr_purchase_intent({
  user: { address: AccountIdentifier.TextToArray(address) },
  subaccount,
});
if (intent.err) throw intent.err;

let paymentAddress = intent.ok;

let ledger = ledgerCanister({
  agentOptions: authentication.getAgentOptions(),
});

let ledger_result = await ledger.transfer({
  memo: 0,
  amount: { e8s: amount },
  fee: { e8s: 10000n },
  from_subaccount: AccountIdentifier.TextToArray(subaccount),
  to: paymentAddress,
  created_at_time: [],
});

if (ledger_result.Err) throw ledger_result.Err;

let claim = await pwr.pwr_purchase_claim({
  user: { address: AccountIdentifier.TextToArray(address) },
  subaccount,
});

if (claim.err) throw claim.err;

let { transactionId } = claim.ok;
```

To unwrap ICP we just ask the PWR canister to withdraw and it will take the real ICP from treasury and send it via NNS ledger to the target address.

Think of it all as depositing/withdrawing cryptocurrency from a web site.
If the browser was interrupted (quit) in the middle between ledger transfer and claims, you can just call `pwr_purchase_claim` and it will resume if there is ICP inside the temporary address. We usually call this function on window.focus event.

```jsx
let claim = await pwr.pwr_purchase_claim({
  user: { address: AccountIdentifier.TextToArray(address) },
  subaccount,
});
```

### Collection authenticity

Most IC NFTs use the canister id to provide authenticity. One collection - one canister. This limits them to the technical limits IC has for one canister like memory, bandwidth, computations, etc. Instead, the Anvil protocol is using account id of the author. It can be derived from a pub/private key in a file, which is how `npx anvil` CLI does it. Or from Internet Identity or other identity providers allowing anyone to mint as few as one NFT, without having to spawn a whole new canister and take the burden of paying forever for it.
Basically, one address generated from a pub/private key is one collection id. Since canisters have a principal and can generate many addresses from it, one canister can be the author of many NFTA collections.

This also allows a game or dapp to mint on demand and scale without worrying about technical limits.

This puts one collection inside many nft canisters inside the cluster. Frontends just decode nft id, take slot from it, the map and connect to the right canister.
Currently, there is no author → nft index in the cluster, but we will add one at some point. We are gathering info on what is required, so we can build IC version of this.

To get that data you could download the whole history, go through transactions and rebuild the state. Then you could extract all kinds of valuable data for your exact use case.

We have done it off-chain and you can temporarily use this API (However for better decentralization it's advised that you make your own or switch to the canister version of this when it becomes available)

```jsx
// This will return all nfts created by an address (basic meta)
https://nftpkg.com/api/v1/author/a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda
// [id, quality, name, lore, attributes, tags]

// This will show all prices from an author
https://nftpkg.com/api/v1/prices/a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda
// [id, owned by author, e8s price]
```

Some collections may have few addresses, in case NFTs get burned, transformed, crafted, merged and so on. These can also be done with a single address by having a canister be the author, but it’s hard to plan everything ahead in time, so expect one collection to have multiple author addresses.

### Transactions

Each NFT has up to 20 of its last transaction ids stored inside its metadata. You can query each to get its details. Similar to TokenIdentifiers, Transaction ids also decode to `index` and `slot`

```jsx
const { slot, idx } = TransactionId.decode(tx_id);

const canister = PrincipalFromSlot(map.space, slot);

const history = historyCanister(canister, {
  agentOptions: { identity },
});
const details = await history.list({
  from: idx,
  to: idx + 1,
});
```

This will find the exact history canister and fetch transaction details for one transaction.
Currently, index with user → transactions is not available, but we can quickly add it to the off-chain browser.
