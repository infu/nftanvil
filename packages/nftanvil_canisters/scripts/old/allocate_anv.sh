#!/bin/bash
echo "dfx canister --wallet=$(dfx identity --network ic get-wallet) --network ic call anv adminAllocate 'record {user = variant { address = \"$1\"}; amount = $2:nat}' "
