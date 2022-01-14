#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call router oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history config_set '(record {
    nft= vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    nft_avail = vec { principal "s55qq-oqaaa-aaaaa-aaakq-cai"; principal "su63m-yyaaa-aaaaa-aaala-cai"; principal "st75y-vaaaa-aaaaa-aaalq-cai" };
    account= vec { principal "sgymv-uiaaa-aaaaa-aaaia-cai"; principal "sbzkb-zqaaa-aaaaa-aaaiq-cai"; principal "si2b5-pyaaa-aaaaa-aaaja-cai" };
    pwr= principal "t6rzw-2iaaa-aaaaa-aaama-cai";
    anv= principal "sp3hj-caaaa-aaaaa-aaajq-cai";
    history= principal "s24we-diaaa-aaaaa-aaaka-cai";
    treasury= principal "tqtu6-byaaa-aaaaa-aaana-cai";
    router= principal "tzq7c-xqaaa-aaaaa-aaamq-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history oracle_set '(record {cycle_to_pwr = 0.000003703703703704})' & 
