module {

    public type FTInfo {
        symbol: Text; // Up to 10
        name: Text; // Up to 30 chars
        decimals: Nat8; // ~10 for normal tokens
        total_supply: Nat64; // max - 18 446 744 073 709 551 615
        fee: Nat64;
        
        controller: Principal;
        minting_enabled: Bool;

    };

}