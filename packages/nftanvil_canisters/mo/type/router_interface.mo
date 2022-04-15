//@name=router
import Nft "./nft_interface";

module {
        //(0🔶 Interface
        public type Interface = actor {
                event_nft_full : shared (x: Principal) -> async ();
                event_history_full : shared () -> async ();
                config_get : query () -> async Nft.Config;
                settings_get : query () -> async (Nft.Config, Nft.Oracle);
        }
        //)
}
