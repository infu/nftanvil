cp dfx_deploy.json dfx.json
dfx deploy --network ic router
dfx deploy --network ic nft_0 --argument 'record {_acclist= vec {"zoeat-haaaa-aaaai-qa25a-cai";"zjfgh-kyaaa-aaaai-qa25q-cai"}; _accesslist= vec {"zhhlp-riaaa-aaaai-qa24q-cai"}; _slot=0; _debug_cannisterId=null}'
dfx deploy --network ic account_0
dfx deploy --network ic account_1
dfx deploy --network ic access_0 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"}' 
