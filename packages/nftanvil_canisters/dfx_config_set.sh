#!/bin/sh

dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_0 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_1 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_2 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call nft_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_0 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_1 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_1 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_2 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call account_2 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call history_0 config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call history_0 oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call pwr config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call pwr oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call anv config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call anv oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call treasury config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call treasury oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call router config_set '(record {
    nft= record { 0:nat16; 2:nat16 };
    nft_avail = vec {  0:nat16;  1:nat16;  2:nat16 };
    account= record { 5010:nat16; 5012:nat16 };
    pwr= 5002:nat16;
    anv= 5003:nat16;
    history= 5100:nat16;
    treasury= 5004:nat16;
    router=  5001:nat16;
    space= vec { vec {17830671:nat64; 17835771:nat64 }}
  })' & 
dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call router oracle_set '(record {icpCycles = 160000; icpFee = 10000; pwrFee = 10000; anvFee = 10000;})' & 
