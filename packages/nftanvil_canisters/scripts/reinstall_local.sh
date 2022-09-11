#!/bin/sh

export WALLET_ID=`dfx identity get-wallet`
export ROUTER_ID=`dfx canister id router`

echo "### Stop all"
/usr/local/bin/ic-repl -r local ./scripts/stop_all.ic
echo "### Reinstall router wasm"
/usr/local/bin/ic-repl -r local ./scripts/reinstall_router_wasm.ic
echo "### Router wasm set"
/usr/local/bin/ic-repl -r local ./scripts/router_wasm_set.ic
echo "### Create local canisters"
/usr/local/bin/ic-repl -r local ./scripts/router_create_local_canisters.ic
echo "### Router reinstall"
/usr/local/bin/ic-repl -r local ./scripts/router_reinstall.ic
echo "### Start all"
/usr/local/bin/ic-repl -r local ./scripts/start_all.ic
