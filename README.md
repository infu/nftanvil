# NFTANVIL 

https://nftanvil.com

https://5rttq-yqaaa-aaaai-qa2ea-cai.raw.ic0.app

Made by VVV Interactive

Powered by the Internet Computer https://dfinity.org/

Explained in 2min https://www.youtube.com/watch?v=hGL5xtV7jIU


**Current network (production will have a lot more nft and account canisters) Access canister id deprecated and its functionality will go to account**
![image](https://user-images.githubusercontent.com/24810/140567962-9fa57616-084c-4662-8a21-cc8e185c23b7.png)

## Hackathon related

Latest branch is 'lerna'. Branch 'main' is left alone the way it was when contest ended.

Motoko written for the hackathon and NFTANVIL:

[nft.mo](https://github.com/infu/nftanvil/blob/main/src/ic/dropship/nft.mo) NFT implementation. Holds assets. Serves assets trough HTTP.

[router.mo](https://github.com/infu/nftanvil/blob/main/src/ic/dropship/router.mo) Manages the canister cluster. Adds new canisters on demand.

[account.mo](https://github.com/infu/nftanvil/blob/main/src/ic/dropship/account.mo) Holds list of all tokens each account holds.

[access.mo](https://github.com/infu/nftanvil/blob/main/src/ic/accesscontrol/access.mo) Challenges with captcha.

[test.mo](https://github.com/infu/nftanvil/blob/main/test/token_basic.mo) Test written in Motoko

[HashSmash.mo](https://github.com/vvv-interactive/vvv.mo/blob/main/src/HashSmash.mo) A Hash of Hashes with easy upgrade

[Painless.mo](https://github.com/vvv-interactive/vvv.mo/blob/main/src/Painless.mo) HTTP Abstraction layer

[PseudoRandom.mo](https://github.com/vvv-interactive/vvv.mo/blob/main/src/PseudoRandom.mo) Pseudo random for cheap random

[Captcha.mo](https://github.com/vvv-interactive/vvv.mo/blob/main/src/Captcha.mo) Captcha

[Ext.mo](https://github.com/infu/ext.std/blob/main/src/Ext.mo) Changes of the spec in a fork. To be separated in own repo.

Additionally: 

[Web frontent](https://github.com/infu/nftanvil/tree/main/src) React + Redux + Chakra UI.

[Node client](https://github.com/infu/nftanvil_demo_minter) Demonstrating how minting will work with node.js script.
