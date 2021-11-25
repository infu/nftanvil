#!/bin/sh
dfx canister deposit-cycles 12000000000000 router
dfx canister --wallet=$(dfx identity get-wallet) call router debug_reset

