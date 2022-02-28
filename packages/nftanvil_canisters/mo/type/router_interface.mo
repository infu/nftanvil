import Nft "./nft_interface";

module {
        public type Interface = actor {
                event_nft_full : shared (x: Principal) -> async ();
                event_history_full : shared () -> async ();
                config_get : query () -> async Nft.Config;
        }
}
