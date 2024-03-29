# run processes and store pids in array
for i in $n_procs; do
    ./procs[${i}] &
    pids[${i}]=$!
done

# wait for all pids
for pid in ${pids[*]}; do
    wait $pid
done



`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/nft.mo -o build/nft.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/account.mo -o build/account.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/router.mo -o build/router.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/pwr.mo -o build/pwr.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/history.mo -o build/history.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/anvil.mo -o build/anvil.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/treasury.mo -o build/treasury.wasm &
`dfx cache show`/moc --idl --hide-warnings `vessel sources 2>>/dev/null` -c mo/tokenregistry.mo -o build/tokenregistry.wasm &


wait

mv build/nft.did src/declarations/nft/
didc bind src/declarations/nft/nft.did --target js > src/declarations/nft/nft.did.js

mv build/account.did src/declarations/account/
didc bind src/declarations/account/account.did --target js > src/declarations/account/account.did.js

mv build/router.did src/declarations/router/
didc bind src/declarations/router/router.did --target js > src/declarations/router/router.did.js

mv build/pwr.did src/declarations/pwr/
didc bind src/declarations/pwr/pwr.did --target js > src/declarations/pwr/pwr.did.js

mv build/history.did src/declarations/history/
didc bind src/declarations/history/history.did --target js > src/declarations/history/history.did.js

mv build/anvil.did src/declarations/anvil/
didc bind src/declarations/anvil/anvil.did --target js > src/declarations/anvil/anvil.did.js

mv build/treasury.did src/declarations/treasury/
didc bind src/declarations/treasury/treasury.did --target js > src/declarations/treasury/treasury.did.js

mv build/tokenregistry.did src/declarations/tokenregistry/
didc bind src/declarations/tokenregistry/tokenregistry.did --target js > src/declarations/tokenregistry/tokenregistry.did.js
