# About

NFT & FT tools for the Anvil Protocol powered by the Internet Computer.

- Mint from CLI
- Mint thru a web form https://nftanvil.com
- Create dapps with React components. Example https://ratoko.com

# Anvil Protocol Command Line Interface

Documentation: https://docs.nftanvil.com/docs/sdk/cli

Github: https://github.com/infu/nftanvil/tree/main/packages/nftanvil

# Minting

```
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

After installing

```
npx anvil mint 0 3
```
