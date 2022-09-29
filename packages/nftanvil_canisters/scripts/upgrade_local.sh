#!/bin/sh

export WALLET_ID=`dfx identity get-wallet`
export ROUTER_ID=`dfx canister id router`
echo "Stop router"
dfx canister stop router

echo "Set proper config"


echo "Upgrading router"
/usr/local/bin/ic-repl -r local ./scripts/upgrade_router_wasm.ic
echo "Start router"
dfx canister start router
echo "Stop All"
/usr/local/bin/ic-repl -r local ./scripts/stop_all.ic
echo "Set WASM"
/usr/local/bin/ic-repl -r local ./scripts/router_wasm_set.ic
echo "Run Upgrade"
/usr/local/bin/ic-repl -r local ./scripts/router_upgrade.ic
echo "Start All"
/usr/local/bin/ic-repl -r local ./scripts/start_all.ic
