import Nft "./nft_interface";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat16 "mo:base/Nat16";
import Inventory "../lib/Inventory";

module {
     
     public type Interface = actor {
          add : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex) -> async ();
          rem : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex) -> async ();
          add_transaction : shared (aid: Nft.AccountIdentifier, tx: Nft.TransactionId) -> async ();
          meta : query (aid: Nft.AccountIdentifier) -> async ?AccountMeta;
     };

     public type TokenIdentifier = Nft.TokenIdentifier;

     public type AddressInfo = {
          name : Text;
          avatar : TokenIdentifier;
          background : TokenIdentifier;
     };

     public type AccountRecord = {
          tokens : Inventory.Inventory;
          var info : ?AddressInfo;
          var transactions : [Nft.TransactionId]
     };

     public type AccountRecordSerialized = {
          tokens : [TokenIdentifier];
          info : ?AddressInfo;
          transactions : [Nft.TransactionId]
     };

     public type AccountMeta = {
          info : ?AddressInfo;
          transactions : [Nft.TransactionId]
     };

     public func AccountRecordSerialize(x : AccountRecord) : AccountRecordSerialized {
          {
               tokens = x.tokens.serialize();
               info = x.info;
               transactions = x.transactions;
          }
     };

     public func AccountRecordUnserialize(x:AccountRecordSerialized) : AccountRecord {
          {
               tokens = Inventory.Inventory(x.tokens);
               var info = x.info;
               var transactions = x.transactions;
          }
     };

     public func AccountRecordBlank() : AccountRecord {
          {
               tokens =  Inventory.Inventory([]);
               var info = null;
               var transactions = [];
          }
     };
     

}