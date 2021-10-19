import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat32";

import Nat "mo:base/Nat";

type Some = {var name:Text; var age:Nat};

  var _tmpChunk : [(Nat32, Some)] = [];
 var _chunk : HashMap.HashMap<Nat32, Some> = HashMap.fromIter(_tmpChunk.vals(), 0, Nat32.equal, func (x:Nat32) : Nat32 { x });
    
_chunk.put(0, {var name="Peter"; var age=20});


switch(_chunk.get(0)) {
    case (?a) {
        a.name := "Jo";
        Debug.print(debug_show(a));
    };
    case (_) {

    };
};   

switch(_chunk.get(0)) {
    case (?a) {
        Debug.print(debug_show(a));
    };
    case (_) {

    };
};   

Debug.print("FFFF");
// let player = { var name = "Joachim";  var points = 0 };

// Debug.print(
//   player.name # " has " #
//   Int.toText(player.points) # " points."
// );

// player.name := "Booo";

// Debug.print(
//   player.name # " has " #
//   Int.toText(player.points) # " points."
// );
// let now: Time.Time = 1476742925219947761; //Time.now();
//                  // 1634112005

// let x = Int.div(now, 1000000000);

// Debug.print("XXXXXX: "# Int.toText(x));
// Debug.print("XXXXXX: 1634112005");