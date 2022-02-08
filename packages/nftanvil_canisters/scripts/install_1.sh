#!/usr/local/bin/ic-repl -r local
import wallet = "${WALLET_ID}" as "../src/declarations/cycles/cycles.did";

import router = "${ROUTER_ID}" as "../src/declarations/router/router.did";

identity default "~/.config/dfx/identity/default/identity.pem";

call as wallet ic.install_code(
  record {
    arg = encode ();
    wasm_module = file "../build/router.wasm";
    mode = variant { reinstall };
    canister_id = principal "${ROUTER_ID}";
  }
);

call as wallet router.wasm_set(
    record {
        name = "nft";
        wasm = file "../build/nft.wasm";
    }
);

call as wallet router.wasm_set(
    record {
        name = "account";
        wasm = file "../build/account.wasm";
    }
);

call as wallet router.wasm_set(
    record {
        name = "pwr";
        wasm = file "../build/pwr.wasm";
    }
);

call as wallet router.wasm_set(
    record {
        name = "anv";
        wasm = file "../build/anv.wasm";
    }
);


call as wallet router.wasm_set(
    record {
        name = "history";
        wasm = file "../build/history.wasm";
    }
);


call as wallet router.create_local_canisters();

call as wallet router.config_get();

call as wallet router.reinstall();
