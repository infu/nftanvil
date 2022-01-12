import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Nat16 "mo:base/Nat16";
import Nat8 "mo:base/Nat8";
import Nat "mo:base/Nat";
import Char "mo:base/Char";

 module {

    public func intToBytes(n: Int) : [Nat8] {
        nat64ToBytes( Nat64.fromIntWrap(n) )
    };

    public func nat64ToBytes(n:Nat64) : [Nat8] {
        [Nat8.fromNat( Nat64.toNat((n >> 56) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 48) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 40) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 32) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 24) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 16) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 8) & 255)),
        Nat8.fromNat( Nat64.toNat((n >> 0) & 255))
        ]
    };

    public func bytesToNat64(x:[Nat8]) : Nat64 {
        Array.foldLeft<Nat8, Nat64>(x, 0, func( b:Nat64,a:Nat8):Nat64 { 
                  (b << 8) | (Nat64.fromNat(Nat8.toNat(a)))
              });
    };

    public func bytesToNat32(x:[Nat8]) : Nat32 {
        Array.foldLeft<Nat8, Nat32>(x, 0, func( b:Nat32,a:Nat8):Nat32 { 
                  (b << 8) | (Nat32.fromNat(Nat8.toNat(a)))
              });
    };


    public func nat32ToBytes (n : Nat32) : [Nat8] {
        [Nat8.fromNat( Nat32.toNat((n >> 24) & 255)),
        Nat8.fromNat( Nat32.toNat((n >> 16) & 255)),
        Nat8.fromNat( Nat32.toNat((n >> 8) & 255)),
        Nat8.fromNat( Nat32.toNat(n & 255))]
    };

    public func nat16ToBytes (n : Nat16) : [Nat8] {
        [Nat8.fromNat( Nat16.toNat((n >> 8) & 255)),
        Nat8.fromNat( Nat16.toNat(n & 255))]
    };

    public func textToBlob (txt:Text) : Blob {
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