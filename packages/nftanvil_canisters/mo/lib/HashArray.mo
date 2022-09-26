import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Debug "mo:base/Debug";

module {

  let maxSpread : Nat = 500;
  // How much positions ahead will it look for until giving up

  public func init<A, B>(size : Nat) : [var ?(A, B)] {
    Array.init<?(A, B)>(size + maxSpread, null);
  };

  public class HashArray<A, B>(
    size : Nat,
    arr : [var ?(A, B)],
    hash : (A) -> Nat32,
    equal : (A, A) -> Bool,
  ) {

    public func get(id : A) : ?B {
      var pos : Nat = Nat32.toNat(hash(id)) % (size - maxSpread);
      let end : Nat = pos + maxSpread;
      label lo while (pos < end) {
        switch (arr[pos]) {
          case (?el) {
            if (equal(el.0, id) == true) { return ?el.1 } else pos += 1;
          };
          case (null) pos += 1;
        };
      };
      null;
    };

    public func put(id : A, val : ?B) : () {
      var pos : Nat = Nat32.toNat(hash(id)) % (size - maxSpread);
      let end : Nat = pos + maxSpread;
      label lo while (pos < end) {
        switch (arr[pos]) {
          case (?el) {
            if (equal(el.0, id) == true) {
              // update a previous record
              switch (val) {
                case (?vv) arr[pos] := ?(id, vv);
                case (null) arr[pos] := null;
              };

              return ();
            };
            pos += 1;
          };
          case (null) {
            // create a new record
            switch (val) {
              case (?vv) arr[pos] := ?(id, vv);
              case (null)();
            };

            return ();
          };
        };
      };
      Debug.trap("Overloaded");
    };

  };
};
