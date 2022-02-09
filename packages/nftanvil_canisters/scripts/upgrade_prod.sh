#!/bin/sh

export WALLET_ID=`dfx identity --network ic get-wallet`
export ROUTER_ID=`dfx canister --network ic id router`
/usr/local/bin/ic-repl -r local ./scripts/upgrade_router_wasm.ic
/usr/local/bin/ic-repl -r local ./scripts/router_wasm_set.ic
/usr/local/bin/ic-repl -r local ./scripts/router_upgrade.ic