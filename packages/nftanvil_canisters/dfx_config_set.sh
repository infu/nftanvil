#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call collection config_set '(record {
    nft= vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    nft_avail = vec { principal "st75y-vaaaa-aaaaa-aaalq-cai"; principal "t6rzw-2iaaa-aaaaa-aaama-cai"; principal "tzq7c-xqaaa-aaaaa-aaamq-cai" };
    account= vec { principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai"; principal "sp3hj-caaaa-aaaaa-aaajq-cai" };
    pwr= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    anv= principal "s24we-diaaa-aaaaa-aaaka-cai";
    collection= principal "s55qq-oqaaa-aaaaa-aaakq-cai";
    history= principal "su63m-yyaaa-aaaaa-aaala-cai";
    treasury= principal "tcvdh-niaaa-aaaaa-aaaoa-cai";
    router= principal "txssk-maaaa-aaaaa-aaanq-cai";
    slot=0:nat;
  })' & 
