import Iter "mo:base/Iter";
import TrieMap "mo:base/TrieMap";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";

module {

    public class TrieRecord<K, R, S>(
        initial : Iter.Iter<(K, S)>,
        keyEq : (K, K) -> Bool,
        keyHash : K -> Hash.Hash,
        recSerialize: R -> S,
        recUnserialize: S -> R)
    {

        var h: TrieMap.TrieMap<K, R> = TrieMap.fromEntries(
            Iter.map<(K,S),(K,R)>(initial, func( (k,s) : (K,S) ) : (K,R) { (k, recUnserialize(s)) }),
            keyEq,
            keyHash);

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
        

        public func keys() : Iter.Iter<K> {
            h.keys();
        };

        public func delete(k : K) : () {
            h.delete(k)
        }

    }

}