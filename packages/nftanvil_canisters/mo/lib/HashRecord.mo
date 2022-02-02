import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";

module {

    public class HashRecord<K, R, S>(
        initial : Iter.Iter<(K, S)>,
        keyEq : (K, K) -> Bool,
        keyHash : K -> Hash.Hash,
        recSerialize: R -> S,
        recUnserialize: S -> R)
    {

        var h: HashMap.HashMap<K, R> = HashMap.fromIter(Iter.map<(K,S),(K,R)>(initial, func( (k,s) : (K,S) ) : (K,R) {
            (k, recUnserialize(s))
        }), 0, keyEq, keyHash);

        public func serialize() : Iter.Iter<(K, S)> {
            Iter.map<(K,R), (K,S)>(h.entries(), func((k, r) : (K,R)) : (K, S) {
                (k, recSerialize(r))
            });
        };

        public func get(k: K) : ?R {
            h.get(k)
        };

        public func put(k : K, r : R) : () {
            h.put(k, r);
        };
        
        public func delete(k : K) : () {
            h.delete(k)
        }

    }

}