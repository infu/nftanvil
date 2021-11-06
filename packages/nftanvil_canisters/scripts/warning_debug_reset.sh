#!/bin/sh
dfx canister --wallet=$(dfx identity get-wallet) call router debug_reset

