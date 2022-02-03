import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";



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


    public func bufferFromArray<A>(x: [A]) : Buffer.Buffer<A> {
        let len = size(x);
        let buff = Buffer.Buffer<A>(len);
        
        let it = x.vals();

        for (el in it) {
            buff.add(el);
        };

        return buff;
    };

    public func concat<A>(xs : [A], ys : [A]) : [A] {
        switch(xs.size(), ys.size()) {
        case (0, 0) { []; };
        case (0, _) { ys; };
        case (_, 0) { xs; };
        case (xsSize, ysSize) {
            Array.tabulate<A>(xsSize + ysSize, func (i : Nat) : A {
            if (i < xsSize) {
                xs[i];
            } else {
                ys[i - xsSize];
            };
            });
        };
        };
    };
 }