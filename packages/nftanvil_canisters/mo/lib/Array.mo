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

    public func exists<A>(xs:[A], search:A, equal: (A,A) -> Bool) : Bool {
        switch(Array.find<A>(xs : [A], func(b:A) : Bool {
            equal(b,search)
         })) {
            case (?x) true;
            case (null) false 
        }
    };

    private func index<A>(list:[A], search:A, equal: (A,A) -> Bool) : ?Nat {
        var found:?Nat = null;
        Iter.iterate<A>(Iter.fromArray(list), func (x, index) {
            if (equal(search, x)) found := ?index;
        });
        return found;
    };

 }