cp dfx_deploy.json dfx.json
dfx deploy --network ic router
dfx deploy --network ic nft_0 --argument 'record {_acclist= vec {"sgc2c-fyaaa-aaaai-qa44a-cai";"sbd4w-iaaaa-aaaai-qa44q-cai";"siaxk-6iaaa-aaaai-qa45a-cai"}; _accesslist= vec {"tfote-raaaa-aaaai-qa42q-cai";"tmnyy-hiaaa-aaaai-qa43a-cai";"tlm6m-kqaaa-aaaai-qa43q-cai"}; _slot=0; _debug_cannisterId=null}'
dfx deploy --network ic nft_1 --argument 'record {_acclist= vec {"sgc2c-fyaaa-aaaai-qa44a-cai";"sbd4w-iaaaa-aaaai-qa44q-cai";"siaxk-6iaaa-aaaai-qa45a-cai"}; _accesslist= vec {"tfote-raaaa-aaaai-qa42q-cai";"tmnyy-hiaaa-aaaai-qa43a-cai";"tlm6m-kqaaa-aaaai-qa43q-cai"}; _slot=1; _debug_cannisterId=null}'
dfx deploy --network ic nft_2 --argument 'record {_acclist= vec {"sgc2c-fyaaa-aaaai-qa44a-cai";"sbd4w-iaaaa-aaaai-qa44q-cai";"siaxk-6iaaa-aaaai-qa45a-cai"}; _accesslist= vec {"tfote-raaaa-aaaai-qa42q-cai";"tmnyy-hiaaa-aaaai-qa43a-cai";"tlm6m-kqaaa-aaaai-qa43q-cai"}; _slot=2; _debug_cannisterId=null}'
dfx deploy --network ic account_0 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
dfx deploy --network ic account_1 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
dfx deploy --network ic account_2 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
dfx deploy --network ic access_0 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "445x6-xyaaa-aaaai-qa2dq-cai"}' 
dfx deploy --network ic access_1 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "445x6-xyaaa-aaaai-qa2dq-cai"}' 
dfx deploy --network ic access_2 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "445x6-xyaaa-aaaai-qa2dq-cai"}' 
