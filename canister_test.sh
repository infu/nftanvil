#!/bin/bash
string=$(dfx canister call dropship_test test)

if [[ $string =~ "Failure!" ]]
then
   echo $string
   exit 1
fi
