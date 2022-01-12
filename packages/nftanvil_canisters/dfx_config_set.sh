#!/bin/sh

dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call router config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_0 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_1 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_2 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_0 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_1 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_2 config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call anv config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call pwr config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call treasury config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call history config_set '(record {
    nft= vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    nft_avail = vec { principal "757td-7qaaa-aaaai-qa5vq-cai"; principal "7iyco-6yaaa-aaaai-qa5wa-cai"; principal "7pze2-taaaa-aaaai-qa5wq-cai" };
    account= vec { principal "7u4y7-jyaaa-aaaai-qa5ua-cai"; principal "7t56l-eaaaa-aaaai-qa5uq-cai"; principal "726vx-siaaa-aaaai-qa5va-cai" };
    pwr= principal "h2cll-waaaa-aaaai-qbfoa-cai";
    anv= principal "4kn7r-oiaaa-aaaai-qa55a-cai";
    history= principal "hpf2g-xiaaa-aaaai-qbfnq-cai";
    treasury= principal "h5dn7-3yaaa-aaaai-qbfoq-cai";
    router= principal "445x6-xyaaa-aaaai-qa2dq-cai";
    slot=0:nat;
  })' & 
