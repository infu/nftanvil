import Nft "./nft_interface";
import Result "mo:base/Result";

module {

    public type FTokenId = Nft.FTokenId;

    public type Interface = actor {
        token_logistics : query (id: FTokenId) -> async FTLogistics;
        track_usage : shared (id: FTokenId, used: Int32 ) -> ();
    };

    public type FTLogistics = {
        transferable : Bool;
        fee : Nat64;
        account_creation_allowed : Bool;
    };


    public type FTOptions = {
        symbol : Text;
        name : Text;
        desc : Text;
        decimals : Nat8;
        max_accounts : Nat32;
        transferable : Bool;
        image : Blob;
        fee : Nat64;
    };

    public type FTMeta = {
        symbol : Text;
        name : Text;
        desc : Text;
        decimals : Nat8;
        transferable : Bool;
        fee : Nat64;
        total_supply: Nat64;
        mintable: Bool;
        accounts: Nat32;
    };

    public type FTokenInfo = ({
        controller : Principal;
        var total_supply : Nat64;
        var accounts : Nat32;
        var mintable : Bool;
    } and FTOptions);

    public type RegisterRequest = FTOptions;

    public type RegisterResponse = Result.Result<FTokenId, Text>;
}