#!/bin/sh

export WALLET_ID=`dfx identity get-wallet`
export ROUTER_ID=`dfx canister id router`

/usr/local/bin/ic-repl -r local ./scripts/router_refuel.ic