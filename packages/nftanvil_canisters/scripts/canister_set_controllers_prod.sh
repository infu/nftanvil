export WALLET_ID=`dfx identity --network ic get-wallet`
export ROUTER_ID=`dfx canister --network ic id router`
echo "Setting controllers for $1";
CANISTER_ID=$1 /usr/local/bin/ic-repl -r ic ./scripts/canister_set_controllers_prod.ic