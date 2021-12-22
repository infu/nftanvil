#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call collection config_set '(record {
    nft= vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    nft_avail = vec { principal "qsgjb-riaaa-aaaaa-aaaga-cai"; principal "qvhpv-4qaaa-aaaaa-aaagq-cai"; principal "q4eej-kyaaa-aaaaa-aaaha-cai" };
    account= vec { principal "renrk-eyaaa-aaaaa-aaada-cai"; principal "rdmx6-jaaaa-aaaaa-aaadq-cai"; principal "qoctq-giaaa-aaaaa-aaaea-cai" };
    pwr= principal "q3fc5-haaaa-aaaaa-aaahq-cai";
    anv= principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
    collection= principal "qaa6y-5yaaa-aaaaa-aaafa-cai";
    history= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    treasury= principal "sgymv-uiaaa-aaaaa-aaaia-cai";
    router= principal "rkp4c-7iaaa-aaaaa-aaaca-cai";
    slot=0:nat;
  })' & 
