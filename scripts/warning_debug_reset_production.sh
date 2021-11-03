#!/bin/sh
echo "dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call dropship debug_reset"
