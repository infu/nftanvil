import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";



module {
    public func size<A>(a:[A]) : Nat {
        return Iter.size(Iter.fromArray(a))
    };

    public func amap<B>(count: Nat, f: (Nat) -> B) : [B] {
        Iter.toArray(Iter.map(Iter.range(0, count-1), f));
        };


 }