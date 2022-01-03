import Nft "./nft_interface";

module {
       public type Interface = actor {
            add : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex, slot:Nat) -> async ();
            rem : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex, slot:Nat) -> async ();
            };
}