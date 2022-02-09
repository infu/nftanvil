#!/bin/sh

export WALLET_ID=`dfx identity --network ic get-wallet`
export ROUTER_ID=`dfx canister --network ic id router`

/usr/local/bin/ic-repl -r ic ./scripts/router_refuel.ic