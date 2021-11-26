#!/bin/bash
echo "dfx canister --wallet=$(dfx identity get-wallet) call rno2w-sqaaa-aaaaa-aaacq-cai addTokens '(\"$1\", $2:nat)' "
echo "dfx canister --wallet=$(dfx identity get-wallet) call renrk-eyaaa-aaaaa-aaada-cai addTokens '(\"$1\", $2:nat)' "
echo "dfx canister --wallet=$(dfx identity get-wallet) call rdmx6-jaaaa-aaaaa-aaadq-cai addTokens '(\"$1\", $2:nat)' "

