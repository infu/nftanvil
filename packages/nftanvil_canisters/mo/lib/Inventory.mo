import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

import Hash "mo:base/Hash";
import Buffer "mo:base/Buffer";
import Array_ "./Array";


module {

    public type TokenIdentifier = Nat64;
    public class Inventory(
        initial : [Nat64]
    )
    {

        var b : Buffer.Buffer<TokenIdentifier> = Array_.bufferFromArray(initial);

        public func serialize() : [TokenIdentifier] {
          b.toArray()
        };

        public func indexOf(v: TokenIdentifier) : ?Nat {
            let it = b.vals();
            var idx:Nat = 0;
            for (x in it) {
                if (Nat64.equal(x,v)) return ?idx;
                idx += 1;
            };
            return null;
        };

        public func add(v :TokenIdentifier) : () {
            switch(indexOf(v)) {
                case (?idx) {
                    ()
                };
                case (_) {
                    switch(indexOf(0)) {
                        case (?emptyIdx) {
                            b.put(emptyIdx,v)
                        };
                        case (null) {
                            b.add(v)
                        }
                    }
                }
            }
        };

        public func rem(v: TokenIdentifier) : () {
            switch(indexOf(v)) {
                case (?idx) {
                    b.put(idx, 0);
                };
                case (_) {
                    ()
                }
            }
        };

        public func list() : Iter.Iter<TokenIdentifier> {
            Iter.filter(b.vals(), func (v: TokenIdentifier) : Bool { v != 0 });
        };

    }

}