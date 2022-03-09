#!/bin/sh

export WALLET_ID=`dfx identity get-wallet`
export ROUTER_ID=`dfx canister id router`
/usr/local/bin/ic-repl -r ic ./scripts/stop_all.ic
/usr/local/bin/ic-repl -r local ./scripts/reinstall_router_wasm.ic
/usr/local/bin/ic-repl -r local ./scripts/router_wasm_set.ic
/usr/local/bin/ic-repl -r local ./scripts/router_create_local_canisters.ic
/usr/local/bin/ic-repl -r local ./scripts/router_reinstall.ic
/usr/local/bin/ic-repl -r ic ./scripts/start_all.ic
