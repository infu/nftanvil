#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history_0 config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= record { 5:nat16; 7:nat16 };
    nft_avail = vec {  5:nat16;  6:nat16;  7:nat16 };
    account= record { 0:nat16; 2:nat16 };
    pwr= 8:nat16;
    anv= 3:nat16;
    history= 4:nat16;
    treasury= 10:nat16;
    router=  9:nat16;
    space= vec { vec {108:nat64; 118:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call router oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
