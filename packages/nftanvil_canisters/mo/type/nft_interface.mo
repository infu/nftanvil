import Array "mo:base/Array";
import Array_ "mo:array/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import SHA256 "mo:sha/SHA256";
import Hash "mo:base/Hash";
import Hex "mo:encoding/Hex";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Blob_ "../lib/Blob";


module {
    public type Interface = actor {

        // Returns the balance of a requested User.
        balance    : query (request : BalanceRequest) -> async BalanceResponse;
        // Returns an array of extensions that the canister supports.

        // Transfers an given amount of tokens between two users, from and to, with an optional memo.
        transfer   : shared (request : TransferRequest) -> async TransferResponse;

        // Returns the metadata of the given token.
        metadata : query (token :  TokenIdentifier) -> async  MetadataResponse;
        // Returns the total supply of the token.
        supply   : query (token :  TokenIdentifier) -> async  SupplyResponse;

        // Returns the account that is linked to the given token.
        bearer  : query (token :  TokenIdentifier) -> async BearerResponse;
        // Mints a new NFT and assignes its owner to the given User.
        mintNFT : shared (request :  MintRequest) -> async  MintResponse;

        // Returns the amount which the given spender is allowed to withdraw from the given owner.
        allowance : query (request : Allowance.Request) -> async Allowance.Response;
        // Allows the given spender to withdraw from your account multiple times, up to the given allowance.
        approve   : shared (request : Allowance.ApproveRequest) -> async Allowance.ApproveResponse;
    };

    public type AccountIdentifier = Blob; //32 bytes
    public type AccountIdentifierShort = Blob; //28bytes

    public func OptValid<A>(v:?A, f: (A) -> Bool) : Bool {
        switch(v) { case (?z) f(z); case(null) true }
    };

    public module AccountIdentifier = { // Most AccountIdentifier code is collected from aviate-labs libraries
        private let prefix : [Nat8] = [10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100];

        public func validate(a: AccountIdentifier) : Bool {
            a.size() == 32;
        };

        public func fromText(accountId : Text) : AccountIdentifier {
            switch (Hex.decode(accountId)) {
                case (#err(e)) { assert(false); Blob.fromArray([]); };
                case (#ok(bs)) {
                    Blob.fromArray(bs);
                };
            };
        };

        public func toShort(accountId : AccountIdentifier) : AccountIdentifierShort {
            Blob.fromArray(Array_.drop<Nat8>(Blob.toArray(accountId), 4));
        };

        public func fromShort(accountId: AccountIdentifierShort) : AccountIdentifier {
            Blob.fromArray(Array.append<Nat8>(
                Binary.BigEndian.fromNat32(CRC32.checksum(Blob.toArray(accountId))),
                Blob.toArray(accountId),
            ))
        };

        public func toText(accountId : AccountIdentifier) : Text {
            let t = Hex.encode(Blob.toArray(accountId));
            Text.translate(t, func (c:Char) : Text {
                    Text.fromChar(switch (c) {
                        case ('A') 'a';
                        case ('B') 'b';
                        case ('C') 'c';
                        case ('D') 'd';
                        case ('E') 'e';
                        case ('F') 'f';
                        case (_) c; 
                    });
             });
        };

        public func slot(accountId : AccountIdentifier, max:Nat) : Nat {
            let bl = Blob.toArray(accountId);
            let (rawPrefix, rawToken) = Array_.split(bl, 4);

            let crc = Blob_.bytesToNat32(rawPrefix);

            Nat32.toNat( crc  % Nat32.fromNat(max) );
        };

        public func equal(a : AccountIdentifier, b : AccountIdentifier) : Bool {
            a == b
        };

        public func hash(accountId : AccountIdentifier) : Hash.Hash {
            CRC32.checksum(Blob.toArray(accountId));
        };

        public func fromPrincipal(p : Principal, subAccount : ?SubAccount) : AccountIdentifier {
            fromBlob(Principal.toBlob(p), subAccount);
        };

        public func fromBlob(data : Blob, subAccount : ?SubAccount) : AccountIdentifier {
            fromArray(Blob.toArray(data), subAccount);
        };

    

        public func fromArray(data : [Nat8], subAccount : ?SubAccount) : AccountIdentifier {
            let account : [Nat8] = switch (subAccount) {
                case (null) { Array.freeze(Array.init<Nat8>(32, 0)); };
                case (?sa)  { Blob.toArray(sa); };
            };
            
            let inner = SHA256.sum224(Array.flatten<Nat8>([prefix, data, account]));

            Blob.fromArray(Array.append<Nat8>(
                Binary.BigEndian.fromNat32(CRC32.checksum(inner)),
                inner,
            ));
        };

        public func purchaseAccountId(can:Principal, tokenIndex:Nat32, accountId: AccountIdentifier) : (AccountIdentifier, SubAccount) {
        
            let subaccount = Blob.fromArray(Array.append<Nat8>(
                Blob_.nat32ToBytes(tokenIndex),
                Blob.toArray(toShort(accountId))
            )); 

            (fromPrincipal(can, ?subaccount), subaccount);
        };
    };
    public type SubAccount = Blob; //32 bytes

    public module SubAccount = {
        public func fromNat(idx: Nat) : SubAccount {
            Blob.fromArray(Array.append<Nat8>(
                Array.freeze(Array.init<Nat8>(24, 0)),
                Blob_.nat64ToBytes(Nat64.fromNat(idx))
                ));
            };
    };

    // Balance refers to an amount of a particular token.
    public type Balance = Nat64;

    public type CommonError = {
        #InvalidToken : TokenIdentifier;
        #Other        : Text;
    };

    public type Memo = Nat64;

    // A unique id for a particular token and reflects the canister where the 
    // token resides as well as the index within the tokens container.
    public type TokenIdentifier = Text;
    public type TokenIdentifierBlob = Blob;

    public module TokenIdentifier = {
        private let prefix : [Nat8] = [10, 116, 105, 100]; // \x0A "tid"
     
        public func encode(canisterId : Principal, tokenIndex : TokenIndex) : Text {
            let rawTokenId = Array.flatten<Nat8>([
                prefix,
                Blob.toArray(Principal.toBlob(canisterId)),
                Binary.BigEndian.fromNat32(tokenIndex),
            ]);
            
            Principal.toText(Principal.fromBlob(Blob.fromArray(rawTokenId)));
        };

        public func decode(tokenId : TokenIdentifier) : Result.Result<(Principal, TokenIndex), Text> {
            let bs = Blob.toArray(Principal.toBlob(Principal.fromText(tokenId)));
            let (rawPrefix, rawToken) = Array_.split(bs, 4);
            if (rawPrefix != prefix) return #err("invalid prefix");
            let (rawCanister, rawIndex) = Array_.split(rawToken, rawToken.size() - 4 : Nat);
            #ok(
                Principal.fromBlob(Blob.fromArray(rawCanister)),
                Binary.BigEndian.toNat32(rawIndex),
            );
        };

        public func toBlob(tokenId : TokenIdentifier) : TokenIdentifierBlob {
            let bl = Principal.toBlob(Principal.fromText(tokenId));
        };

        public func validate(tokenId : TokenIdentifier) : Bool {
            let bl = toBlob(tokenId);
            if (bl.size() > 100) return false;
            let bs = Blob.toArray(bl);
            let (rawPrefix, rawToken) = Array_.split(bs, 4);
            if (rawPrefix != prefix) return false;
            return true;
            
        };

        public func fromBlob(b:TokenIdentifierBlob) : Text {
            Principal.toText(Principal.fromBlob(b));
        };
    };

    // Represents an individual token's index within a given canister.
    public type TokenIndex = Nat32;

    public module TokenIndex = {
        public func equal(a : TokenIndex, b : TokenIndex) : Bool { a == b; };

        public func hash(a : TokenIndex) : Hash.Hash { a; };
    };

    public type User = {
        #address   : AccountIdentifier;
        #principal : Principal;
    };

    public module User = {
        public func validate(u:User) : Bool {
            switch (u) {
                case (#address(address)) { AccountIdentifier.validate(address); };
                case (#principal(principal)) {
                    true
                };
            };
        };

        public func equal(a : User, b : User) : Bool {
            let aAddress = toAccountIdentifier(a);
            let bAddress = toAccountIdentifier(b);
            AccountIdentifier.equal(aAddress, bAddress);
        };

        public func hash(u : User) : Hash.Hash {
            AccountIdentifier.hash(toAccountIdentifier(u));
        };

        public func toAccountIdentifier(u : User) : AccountIdentifier {
            switch (u) {
                case (#address(address)) { address; };
                case (#principal(principal)) {
                    AccountIdentifier.fromPrincipal(principal, null);
                };
            };
        };
    };


    public type BalanceRequest = { 
        user  : User; 
        token : TokenIdentifier;
    };

    public type BalanceResponse = Result.Result<
        Balance,
        CommonError
    >;

    public type BurnRequest = {
        user       : User;
        token      : TokenIdentifier;
        amount     : Balance;
        memo       : Memo;
        subaccount : ?SubAccount;
    };
    
    public type TransferRequest = {
        from       : User;
        to         : User;
        token      : TokenIdentifier;
        amount     : Balance;
        memo       : Memo;
        subaccount : ?SubAccount;
    };

    public type UseRequest = {
        user       : User;
        subaccount : ?SubAccount;
        token      : TokenIdentifier;
        memo       : Memo;
    };
    
    public type TransferLinkRequest = {
        from       : User;
        hash       : Blob;
        token      : TokenIdentifier;
        amount     : Balance;
        subaccount : ?SubAccount;
    };

    public type TransferResponse = Result.Result<Balance, {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #NotTransferable;
        #InvalidToken : TokenIdentifier;
        #CannotNotify : AccountIdentifier;
        #Other        : Text;
    }>;

    public type BurnResponse = TransferResponse;

    public type UseResponse = Result.Result<{
        #consumed;
        #cooldown: Nat32;
    }, {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #InvalidToken : TokenIdentifier;
        #OnCooldown;
        #ExtensionError: Text;
        #Other        : Text;
    }>;

    public type TransferLinkResponse = Result.Result<Nat32, {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #InvalidToken : TokenIdentifier;
        #Other        : Text;
    }>;

    public type ClaimLinkRequest = {
        to         : User;
        key        : Blob;
        token      : TokenIdentifier;
    };

    public type ClaimLinkResponse = Result.Result<(), {
        #Rejected; // We wont supply a possible attacker with various errors
        #Other: Text
        }>;


    public type CustomId = Text;
    public module CustomId = {
        public func validate(t : CustomId) : Bool {
            t.size() <= 32 //TODO: Make real domain name verification.
        } 
    };

    public type Chunks = [Nat32];

    public type ContentType = Text;
    public module ContentType = {
        public func validate(t : ContentType) : Bool {
            t.size() <= 32 //TODO: Make real domain name verification.
        } 
    };
    public type IPFS_CID = Text;
    public module IPFS_CID = {
        public func validate(t : IPFS_CID) : Bool {
            t.size() <= 64
        } 
    };
    public type ExternalRenderer = Principal;
    public type Content = {
        #ipfs: {
            contentType: ContentType;
            size: Nat32;
            cid: IPFS_CID;
            };
        #internal: {
            contentType: ContentType;
            size: Nat32;
            };
        #external: {
            contentType: ContentType;
            idx: Nat32;
            };
        };

    public module Content = {
        public func validate(x : Content) : Bool {
            switch(x) {
                case (#internal({contentType; size})) {
                    ContentType.validate(contentType)
                };
                case (#external({contentType; idx})) {
                        ContentType.validate(contentType)
                };
                case (#ipfs({contentType; cid})) {
                        ContentType.validate(contentType)
                        and IPFS_CID.validate(cid)
                }
            }
        }
    };

    public type EffectDesc = Text;
    public module EffectDesc = {
        public func validate(t : EffectDesc) : Bool {
            t.size() <= 256
        }
    };

    public type Cooldown = Nat32;
    public module Cooldown = {
        public func validate(t: Cooldown) : Bool {
            (t > 30) 
        }
    };

    public type ItemUse = {
        #cooldown: {
            desc: EffectDesc;
            duration: Cooldown;
            useId: CustomId;
        };

        #consumable : {
            desc: EffectDesc;
            useId: CustomId;
        };
    };
    
    public module ItemUse = {
        public func validate(t : ItemUse) : Bool {
            switch(t) {
                case (#cooldown({desc; duration; useId})) {
                    CustomId.validate(useId) and EffectDesc.validate(desc) and Cooldown.validate( duration )
                };
                case (#consumable({desc; useId})) {
                    CustomId.validate(useId) and EffectDesc.validate(desc)
                }
            }
        }
    };

    public type ItemHold = {
        #external: {
        desc: EffectDesc;
        holdId: CustomId;
        }
    };

    public module ItemHold = {
        public func validate(t : ItemHold) : Bool {
            switch(t) {
                case (#external({desc; holdId})) {
                    CustomId.validate(holdId) and EffectDesc.validate(desc)
                };
            }
        }
    };

    public type ItemTransfer = {
        #unrestricted;
        #bindsForever;
        #bindsDuration: Nat32;
    };

    public type Attribute = (Text, Nat16);
    public module Attribute = {
        public func validate((a,n) : Attribute) : Bool {
            (a.size() <= 24)
        }
    };

    public type Attributes = [Attribute];
    public module Attributes = {
        public func validate(x : Attributes) : Bool {
            Iter.size(Iter.fromArray(x)) <= 10
            and
            Array.foldLeft(x, true, func (valid:Bool, val:Attribute) : Bool { 
                valid and Attribute.validate(val);
            })
        }
    };

    public type Sockets = [TokenIdentifierBlob];
    public module Sockets = {
        public func validate(x : Sockets) : Bool {
            Iter.size(Iter.fromArray(x)) <= 10
        }
    };

    public type Tags = [Tag];
    public module Tags = {
        public func validate(x : Tags) : Bool {
            Iter.size(Iter.fromArray(x)) <= 10
            and
            Array.foldLeft(x, true, func (valid:Bool, val:Tag) : Bool {
                valid and Tag.validate(val);
            })
        }
    };

    public type Tag = Text;
    public module Tag = {
        public func validate(t : Tag) : Bool {
            t.size() <= 24
        }
    };

    public type ItemName = Text;
    public module ItemName = {
        public func validate(t : ItemName) : Bool {
            t.size() <= 96
        }
    };

    public type ItemLore = Text;
    public module ItemLore = {
        public func validate(t : ItemLore) : Bool {
            t.size() <= 256
        }
    };

    public type DomainName = Text;
    public module DomainName = {
        public func validate(t : DomainName) : Bool {
            t.size() <= 64 //TODO: Make real domain name verification.
        }
    };
    public type Share = Nat16;
    public module Share = {
        public let NFTAnvilShare:Nat = 50; // 0.5%
        public let LimitMarketplace:Nat = 3000; // 30%
        public let LimitMinter:Nat = 200; // 2%
        public let Max : Nat = 10000; // 100%

        public func validate(t : Share) : Bool {
            t >= 0 and t <= Nat16.fromNat(Max);
        };

        public func limit(s: Share, max:Nat) : Nat {
           let c = Nat16.toNat(s);
           if (c > max) return max;
           return c;
        };
    };
    
    public type AnvilClassId = Nat32;

    public type AnvilClassStored = {
        domain: ?DomainName;
        minters: [AccountIdentifier];
        socketable:[AnvilClassId];
        max: Nat32;
        var lastIdx: Nat32;
    };

    public type AnvilClassIndex = Nat32;

    public type AnvilClass = {
        domain: ?DomainName;
        minters: [AccountIdentifier];
        socketable:[AnvilClassId];
        max: AnvilClassIndex;
        lastIdx: AnvilClassIndex;
    };

    public type Metadata = {
        classId: ?AnvilClassId;
        classIndex: ?AnvilClassIndex;
        name: ?ItemName;
        lore: ?ItemLore;
        quality: Nat8;
        transfer: ItemTransfer;
        ttl: ?Nat32; // time to live
        minter: AccountIdentifier;
        minterShare: Share; // min 0 ; max 10000 - which is 100%
        secret: Bool;
        content: ?Content;
        thumb: Content; // may overwrite class
        entropy: Blob;
        created: Nat32; // in minutes
        attributes: Attributes;
        tags:Tags;
        custom: ?CustomData;
        // Idea: Have maturity rating
    };
        
    public type CustomData = Blob;
    public module CustomData = {
        public func validate(t : CustomData) : Bool {
            t.size() <= 1024 * 50 // 50 kb 
        }
    };

    public type MetadataInput = {
        classId: ?AnvilClassId;
        name: ?Text;
        lore: ?Text;
        quality: Nat8;
        secret: Bool;
        transfer: ItemTransfer;
        ttl: ?Nat32;
        content: ?Content;
        thumb: Content;
        attributes: Attributes;
        tags: Tags;
        custom: ?CustomData;
        minterShare: Share;
    };

    public module MetadataInput = {
        public func validate(m : MetadataInput) : Bool {
             OptValid(m.name, ItemName.validate)
            and OptValid(m.lore, ItemLore.validate)
            and OptValid(m.content, Content.validate)
            and Content.validate(m.thumb)
            and Attributes.validate(m.attributes)
            and Tags.validate(m.tags)
            and OptValid(m.custom, CustomData.validate)
        }
    };

    public type Metavars = {
        var boundUntil: ?Nat32; // in minutes
        var cooldownUntil: ?Nat32; // in minutes
        var sockets: Sockets;
        var price: Nat64;
    };

    public type MetavarsFrozen = {
            boundUntil: ?Nat32; 
            cooldownUntil: ?Nat32; 
            sockets: Sockets;
            price: Nat64;
    };

    public func MetavarsFreeze(a:Metavars) : MetavarsFrozen {
        {
            boundUntil= a.boundUntil; 
            cooldownUntil= a.cooldownUntil; 
            sockets= a.sockets; 
            price = a.price;
        }
    };

    public type MetadataResponse = Result.Result<
        {bearer: AccountIdentifier; data: Metadata; vars:MetavarsFrozen},
        CommonError
    >;

    public type SupplyResponse = Result.Result<
        Balance,
        CommonError
    >;
  
   public type PlugRequest = {
        user       : User;
        subaccount : ?SubAccount;
        socket : TokenIdentifier;
        plug   : TokenIdentifier;
    };

    public type PlugResponse = Result.Result<
        (), {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken :TokenIdentifier;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #SocketError: SocketError;
        }
    >;

    public type SocketRequest = { 
        user       : User;
        subaccount : ?SubAccount;
        socket : TokenIdentifier;
        plug   : TokenIdentifier;
    };

    public type SocketError = {
        #Rejected;
        #InsufficientBalance;
        #Other : Text;
        #NotLegitimateCaller;
        #ClassError : Text;
        #SocketsFull;
        #InvalidToken :TokenIdentifier;
        #Unauthorized :AccountIdentifier;
        };

    public type SocketResponse = Result.Result<
        (), SocketError
    >;

    public type UnsocketRequest = {
        user       : User;
        subaccount : ?SubAccount;
        socket : TokenIdentifier;
        plug   : TokenIdentifier;
    };

    public type UnsocketResponse = Result.Result<
        (), {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken :TokenIdentifier;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #UnplugError: UnplugError
        }
    >;


    public type UnplugError = {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken :TokenIdentifier;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #NotLegitimateCaller;
        };

    public type UnplugResponse = Result.Result<
        (), UnplugError
    >;

  public type PurchaseIntentRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount: ?SubAccount;

    };

    public type SetPriceRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount: ?SubAccount;
        price : Nat64;
    };


    public type SetPriceResponse = Result.Result<
        (), {
            #InvalidToken : TokenIdentifier;
            #TooHigh;
            #TooLow;
            #NotTransferable;
            #InsufficientBalance;
            #Unauthorized : AccountIdentifier;
            #CannotNotify : AccountIdentifier;
            #Other        : Text;

        }
    >;


    public type PurchaseIntentResponse = Result.Result<
        {
            paymentAddress: AccountIdentifier;
            price: Nat64;
        }, {
            #InvalidToken :TokenIdentifier;
            #NotForSale;
        }
    >;

    public type PurchaseClaimRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount : ?SubAccount;

        marketplace: {
            address: AccountIdentifier;
            share:Share;
            }
    };

    public type PurchaseClaimResponse = Result.Result<
        (), {
            #Refunded;
            #ErrorWhileRefunding;
            #NotEnoughToRefund;
            #InvalidToken :TokenIdentifier;
            #NotForSale;
            #TreasuryNotifyFailed;
        }
    >;

        public type BearerResponse = Result.Result<
            AccountIdentifier, 
            CommonError
        >;

        public type UploadChunkRequest =  {
           subaccount : ?SubAccount;
           tokenIndex: TokenIndex;
           position : {#content; #thumb};
           chunkIdx : Nat32;
           data : Blob;
        };

        public type FetchChunkRequest =  {
           tokenIndex: TokenIndex;
           position : {#content; #thumb};
           chunkIdx : Nat32;
           subaccount : ?SubAccount;
        };

        public type MintRequest = {
            to         : User;
            subaccount : ?SubAccount;
            metadata : MetadataInput;
        };

        public type MintResponse = Result.Result<
           TokenIndex, {
            #Rejected;
            #InsufficientBalance;
            #ClassError: Text;
            #Invalid: Text;
            #OutOfMemory;
            #Unauthorized;
          }
        >;

        public type MintBatchResponse = Result.Result<
           [TokenIndex],
           CommonError
        >;

    public module Allowance = {
        public type Request = {
            owner   : User;
            spender : Principal;
            token   : TokenIdentifier;
        };

        public type Response = Result.Result<
            Balance,
            CommonError
        >;

        public type ApproveRequest = {
            subaccount : ?SubAccount;
            spender    : Principal;
            allowance  : Balance;
            token      : TokenIdentifier;
        };

        public type ApproveResponse = Result.Result<
            (),
            {
            #Other        : Text;
            #InvalidToken : TokenIdentifier;
            #Unauthorized : AccountIdentifier;
            #InsufficientBalance;
            }
        >;

    };
};
