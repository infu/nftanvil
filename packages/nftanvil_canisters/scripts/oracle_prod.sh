#!/bin/sh

export WALLET_ID=`dfx identity --network ic get-wallet`
export ROUTER_ID=`dfx canister --network ic id router`

E8S_CYCLES=`node ./scripts/fetch_icp_price.js`
export E8S_CYCLES=$E8S_CYCLES

echo "e8s to cycles = $E8S_CYCLES"

read -p "Should we send oracle data? " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

/usr/local/bin/ic-repl -r ic ./scripts/oracle_set.ic
