import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat32 "mo:base/Nat32";

module {


    public func init<A,B>( tmp:[(A,[B])], equal: (A,A) -> Bool, hash: (A) -> Nat32, equalB: (B,B) -> Bool, hashB: (B) -> Nat32  ) : HashMap.HashMap<A, HashMap.HashMap<B, Bool>> {
        HashMap.fromIter(Iter.map<(A, [B]),(A, HashMap.HashMap<B, Bool>)>( tmp.vals(),   
            func ((ai:A, x:[B])): ((A,HashMap.HashMap<B, Bool>)) { 
            let it = Iter.map<B,(B, Bool)>(x.vals(), func(c:B): (B,Bool) { (c, true) });
            let z : HashMap.HashMap<B, Bool> = HashMap.fromIter<B,Bool>(it, 0, equalB, hashB);
            return (ai,z);
            }), 0, equal, hash);
    };

    public func pre<A,B>(vvv: HashMap.HashMap<A, HashMap.HashMap<B, Bool>>) : [(A,[B])] {
         Iter.toArray(
            Iter.map<(A, HashMap.HashMap<B, Bool>),(A, [B])>(
                vvv.entries(),
                func((a:A, x:HashMap.HashMap<B, Bool>)) : (A, [B]) { 
            (a, Iter.toArray(Iter.map<(B, Bool), B>(x.entries(), func((m:B, y:Bool)) : B { m })))
         }));
    };

    public func add<A>(vvv: HashMap.HashMap<A, HashMap.HashMap<Nat32, Bool>>, key:A, val:Nat32) : () {
         switch(vvv.get(key)) {
            case (?buf) {
               buf.put(val, true);
            };
            case (_) {
                let buf:HashMap.HashMap<Nat32, Bool> = HashMap.fromIter<Nat32,Bool>(Iter.fromArray([(val, true)]),0, Nat32.equal, func(x) {x});
                vvv.put(key, buf);
            }
        }
    };
    
    public func rem<A>(vvv: HashMap.HashMap<A, HashMap.HashMap<Nat32, Bool>>, key:A, val:Nat32) : () {
         switch(vvv.get(key)) {
            case (?buf) {
               buf.delete(val);
            };
            case (_) {
                ()
            }
        }
    };

    public func list<A>(vvv: HashMap.HashMap<A, HashMap.HashMap<Nat32, Bool>>, key:A) : Iter.Iter<(Nat32)> {
        switch(vvv.get(key)) {
            case (?buf) {
               Iter.map<(Nat32,Bool),Nat32>(buf.entries(), func((x:Nat32,b:Bool)): Nat32 { x } );
            };
            case (_) {
                Iter.fromArray([]);
            }
        }
    };

}