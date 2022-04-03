#!/bin/sh

export WALLET_ID=`dfx identity get-wallet`
export ROUTER_ID=`dfx canister id router`
dfx canister stop router
/usr/local/bin/ic-repl -r local ./scripts/upgrade_router_wasm.ic
dfx canister start router
/usr/local/bin/ic-repl -r local ./scripts/stop_all.ic
/usr/local/bin/ic-repl -r local ./scripts/router_wasm_set.ic
/usr/local/bin/ic-repl -r local ./scripts/router_upgrade.ic
/usr/local/bin/ic-repl -r local ./scripts/start_all.ic
