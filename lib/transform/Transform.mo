import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Nat "mo:base/Nat";
import Char "mo:base/Char";

 module {
    public func nat32ToBytes (n : Nat32) : [Nat8] {
        [Nat8.fromNat( Nat32.toNat((n >> 24) & 255)),
        Nat8.fromNat( Nat32.toNat((n >> 16) & 255)),
        Nat8.fromNat( Nat32.toNat((n >> 8) & 255)),
        Nat8.fromNat( Nat32.toNat(n & 255))]
    };

    public func bytesToNat32(bytes: [Nat8]) : Nat32{
            (Nat32.fromNat(Nat8.toNat(bytes[0])) << 24) +
            (Nat32.fromNat(Nat8.toNat(bytes[1])) << 16) +
            (Nat32.fromNat(Nat8.toNat(bytes[2])) << 8) +
            (Nat32.fromNat(Nat8.toNat(bytes[3])));
    };


    public func TextToBlob (txt:Text) : Blob {
        Blob.fromArray(Array.flatten(Array.map(Iter.toArray(Text.toIter(txt)), func(x : Char) : [Nat8] { nat32ToBytes(Char.toNat32(x)) })))
    };


    public func blobToText (b:Blob) : Text {
        bytesToText(Blob.toArray(b));
    };

    public func bytesToText(_bytes : [Nat8]) : Text{
        var result : Text = "";
        var aChar : [var Nat8] = [var 0, 0, 0, 0];

        for(thisChar in Iter.range(0,_bytes.size())){
            if(thisChar > 0 and thisChar % 4 == 0){
                aChar[0] := _bytes[thisChar-4];
                aChar[1] := _bytes[thisChar-3];
                aChar[2] := _bytes[thisChar-2];
                aChar[3] := _bytes[thisChar-1];

                result := result # Char.toText(Char.fromNat32(bytesToNat32(Array.freeze<Nat8>(aChar))));
            };
        };
        return result;
    };
}