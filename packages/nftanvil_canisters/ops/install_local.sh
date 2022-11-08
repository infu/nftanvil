#!/bin/sh
cd ~/vvv-interactive/nftpkg/packages/nftanvil_canisters/

rm -rf .dfx/local
dfx wallet balance
dfx deploy --wallet `dfx identity get-wallet` router
dfx wallet send `dfx canister id router` 95000000000000
dfx wallet add-controller 5skvy-5iuw7-aayjs-26kke-n67ll-zrnpp-tvwzw-gmecn-qudtj-rij5b-oae