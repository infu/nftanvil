import Prim "mo:prim"; 
import Nat32 "mo:base/Nat32"; 
import Text "mo:base/Text"; 

 
 module {

    public func djb2xor(t : Text) : Nat32 {
        var x : Nat32 = 5381;
        for (char in t.chars()) {
            let c : Nat32 = Prim.charToNat32(char);
            // x := ((x << 5) +% x) +% c;
            x := (x *% 33) ^ c
        };
        return x
    };

 }