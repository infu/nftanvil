import Nft "./nft_interface";
import Result "mo:base/Result";

module {
        public type Interface = actor {

                // NFTAnvil asks if a principal is allowed to mint and 
                author_allow : query (author: Nft.AccountIdentifier, classId: Nft.CollectionId) -> async AllowResponse;

                mint_nextId : shared (author: Nft.AccountIdentifier, classId: Nft.CollectionId) -> async MintNextIdResponse;

                // NFTAnvil asks if an nft can be socketed
                socket_allow : query (request: Nft.SocketRequest, classId:Nft.CollectionId) -> async AllowResponse;

                info : query (classId: Nft.CollectionId) -> async InfoResponse;
        };

        public type InfoResponse = Result.Result<
                Nft.Collection,
                {
                        #NotFound;
                }
        >;
        
        public type MintNextIdResponse = Result.Result<
                Nft.CollectionIndex,
                Text
        >;

        public type AllowResponse = Result.Result<
                (),
                Text
        >;
};
