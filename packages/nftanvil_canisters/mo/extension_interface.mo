import Nft "./nft_interface";

module {

        public type Interface = actor {

                // NFTAnvil asks if a principal is allowed to mint
                nftanvil_minter_allow : query (minter : Principal) -> async AllowResponse;

                // NFTAnvil -> Extension -> Notify target
                nftanvil_use: shared (UseRequest) -> async UseResponse;

                // NFTAnvil asks if an nft can be unsocketed
                nftanvil_unsocket_allow : query (request: Nft.UnsocketRequest) -> async AllowResponse;

                // NFTAnvil asks if an nft can be socketed
                nftanvil_socket_allow : query (request: Nft.SocketRequest) -> async AllowResponse;

                // App component asks for metadata specific to the app (use and hold effects).
                nftanvil_app_metadata : query (request: InfoRequest) -> async InfoResponse
        };

        public type UseRequest = {
                token:TokenIdentifier;
                aid:AccountIdentifier;
                memo:Nft.Memo;
                useId: Text;
        };
        
        public type InfoRequest = {
                app: ?Principal;
        };

        public type Info = {
                use: ?Nft.ItemUse;
                hold: ?Nft.ItemHold;
        };

        public type InfoResponse = Result.Result<Info, Text>

        public type UseResponse = Result.Result<(), Text>
        public type BurnResponse = Result.Result<(), Text>

        public type AllowResponse = Result.Result<
                (),
                {#Other: Text}
        >;
};
