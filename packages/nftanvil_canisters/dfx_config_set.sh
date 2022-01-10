#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=1:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=2:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history config_set '(record {
    nft= vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    nft_avail = vec { principal "qoctq-giaaa-aaaaa-aaaea-cai"; principal "qjdve-lqaaa-aaaaa-aaaeq-cai"; principal "qaa6y-5yaaa-aaaaa-aaafa-cai" };
    account= vec { principal "r7inp-6aaaa-aaaaa-aaabq-cai"; principal "rkp4c-7iaaa-aaaaa-aaaca-cai"; principal "rno2w-sqaaa-aaaaa-aaacq-cai" };
    pwr= principal "qhbym-qaaaa-aaaaa-aaafq-cai";
    anv= principal "renrk-eyaaa-aaaaa-aaada-cai";
    history= principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
    treasury= principal "qvhpv-4qaaa-aaaaa-aaagq-cai";
    router= principal "qsgjb-riaaa-aaaaa-aaaga-cai";
    slot=0:nat;
  })' & 
