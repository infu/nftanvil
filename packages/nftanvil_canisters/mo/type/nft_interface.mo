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

//Notice: In the beginning this spec started from Aviate-labs https://github.com/aviate-labs/ext.std
//A lot of AccountIdentifier code is from there too

module {

        public type AccountIdentifier = Blob; //32 bytes
        public type AccountIdentifierShort = Blob; //28bytes


        public module AccountIdentifier = { 
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

            public func purchaseAccountId(can:Principal, productId:Nat32, accountId: AccountIdentifier) : (AccountIdentifier, SubAccount) {
            
                let subaccount = Blob.fromArray(Array.append<Nat8>(
                    Blob_.nat32ToBytes(productId),
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

        public type Memo = Nat64;

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
    

    public type Interface = actor {

        // Returns the balance of account.
        balance    : query (request : BalanceRequest) -> async BalanceResponse;

        // (iPWR) Transfers between two accounts
        transfer   : shared (request : TransferRequest) -> async TransferResponse;

        // Returns the metadata of the given token.
        metadata : query (token :  TokenIdentifier) -> async  MetadataResponse;

        // Returns the total supply of the token.
        supply   : query (token :  TokenIdentifier) -> async  SupplyResponse;

        // Returns the account that is linked to the given token.
        bearer  : query (token :  TokenIdentifier) -> async BearerResponse;

        // (PWR) Mints a new NFT and assignes its owner to the given User.
        mintNFT : shared (request :  MintRequest) -> async  MintResponse;

        // Returns the amount which the given spender is allowed to withdraw from the given owner.
        allowance : query (request : Allowance.Request) -> async Allowance.Response;

        // (iPWR) Allows the given spender to withdraw from your account multiple times, up to the given allowance.
        approve   : shared (request : Allowance.ApproveRequest) -> async Allowance.ApproveResponse;

        // (returns stored PWR) NFT is removed from memory completely. Burn reciept is added to history
        burn      : shared (request : BurnRequest) -> async BurnResponse;

        // (iPWR) Saves a hash inside which can be used for claiming
        transfer_link : shared (request: TransferLinkRequest) -> async TransferLinkResponse;

        // (iPWR) The hash of two inputs must match the hash stored, then claiming is legitimate
        claim_link  : shared (request: ClaimLinkRequest) -> async ClaimLinkResponse;

        // (no updates) Returns the AccountIdentifier we have to pay ICP to. 
        purchase_intent : shared (request:  PurchaseIntentRequest) -> async PurchaseIntentResponse;

        // (iPWR) When you buy NFT part of the deal is to refill its PWR to max. Checks if the payment is done
        purchase_claim : shared (request: PurchaseClaimRequest) -> async PurchaseClaimResponse;

        // (iPWR) Changes "Buynow" price of the NFT
        set_price : shared (request: SetPriceRequest) -> async SetPriceResponse;

        // (iPWR or returned iPWR) Usage reciept added to history. If use type is 'consumable', then NFT is destroyed
        use       : shared (request: UseRequest) -> async UseResponse;

        // (iPWR) Used to store files
        uploadChunk : shared (request: UploadChunkRequest) -> async ();

        // (no updates) This function is only way to fetch NFTs with secret storage. The rest will use http, because it can be cached.
        fetchChunk : shared (request: FetchChunkRequest) -> async ?Blob;

        // (iPWR) Plugs NFT into socket. Socket func of the recipient NFT is called
        plug       : shared (request: PlugRequest) -> async PlugResponse;

        // (iPWR, internal) Can be called only by another NFT canister trying to plug NFT
        socket      : shared (request: SocketRequest ) -> async SocketResponse;

        // (iPWR) Remove nft from socket
        unsocket    : shared (request: UnsocketRequest) -> async UnsocketResponse;

        // (iPWR, internal) Can be called only by another NFT canister trying to unplug NFT
        unplug      : shared (request: UnsocketRequest) -> async UnplugResponse;

        // Returns canister stats
        stats   : query () -> async StatsResponse;
    };

    public func OptValid<A>(v:?A, f: (A) -> Bool) : Bool {
        switch(v) { case (?z) f(z); case(null) true }
    };

    public func OptPrice<A>(v:?A, f: (A) -> Nat64) : Nat64 {
        switch(v) { case (?z) f(z); case(null) 0 }
    };

    public type CommonError = {
        #InvalidToken : TokenIdentifier;
        #Other        : Text;
    };


    // A unique id for a particular token and reflects the canister where the 
    // token resides as well as the index within the tokens container.
   

    // Represents an individual token's index within a given canister.
    public type TokenIndex = Nat32;

    public module TokenIndex = {
        public func equal(a : TokenIndex, b : TokenIndex) : Bool { a == b; };

        public func hash(a : TokenIndex) : Hash.Hash { a; };
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

    public type TransferResponseError = {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #NotTransferable;
        #InvalidToken : TokenIdentifier;
        #Other        : Text;
    };

    public type TransferResponse = Result.Result<Balance, TransferResponseError>;

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
        #Rejected; // We wont supply possible attacker with verbose errors
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
        #external;
        };

    public module Content = {
        public func validate(x : Content) : Bool {
            switch(x) {
                case (#internal({contentType; size})) {
                    ContentType.validate(contentType)
                };
                case (#external) {
                        true
                };
                case (#ipfs({contentType; cid})) {
                        ContentType.validate(contentType)
                        and IPFS_CID.validate(cid)
                }
            }
        };

        public func price(x : Content) : Nat64 {
            switch(x) {
                case (#internal({contentType; size})) {
                    (Nat64.fromNat(Nat32.toNat(size)) / 1024) * Pricing.STORAGE_KB_PER_MIN 
                };
                case (#external) {
                       0
                };
                case (#ipfs({contentType; cid})) {
                       0
                };
            }
        };
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
            //desc: EffectDesc;
            duration: Cooldown;
            useId: CustomId;
        };

        #consumable : {
           // desc: EffectDesc;
            useId: CustomId;
        };
    };
    
    public module ItemUse = {
        public func validate(t : ItemUse) : Bool {
            switch(t) {
                case (#cooldown({duration; useId})) {
                    CustomId.validate(useId)  and Cooldown.validate( duration )
                };
                case (#consumable({useId})) {
                    CustomId.validate(useId)
                }
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
        public let LimitAffiliate:Nat = 3000; // 30%
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
    
    public type CollectionId = Nat32;

    public type CollectionStored = {
        domain: ?DomainName;
        authors: [AccountIdentifier];
        socketable:[CollectionId];
        max: Nat32;
        var lastIdx: Nat32;
        renderer: ?Renderer;
        IPFSGateway: ?Text;
    };

    public type CollectionIndex = Nat32;

    public type Collection = {
        domain: ?DomainName;
        authors: [AccountIdentifier];
        socketable:[CollectionId];
        max: CollectionIndex;
        lastIdx: CollectionIndex;
        renderer: ?Renderer;
        contentType: ContentType;
    };

    public type ICPath = Text;
    public module ICPath = {
        public func validate(t : ICPath) : Bool {
            //TODO:
            //Must match this pattern ic://principal/path
            t.size() < 255;
        };
    };

    public type Renderer = {
        #canister : {
           contentType: ContentType;
        };
        #wasm : {
            #ipfs: IPFS_CID;
            #ic: ICPath; // ic://principal/path
        };
    };

    public type Metadata = {
        collectionId: ?CollectionId;
        collectionIndex: ?CollectionIndex;
        name: ?ItemName;
        lore: ?ItemLore;
        quality: Quality;
        transfer: ItemTransfer;
        author: AccountIdentifier;
        authorShare: Share; // min 0 ; max 10000 - which is 100%
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
        };
        public func price (t: CustomData) : Nat64 {
            (Nat64.fromNat(t.size()) / 1024) * Pricing.STORAGE_KB_PER_MIN 
        };
    };

    public type MetadataInput = {
        collectionId: ?CollectionId;
        name: ?Text;
        lore: ?Text;
        quality: Quality;
        secret: Bool;
        transfer: ItemTransfer;
        ttl: ?Nat32;
        content: ?Content;
        thumb: Content;
        attributes: Attributes;
        tags: Tags;
        custom: ?CustomData;
        authorShare: Share;
        price: Price;
    };

    public module Pricing = {
        public let MAX_QUALITY_PRICE : Nat64 = 2000000; // max quality price per min
        public let STORAGE_KB_PER_MIN : Nat64 = 8; // prices are in cycles
        public let AVG_MESSAGE_COST : Nat64 = 3000000; // prices are in cycles
        public let FULLY_CHARGED_MINUTES : Nat64 = 8409600; //(16 * 365 * 24 * 60) 16 years
        public let FULLY_CHARGED_MESSAGES : Nat64 = 5840; // 1 message per day

    };

    public type Quality = Nat8;
    public module Quality = {

        public func validate(t : Quality) : Bool {
            t <= 6; // Poor, Common, Uncommon, Rare, Epic, Legendary, Artifact
        };
        public func price(t: Quality) : Nat64 {
            Nat64.fromNat(Nat8.toNat(t)) * Pricing.MAX_QUALITY_PRICE
        }
    };

 
    public type Price = {
        amount : Nat64;
        marketplace : ?{
                address : AccountIdentifier;
                share : Share
                };
                
        affiliate : ?{
                address : AccountIdentifier;
                share : Share
                };
    };

    public module MetadataInput = {
        public func validate(m : MetadataInput) : Bool {
            OptValid(m.name, ItemName.validate)
            and OptValid(m.lore, ItemLore.validate)
            and OptValid(m.content, Content.validate)
            and Content.validate(m.thumb)
            and Attributes.validate(m.attributes)
            and Quality.validate(m.quality)
            and Tags.validate(m.tags)
            and OptValid(m.custom, CustomData.validate)
        };
        
        public func price(m: MetadataInput) : Nat64 {
            let cost_per_min = Pricing.STORAGE_KB_PER_MIN * 50 // cost for nft metadata stored in the cluster
            + OptPrice(m.custom, CustomData.price)
            + OptPrice(m.content, Content.price)
            + Content.price(m.thumb)
            + Quality.price(m.quality);

            switch(m.ttl) {
                case (null) {
                    cost_per_min * Pricing.FULLY_CHARGED_MINUTES
                    + Pricing.FULLY_CHARGED_MESSAGES * Pricing.AVG_MESSAGE_COST
                };
                case (?t) {
                    Nat64.fromNat(Nat32.toNat(t)) * Pricing.AVG_MESSAGE_COST / 60 / 24 
                    + Pricing.AVG_MESSAGE_COST * 50 // minimum 50 messages
                }
            }
        };
    };

    public type Metavars = {
        var boundUntil: ?Nat32; // in minutes
        var cooldownUntil: ?Nat32; // in minutes
        var sockets: Sockets;
        var price: Price;
        var pwr : Nat64;
        var ttl : ?Nat32; // time to live
    };

    public type MetavarsFrozen = {
            boundUntil: ?Nat32; 
            cooldownUntil: ?Nat32; 
            sockets: Sockets;
            price: Price;
            pwr: Nat64;
            ttl: ?Nat32;
    };

    public func MetavarsFreeze(a:Metavars) : MetavarsFrozen {
        {
            boundUntil= a.boundUntil; 
            cooldownUntil= a.cooldownUntil; 
            sockets= a.sockets; 
            price = a.price;
            pwr = a.pwr;
            ttl = a.ttl;
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
        price : Price;
    };


    public type SetPriceResponse = Result.Result<
        (), {
            #InvalidToken : TokenIdentifier;
            #TooHigh;
            #TooLow;
            #NotTransferable;
            #InsufficientBalance;
            #Unauthorized : AccountIdentifier;

            #Other        : Text;
        }
    >;


    public type PurchaseIntentResponse = Result.Result<
        {
            paymentAddress: AccountIdentifier;
            price: Price;
        }, {
            #InvalidToken :TokenIdentifier;
            #NotForSale;
        }
    >;

    public type PurchaseClaimRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount : ?SubAccount;
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
        #Pwr: TransferResponseError
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



    public type StatsResponse = {
        minted: Nat32;
        transfers: Nat32;
        burned: Nat32;
        cycles: Nat;
        rts_version:Text;
        rts_memory_size:Nat;
        rts_heap_size:Nat;
        rts_total_allocation:Nat;
        rts_reclaimed:Nat;
        rts_max_live_size:Nat;
    };

};
