import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";

import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Ext "../mo/type/nft_interface";
import Array_ "../mo/lib/Array";

import PseudoRandom "../mo/lib/PseudoRandom";


// let access = await AccessControl.AccessControl({_admin = Principal.fromText("aaaaa-aa") });

let x = PseudoRandom.PseudoRandom();

var a  = 0;
while (a < 5) {
    Debug.print(Nat32.toText(x.get(16)));
    a := a + 1;
};

Debug.print("PseudoRandom is ok");