#!/bin/sh

export WALLET_ID=`dfx identity --network ic get-wallet`
export ROUTER_ID=`dfx canister --network ic id router`
dfx canister --network ic stop router
/usr/local/bin/ic-repl -r ic ./scripts/upgrade_router_wasm.ic
dfx canister --network ic start router
/usr/local/bin/ic-repl -r ic ./scripts/stop_all.ic
/usr/local/bin/ic-repl -r ic ./scripts/router_wasm_set.ic
/usr/local/bin/ic-repl -r ic ./scripts/router_upgrade.ic
/usr/local/bin/ic-repl -r ic ./scripts/start_all.ic