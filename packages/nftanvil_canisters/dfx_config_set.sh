#!/bin/sh

dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call nft_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call account_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history_0 config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call history_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call pwr oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call anv oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call treasury oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call router config_set '(record {
    nft= record { 5:nat64; 7:nat64 };
    nft_avail = vec {  5:nat64;  6:nat64;  7:nat64 };
    account= record { 0:nat64; 2:nat64 };
    pwr= 8:nat64;
    anv= 3:nat64;
    history= 4:nat64;
    treasury= 10:nat64;
    router=  9:nat64;
    space= vec { vec {55:nat64; 65:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity  get-wallet)  call router oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
