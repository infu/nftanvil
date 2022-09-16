#!/bin/sh

rm -rf .dfx/local/
dfx wallet balance
dfx deploy --wallet `dfx identity get-wallet` router
dfx wallet send `dfx canister id router` 95000000000000
yarn run reinstall:local