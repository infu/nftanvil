---
sidebar_position: 1
---

# Cli

Anvil's command line interface is made to provide easy to use commands for minting & distributing large nft collections.

You don't have to use this and can instead write your own scripts directly using the npm packages `@vvv-interactive/nftanvil-canisters` and `@vvv-interactive/nftanvil-tools`

### Requirements

Node https://nodejs.org/en/download/

You may also need DFX for some commands https://github.com/dfinity/sdk

```
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

:::tip
If you are on Windows, you can install Ubuntu terminal environment
:::

### Installation

You can install it globally (You will be able to run commands everywhere)

The npm packages are open source since the beginning of the project - October 2021 https://github.com/infu/nftanvil/tree/main/packages

```
sudo npm i -g @vvv-interactive/nftanvil
```

Or in a local project (You need to be in the project folder to run commands)

```
mkdir myproject
cd myproject
npm init
npm i @vvv-interactive/nftanvil
```

When you need to update it to the latest version run

```
npm i @vvv-interactive/nftanvil@latest
```

### 📙 Show help

```
npx anvil
```

Should display short help if successfully installed

### Show address & balance

This will create pub/private key pair and save it in `identity.json`

:::note
Keep the contents of `identity.json` a secret, it controls all fungible & non-fungible tokens you have in your address and can be used to mint
:::

```bash
npx anvil address

# Address a00c223cb1bc2f5fc31603baa3d647ba38070d80d05636c3487eb7fba4d6d39e
# Balance 0 ICP (0 e8s)
```

To mint you need to send ICP to this address. Once you are done, you can transfer ICP out

### Transfer ICP out

```bash
# npx anvil transfer-icp <address> <e8s>

npx anvil transfer-icp a00bab7802dc3efaf20bd61efd96c3537e6cbf0690d228e41f89a9c142bddc38  100000
```

Where 100000 is the amount of ICP in e8s. 1 ICP = 1 0000 0000 e8s

### ✨ Minting NFTs 🔨

You will need to create a file named `input.js` in project root with the following contents:

```js
module.exports = [
  {
    name: "First nft",
    domain: "badbot.ninja",
    lore: "Once upon a time...",
    content: "content/somefile.jpg",
    thumb: "thumb/somethumb.jpg",
    attributes: {
      agility: 1,
      intelligence: 4,
    },
    tags: ["helmet", "protection"],
    quality: 1,
    authorShare: 50,
  },
  {
    name: "Second nft",
    domain: "badbot.ninja",
    lore: "Once upon a time...",
    content: "content/somefile.jpg",
    thumb: "thumb/somethumb.jpg",
    attributes: {
      agility: 1,
      intelligence: 4,
    },
    tags: ["helmet", "protection"],
    quality: 1,
    authorShare: 50,
  },
];
```

Or you could just start with the most basic setup

```js
module.exports = [
  {
    name: "First nft",
    thumb: "thumb/somethumb.jpg",
  },
  {
    name: "Second nft",
    thumb: "thumb/somethumb.jpg",
  },
  {
    name: "Third nft",
    thumb: "thumb/somethumb.jpg",
  },
];
```

Create a folder `thumb` and place `somethumb.jpg` inside. It has to be smaller than 131kb. Can be `gif` `png` `jpg` `apng` `svg`

Provided that you have loaded your address with some ICP you can now mint these.

```bash
# npx anvil mint <from> <to>

npx anvil mint 0 3
```

Where `from` and `to` are the indexes of the items in your input.js array.

This will mint the NFTs and create a file `minted.json` in which index from `input.js` points to raw nft id. This id when converted to text will look like `nftac76by0gdlu2de20z` and will be viewable at `https://nftanvil.com/nftac76by0gdlu2de20z`

```json
{ "0": 329129, "1": 132572, "2": 132573 }
```

Provided you just minted these NFTs, you can easily find them in the history here https://nftanvil.com/history

Or you could copy your address from `npx anvil address` and append it to the url like so https://nftanvil.com/a00c223cb1bc2f5fc31603baa3d647ba38070d80d05636c3487eb7fba4d6d39e

:::tip
If you have 10,000 nfts in `input.js`, you can mint in portions and check if everything is alright. Start with 1 or 10 and if something is wrong, delete `minted.json` use `npx anvil burn-garbage`. If for some reason images didn't get uploaded, you can use `npx anvil check` to burn only the broken ones and then `npx anvil mint` to mint them again.
:::

### 🔥 Burn garbage

It will basically scan your inventory and burn all the nfts inside it, which are not in `minted.json`. Whenever you need to remove some nfts, you can do that by removing them from `minted.json` and running `npx anvil burn-garbage`

### Recover

Sometimes you may interrupt the minting process and for some reason `minted.json` may not get updated. In that case you can run `npx anvil recover` which will scan your inventory and try to match NFTs from it to the spec from `input.js`. Matching is based on name and lore. Once finished it will add the ids to `minted.json`

### Check

You may have had network troubles during minting. It would result in some images not getting uploaded.

```bash
#npx anvil check [options] <from> <to>

npx anvil check 0 3
```

This will check if everything is ok. If not, it will delete ids from `minted.json` and burn the NFTs.

You may also want to do a quick check, which doesn't check the images, only metadata

```bash
npx anvil check --quick 0 3
```

### Transfer NFTs

You may want to move your freshly minted NFTs to another address

```bash
# npx anvil transfer <from> <to> <address>

npx anvil transfer 0 1 a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a
```

### 🎁 Gift codes

You may want to send NFTs to someone without knowing their address (email, text message)

```bash
# npx anvil gift <from> <to>                creates gift links for nfts from index to index

npx anvil gift 0 3
```

This will produce the file `giftcodes.json`

```json
{
  "0": "nftanvil.com/1171wh3R2uqZroWztVCrxg2t2ggnzbhnC",
  "1": "nftanvil.com/113RZ7T7zJmTwDbFQUjJj25MTLmdJHfLF",
  "2": "nftanvil.com/113RZAqAFFwTiP5LBixEhNQsm7bcuGgAv"
}
```

Whoever has that code or link, can claim the NFT. The code will work only once and only if the nfts don't get transfered, burned or another gift code overwrites the previous one.
These are as secure as the messenger, email you send them with.

### Initial Token Offering

We have also created a smart contract + dapp and paired it with `npx anvil ito` command. You can use that to distribute nfts in a random way so everyone gets a fair chance of winning the best ones. More on that in its separate page
