import Nft "./nft_interface";
import Result "mo:base/Result";

module {

    public type FTokenId = Nft.FTokenId;

    public type Interface = actor {
        token_logistics : query (id: FTokenId) -> async FTLogistics;
        register : shared (RegisterRequest) -> async RegisterResponse;
        mint : shared (MintRequest) -> async MintResponse;

    };
    public type MintRequest = {id: FTokenId; aid: Nft.AccountIdentifier; amount:Nat64; mintable:Bool};
    public type MintResponse = Result.Result< {transactionId : Blob}, Text>;
    public type FTLogistics = {
        transferable : Bool;
        fee : Nat64;
        kind: FTKind;
        decimals : Nat8;
    };

    public type FTShort = {
        id: FTokenId;
        name : Text;
        transferable : Bool;
        symbol : Text;
        kind: FTKind;
        controller: Principal;
        origin: Text;
    };

    public type FTKind = {
        #fractionless;
        #normal
        };

    public type FTOptions = {
        kind: FTKind;
        origin: Text;
        symbol : Text;
        name : Text;
        desc : Text;
        decimals : Nat8;
        transferable : Bool;
        image : Blob;
        fee : Nat64;
        controller: Principal;
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
        kind: FTKind;
        origin: Text;
        controller: Principal;
    };

    public type FTokenInfo = ({
        controller : Principal;
        var total_supply : Nat64;
        var mintable : Bool;
    } and FTOptions);

    public type RegisterRequest = FTOptions;

    public type RegisterResponse = Result.Result<FTokenId, Text>;
}