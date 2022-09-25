---
sidebar_position: 0
---

# Web mint

You could mint easily through the web form here https://nftanvil.com/

Nftanvil.com is a dapp using the Anvil protocol.

It serves as a browser, wallet/ inventory, marketplace and mint. It doesn't have any special privileges which third-party dapps don't have.

Its best to start with its UI, before you dig into the deeper more technical interfaces.

### Authentication

The Anvil protocol relies on pub/private keys for authentication. Each dapp using Anvil decides which authentication UI to use. We have integrated Internet Identity, because we like it most. You could easily use the dapp in a browser on your mobile phone without installing any applications. Internet Identity will use a special chip available on latest smartphones

:::tip
If you don't have Tresor, Ledger and your desktop device doesn't support WebAuthn, you should try accessing nftanvil.com on your phone. Most phones should have everything required.
:::

### Minting

One of the significant differences between other NFT systems and Anvil is that we use cryptography for the authenticity of a collection instead of canister id. We use the author `account identifier`, which derives from the `Principal id`, which derives from the `public key`. This means only the one who has the private key can mint as a part of a collection. That doesn't have to be a file identity like the one `npx anvil` uses. Or a user from Internet Identity. It could be another canister, which can specify various control mechanisms, multi-sig, DAO, etc.

Once you configure your NFT you will be given a few pricing options. They vary depending mostly on the NFT memory footprint - for how long it was prepaid and its vanity quality field.

### Inventory

Games have refined the UI of player inventories for two centuries now and we believe this is the proper way to visualize NFTs. It's not complete and what you see on that page is just a glimpse of what's to come.
You can send your inventory address to anyone and they can see what you have and what you are selling. You can switch the view from small thumbs to large ones to get it to look more like a marketplace.
You can think of your inventory as a marketplace stall where you can sell whatever you want.

### History

https://nftanvil.com/history
Our history saves transactions and each new one hashes the previous one, so nobody, even us cant alter the public blockchain unnoticed. Altering even one bit in a transaction somewhere in the history will cause every hash after it to be totally different.

### Dashboard

https://nftanvil.com/dashboard

The dashboard is meant for analyzing the protocol as a whole. You can see all canisters and their memory footprint, cycles consumption, upgrade logs and KPI
