import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat32 "mo:base/Nat32";
import Hash_ "mo:base/Hash";

module {

    public type Hash = Hash_.Hash;

    public func init<A,B>( tmp:[(A,[B])], equal: (A,A) -> Bool, hash: (A) -> Hash, equalB: (B,B) -> Bool, hashB: (B) -> Hash  ) : HashMap.HashMap<A, HashMap.HashMap<B, Bool>> {
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

    public func add<A,B>(vvv: HashMap.HashMap<A, HashMap.HashMap<B, Bool>>, key:A, val:B, equalB: (B,B) -> Bool, hashB: (B) -> Hash) : () {
         switch(vvv.get(key)) {
            case (?buf) {
               buf.put(val, true);
            };
            case (_) {
                let buf:HashMap.HashMap<B, Bool> = HashMap.fromIter<B,Bool>(Iter.fromArray([(val, true)]),0, equalB, hashB);
                vvv.put(key, buf);
            }
        }
    };
    
    public func rem<A,B>(vvv: HashMap.HashMap<A, HashMap.HashMap<B, Bool>>, key:A, val:B) : () {
         switch(vvv.get(key)) {
            case (?buf) {
               buf.delete(val);
            };
            case (_) {
                ()
            }
        }
    };

    public func list<A,B>(vvv: HashMap.HashMap<A, HashMap.HashMap<B, Bool>>, key:A) : Iter.Iter<(B)> {
        switch(vvv.get(key)) {
            case (?buf) {
               Iter.map<(B,Bool),B>(buf.entries(), func((x:B,b:Bool)): B { x } );
            };
            case (_) {
                Iter.fromArray([]);
            }
        }
    };

}