cp dfx_deploy.json dfx.json
dfx deploy  anv
dfx deploy  router
dfx deploy  nft_0 --argument 'record {_acclist= vec {"u7xn3-ciaaa-aaaaa-aaa4a-cai";"uywlp-pqaaa-aaaaa-aaa4q-cai";"urvat-zyaaa-aaaaa-aaa5a-cai"}; _accesslist= vec {"v43e5-wqaaa-aaaaa-aaa2q-cai";"vvypb-ayaaa-aaaaa-aaa3a-cai";"vszjv-naaaa-aaaaa-aaa3q-cai"}; _slot=0; _router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"; _debug_cannisterId=null}'
dfx deploy  nft_1 --argument 'record {_acclist= vec {"u7xn3-ciaaa-aaaaa-aaa4a-cai";"uywlp-pqaaa-aaaaa-aaa4q-cai";"urvat-zyaaa-aaaaa-aaa5a-cai"}; _accesslist= vec {"v43e5-wqaaa-aaaaa-aaa2q-cai";"vvypb-ayaaa-aaaaa-aaa3a-cai";"vszjv-naaaa-aaaaa-aaa3q-cai"}; _slot=1; _router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"; _debug_cannisterId=null}'
dfx deploy  nft_2 --argument 'record {_acclist= vec {"u7xn3-ciaaa-aaaaa-aaa4a-cai";"uywlp-pqaaa-aaaaa-aaa4q-cai";"urvat-zyaaa-aaaaa-aaa5a-cai"}; _accesslist= vec {"v43e5-wqaaa-aaaaa-aaa2q-cai";"vvypb-ayaaa-aaaaa-aaa3a-cai";"vszjv-naaaa-aaaaa-aaa3q-cai"}; _slot=2; _router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"; _debug_cannisterId=null}'
dfx deploy  account_0 --argument 'record {_router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"}'
dfx deploy  account_1 --argument 'record {_router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"}'
dfx deploy  account_2 --argument 'record {_router= principal "vo5te-2aaaa-aaaaa-aaazq-cai"}'
dfx deploy  access_0 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "vo5te-2aaaa-aaaaa-aaazq-cai"}' 
dfx deploy  access_1 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "vo5te-2aaaa-aaaaa-aaazq-cai"}' 
dfx deploy  access_2 --argument 'record{_admin = principal "vlgg5-pyaaa-aaaai-qaqba-cai"; _router = principal "vo5te-2aaaa-aaaaa-aaazq-cai"}' 
