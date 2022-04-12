import Nft "mo:anvil/type/nft_interface";
import Inventory "mo:anvil/lib/Inventory";

module {
        public type Interface = actor {
            
        };

        public type AccountRecord = {
                tokens : Inventory.Inventory;
        };

        public type AccountRecordSerialized = {
                tokens : [Nft.TokenIdentifier];  
        };

        public func AccountRecordSerialize(x : AccountRecord) : AccountRecordSerialized {
                {
                tokens = x.tokens.serialize();
                }
        };

        public func AccountRecordUnserialize(x:AccountRecordSerialized) : AccountRecord {
                {
                tokens = Inventory.Inventory(x.tokens);
                }
        };

        public func AccountRecordBlank() : AccountRecord {
                {
                tokens =  Inventory.Inventory([]);
                }
        };

        public type Basket = [?Nft.TokenIdentifier];
}