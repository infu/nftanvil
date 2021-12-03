import Error "mo:base/Error";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module {
    public type Chunk = {
        #more : Blob;
        #end : Blob;
        #none;
    };

    public type HeaderField = (Text, Text);

    public type Request = {
        method: Text;
        url: Text;
        headers: [HeaderField];
        body: Blob; 
    };

    public type Callback = {
        token : ?Token;
        body : Blob; 
    };

    public type Token = {
        key : Text;
        sha256 : ?[Nat8];
        index : Nat;
        content_encoding : Text;
    };

    public type CallbackFunc = shared () -> async ();

    public type StreamingStrategy = {
        #Callback : {
        token : Token;
        callback : CallbackFunc;
        };
    };

    public type Response = {
        body : Blob;
        headers : [HeaderField];
        streaming_strategy : ?StreamingStrategy;
        status_code : Nat16;
    };

    public type ChunkFunc = (Text, Nat) -> Chunk;

    public func NotFound(t:Text) : Response {
            {
                body               = Text.encodeUtf8("Not found " # t);
                headers            = [];
                streaming_strategy = null;
                status_code        = 404;
               }
    };

    public func Request(request : Request, {chunkFunc:ChunkFunc; cbFunc: CallbackFunc; headers: [HeaderField] }) :  Response {

        switch(chunkFunc(request.url, 0)) {
            case (#more(data)) {    // more chunks to follow
                {
                body               = data;
                headers            = headers;
                streaming_strategy = ?#Callback({
                    token = {
                        key = request.url;
                        sha256 = null;
                        index = 1;
                        content_encoding = "";
                    };
                    callback = cbFunc;
                });
                status_code        = 200;
                }
            };
            case (#end(data)) {    // last chunk
                {
                body               = data;
                headers            = headers;
                streaming_strategy = null;
                status_code        = 200;
               }
            };
            case (#none()) {        // no chunks at all
               NotFound(request.url);
            }
        }
  
    };

    public func Callback(token : Token, {chunkFunc:ChunkFunc}) : Callback { 

        switch(chunkFunc(token.key, token.index)) {
            case (#more(data)) {    // more chunks to follow
                {
                body               = data;
                token = ?{
                    key = token.key;
                    sha256 = null;
                    index = token.index + 1;
                    content_encoding = "";
                    };
                }
            };
            case (#end(data)) {    // last chunk
                {
                body               = data;
                token = null
               }
            };
            case (#none()) {        // no chunks at all
                assert(false);
                {body = Text.encodeUtf8(""); token = null} // If you know how to get rid of this nonsense here, please make pull request or tell me in discord #infu
            }
        }
            
    };

}