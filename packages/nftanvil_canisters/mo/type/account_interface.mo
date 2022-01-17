import Nft "./nft_interface";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat16 "mo:base/Nat16";

module {
       public type Interface = actor {
            add : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex) -> async ();
            rem : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex) -> async ();
            };

       // Global ID. Contains slot + tokenIndex. Can recreate TokenIdentifier when given map with slot -> canister ids
     //   public type Gid = Nat32;
     //   public module Gid = {
     //        public func equal(a: Gid, b:Gid) : Bool {
     //             Nat32.equal(a, b);
     //        };

     //        public func hash(x: Gid) : Hash.Hash {
     //             return x;
     //           //   let a = Nat32.bitshiftLeft(Nat32.fromNat(Nat64.toNat(x >> 32)),16);
     //           //   let b = Nat32.fromNat(Nat64.toNat( (x << 32) >> 32));
     //           //   a ^ b
     //        };

     //        public func toTokenIdentifier(space:[[Nat64]], gid:Gid) : Nft.TokenIdentifier {
     //                let slot:Nat16 = Nat16.fromNat(Nat32.toNat(gid >> 16));
     //                let idx:Nat32 = (gid << 16) >> 16; 
     //                let nftcan = Nft.APrincipal.fromSlot(space, slot);
     //                Nft.TokenIdentifier.encode(nftcan, idx);
     //        };

     //        public func fromTokenIdentifier(tidx:Nat32, slot:Nat16) : Gid {
     //                Nat32.fromNat(Nat16.toNat(slot))<<16 | tidx
     //        };
     //   };

}