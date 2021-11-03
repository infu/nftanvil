import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";

import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Ext "../src/ic/lib/ext.std/src/Ext";
import Interface "../src/ic/lib/ext.std/src/Interface";
import Array_ "../src/ic/lib/vvv/src/Array";

import AccessControl "../src/ic/accesscontrol/access";
import PseudoRandom "../src/ic/lib/vvv/src/PseudoRandom";



let access = await AccessControl.AccessControl({_admin = Principal.fromText("aaaaa-aa") });

let x = PseudoRandom.PseudoRandom();

var a  = 0;
while (a < 5) {
    Debug.print(Nat32.toText(x.get(16)));
    a := a + 1;
};

Debug.print("PseudoRandom is ok");