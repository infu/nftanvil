cp dfx_deploy.json dfx.json
dfx deploy --network ic anv
dfx deploy --network ic router
dfx deploy --network ic nft_0 --argument 'record {_acclist= vec {"7u4y7-jyaaa-aaaai-qa5ua-cai";"7t56l-eaaaa-aaaai-qa5uq-cai";"726vx-siaaa-aaaai-qa5va-cai"};  _slot=0; _router= principal "445x6-xyaaa-aaaai-qa2dq-cai"; _debug_cannisterId=null}'
dfx deploy --network ic nft_1 --argument 'record {_acclist= vec {"7u4y7-jyaaa-aaaai-qa5ua-cai";"7t56l-eaaaa-aaaai-qa5uq-cai";"726vx-siaaa-aaaai-qa5va-cai"};  _slot=1; _router= principal "445x6-xyaaa-aaaai-qa2dq-cai"; _debug_cannisterId=null}'
dfx deploy --network ic nft_2 --argument 'record {_acclist= vec {"7u4y7-jyaaa-aaaai-qa5ua-cai";"7t56l-eaaaa-aaaai-qa5uq-cai";"726vx-siaaa-aaaai-qa5va-cai"};  _slot=2; _router= principal "445x6-xyaaa-aaaai-qa2dq-cai"; _debug_cannisterId=null}'
dfx deploy --network ic account_0 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
dfx deploy --network ic account_1 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
dfx deploy --network ic account_2 --argument 'record {_router= principal "445x6-xyaaa-aaaai-qa2dq-cai"}'
