import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat32";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Ext "../mo/type/nft_interface";

import Nat "mo:base/Nat";
import Hash "../mo/lib/Hash";

let p = Principal.fromText("qirxu-7bfb3-xxjvc-f2ixd-rnz2w-qwget-pryco-ssrzg-wtl7i-ka6t6-cqe");
let a = Ext.AccountIdentifier.fromText("D1B158C1E1B8376761295F759F8907E29E10AAF6F556D7F90BE2C580A2E42DA1");
let c = Ext.AccountIdentifier.fromPrincipal(Principal.fromText("qirxu-7bfb3-xxjvc-f2ixd-rnz2w-qwget-pryco-ssrzg-wtl7i-ka6t6-cqe"), null);

Debug.print("User john Account Identifier a: " # Ext.AccountIdentifier.toText(Ext.User.toAccountIdentifier(#principal(p))));

Debug.print("User john Account Identifier b: " # Ext.AccountIdentifier.toText(a));

Debug.print("User john Account Identifier c: " # Ext.AccountIdentifier.toText(c));
