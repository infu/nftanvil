import Nft "./nft_interface";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

module {
       public type Interface = actor {
            add : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex, slot:Nat) -> async ();
            rem : shared (aid: Nft.AccountIdentifier, idx:Nft.TokenIndex, slot:Nat) -> async ();
            };

       // Global ID. Contains slot + tokenIndex. Can recreate TokenIdentifier when given map with slot -> canister ids
       public type Gid = Nat64;
       public module Gid = {
            public func equal(a: Gid, b:Gid) : Bool {
                 Nat64.equal(a, b);
            };

            public func hash(x: Gid) : Hash.Hash {
                 let a = Nat32.bitshiftLeft(Nat32.fromNat(Nat64.toNat(x >> 32)),16);
                 let b = Nat32.fromNat(Nat64.toNat( (x << 32) >> 32));
                 a ^ b
            };

            public func toTokenIdentifier(gid:Gid, cans:[Principal]) : Nft.TokenIdentifier {
                    let slot:Nat = Nat64.toNat(gid >> 32);
                    let idx:Nat32 = Nat32.fromNat(Nat64.toNat( (gid << 32) >> 32 )); 
                    let nftcan = cans[slot];
                    Nft.TokenIdentifier.encode(nftcan, idx);
            };

            public func fromTokenIdentifier(tidx:Nat32, slot:Nat) : Gid {
                    Nat64.fromNat(slot)<<32 | Nat64.fromNat(Nat32.toNat(tidx))
            };
       };

}