import Painless "mo:anvil/lib/Painless";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";

import Hex "mo:encoding/Hex";


shared ({caller}) actor class Renderer() = this {

    private stable var store : [var ?Text] = Array.init<?Text>(2500, null); // there is enough space for 50 groups with 50 features


    public shared func set(group:Nat, feature:Nat, data: Text) : async () {
        store[group * 50 + feature] := ?data;
    };

    private func get(x: [Nat8]) : Text {
 
        var group:Nat = 0;

        Array.foldRight<Nat8, Text>(x, "", func (feature:Nat8, acc) {
            
            let st = switch(store[group * 50 + Nat8.toNat(feature)]) {
                case (?a) a;
                case (_) "";
            };

            let r = acc # st;

            group += 1;

            return r;
        }) 

    };
   
    // Painless HTTP response - Start
    private func getChunk(key:Text, index:Nat) : Painless.Chunk {
        switch(httpKeyDecode(key)) {
            case (#ok((bytes))) { 
                //hi
                return #end( Text.encodeUtf8(get(bytes)) )
                 
            };
            case (#err(e)) {
                #none;
            }
        };
    };
    
    //Explained here: https://forum.dfinity.org/t/cryptic-error-from-icx-proxy/6944/15
    let _workaround = actor(Principal.toText(Principal.fromActor(this))): actor { http_request_streaming_callback : shared () -> async () };


    private func httpKeyDecode(key: Text) : Result.Result<[Nat8], Text> {
            switch(Hex.decode(Text.trimStart(key, #text("/")))) {
                    case (#ok(bytes)) {
                        #ok( bytes );
                    };
                    case (#err(e)) {
                    #err("Hex decode error " # e);
                    }
            }
    };

    public query func http_request(request : Painless.Request) : async Painless.Response {
     
        Painless.Request(request, {
            chunkFunc = getChunk;
            cbFunc = _workaround.http_request_streaming_callback;
            headers = [ ("Content-type", "image/svg+xml"), ("Cache-control", "public,max-age=31536000,immutable"), ("Access-Control-Allow-Origin","*") ] // ("Content-size", Nat32.toText(size)),
            });

    };
    
    public query func http_request_streaming_callback(token : Painless.Token) : async Painless.Callback {
      Painless.Callback(token, {
          chunkFunc = getChunk;
      });
    };
    // Painless HTTP response - End


}