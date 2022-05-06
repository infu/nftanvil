//Ratoko is the better toko
//@name=nft
import Array "mo:base/Array";
import Array_ "mo:array/Array";
import _Array "../lib/Array";

import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import SHA224 "../lib/SHA224";
import Hash "mo:base/Hash";
import Hex "mo:encoding/Hex";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Blob_ "../lib/Blob";

//Notice: In the beginning this spec started from Aviate-labs https://github.com/aviate-labs/ext.std
//A lot of AccountIdentifier code is from there too

module {

   

        //(APrincipal
        public module APrincipal = {

            public func fromSlot(space:[[Nat64]], slot: CanisterSlot) : Principal {
                let start = space[0][0];
                Principal.fromBlob(Blob.fromArray(_Array.concat<Nat8>(
                    Blob_.nat64ToBytes(start + slot),
                    [1,1]
                )));
            };

            public func isLegitimate(space:[[Nat64]], p: Principal) : Bool {
                switch(toSlot(space, p)) {
                    case (?a) true;
                    case (null) false;
                }
            };

            public func isLegitimateSlot(space:[[Nat64]], idx: CanisterSlot) : Bool {
                let start = space[0][0];
                let end = space[0][1];
                let range = end - start;
                idx >= 0 and (idx <= range);
            };

            // After exhausting the first range, this function will be modified to support multiple ranges
            public func toSlot(space:[[Nat64]], p: Principal) : ?CanisterSlot {
                let (idxarr, flags) = Array_.split<Nat8>(Blob.toArray(Principal.toBlob(p)), 8);
                let idx = Blob_.bytesToNat64(idxarr);
                if (flags[0] != 1 or flags[1] != 1) return null;
                let start = space[0][0];
                let end = space[0][1];
                if (idx < start or idx > end) return null;
                return ?(idx - start);
            };

            public func toIdx(p: Principal) : ?Nat64 {
                let (idxarr, flags) = Array_.split<Nat8>(Blob.toArray(Principal.toBlob(p)), 8);
                let idx = Blob_.bytesToNat64(idxarr);
                if (flags[0] != 1 or flags[1] != 1) return null;
                return ?idx;
            };
        };
        //)

        //(AccountIdentifier
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
                Blob.fromArray(_Array.concat<Nat8>(
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

            public func slot(accountId : AccountIdentifier, max:CanisterSlot) : CanisterSlot {
                let bl = Blob.toArray(accountId);
                let (p1, p2) = Array_.split(bl, 28);

                let x = Blob_.bytesToNat32(p2);

                 (Nat64.fromNat(Nat32.toNat(x))  %  (max + 1))
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
                
                let inner = SHA224.sha224(Array.flatten<Nat8>([prefix, data, account]));

                Blob.fromArray(_Array.concat<Nat8>(
                    Binary.BigEndian.fromNat32(CRC32.checksum(inner)),
                    inner,
                ));
            };

            public func purchaseAccountId(can:Principal, productId:Nat32, accountId: AccountIdentifier) : (AccountIdentifier, SubAccount) {
            
                let subaccount = Blob.fromArray(_Array.concat<Nat8>(
                    Blob_.nat32ToBytes(productId),
                    Blob.toArray(toShort(accountId))
                )); 

                (fromPrincipal(can, ?subaccount), subaccount);
            };
        };
        //)

        //(SubAccount
        public type SubAccount = Blob; //32 bytes

        public module SubAccount = {
            public func fromNat(idx: Nat) : SubAccount {
                Blob.fromArray(_Array.concat<Nat8>(
                    Array.freeze(Array.init<Nat8>(24, 0)),
                    Blob_.nat64ToBytes(Nat64.fromNat(idx))
                    ));
                };
        };
        //)


        //(Memo
        public type Memo = Blob; // 32 bytes max
        public module Memo = {
            public func validate(m : Memo) : Bool {
                 (m.size() <= 32)
            };
        };
        //)

        //(TokenIdentifier
        public type TokenIdentifier = Nat64;
    
        public module TokenIdentifier = {
        
            public func encode(slot : CanisterSlot, tokenIndex : TokenIndex) : TokenIdentifier {
                slot << 16 | Nat64.fromNat(Nat16.toNat(tokenIndex));
            };

            public func decode(tokenId : TokenIdentifier) : (CanisterSlot, TokenIndex) {
                let slot:Nat64 = tokenId >> 16;
                let idx:Nat16 = Nat16.fromNat(Nat64.toNat(tokenId & 65535)); 
                (slot, idx)
            };

            public func equal(a: TokenIdentifier, b:TokenIdentifier) : Bool {
                 Nat64.equal(a, b);
            };

            public func hash(x: TokenIdentifier) : Hash.Hash {
                 return Nat32.fromNat(Nat64.toNat( (x << 32) >> 32 ));
            };

        };
        //)

        //(User
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
    //)

    //(Config
    public type CanisterSlot = Nat64;
    public type CanisterRange = (CanisterSlot, CanisterSlot);

    public type Config = {
        router: Principal;
        nft: CanisterRange;
        nft_avail: [CanisterSlot];
        account: CanisterRange;
        pwr: CanisterRange;
        anvil: CanisterSlot;
        treasury: CanisterSlot;
        history: CanisterSlot;
        history_range: CanisterRange;
        space:[[Nat64]];
    };

    public type Oracle = {
        icpCycles : Nat64;
        icpFee : Nat64; // ICP transfer fee
        pwrFee : Nat64; 
        anvFee : Nat64; 
    };
    //)

    //(0🔶 Interface
    public type Interface = actor {

        // Returns the balance of account.
        balance    : query (request : BalanceRequest) -> async BalanceResponse;

        // (iPWR)  Transfers between two accounts
        transfer   : shared (request : TransferRequest) -> async TransferResponse;

        // Returns the metadata of the given token.
        metadata : query (token :  TokenIdentifier) -> async  MetadataResponse;

        // Returns the total supply of the token.
        supply   : query (token :  TokenIdentifier) -> async  SupplyResponse;

        // Returns the account that is linked to the given token.
        bearer  : query (token :  TokenIdentifier) -> async BearerResponse;

        // (PWR proxy call)  Mints a new NFT
        mint : shared (request :  MintRequest) -> async  MintResponse;

        // (PWR proxy call) recharge nft
        recharge : shared (request :  RechargeRequest) -> async  RechargeResponse;

        // Returns the amount which the given spender is allowed to withdraw from the given owner.
        allowance : query (request : Allowance.Request) -> async Allowance.Response;

        // (iPWR)  Allows the given spender to withdraw from your account multiple times, up to the given allowance.
        approve   : shared (request : Allowance.ApproveRequest) -> async Allowance.ApproveResponse;

        // (returns stored PWR)  NFT is removed from memory completely. Burn reciept is added to history
        burn      : shared (request : BurnRequest) -> async BurnResponse;

        // (iPWR) Saves a hash inside which can be used for claiming
        transfer_link : shared (request: TransferLinkRequest) -> async TransferLinkResponse;

        // (iPWR) The hash of two inputs must match the hash stored, then claiming is legitimate
        claim_link  : shared (request: ClaimLinkRequest) -> async ClaimLinkResponse;

        // (PWR proxy call) When you buy NFT part of the deal is to refill its PWR to max.
        purchase : shared (request: PurchaseRequest) -> async PurchaseResponse;

        // (iPWR) Changes "Buynow" price of the NFT
        set_price : shared (request: SetPriceRequest) -> async SetPriceResponse;

        // (iPWR or returned iPWR) Usage reciept added to history. If use type is 'consumable', then NFT is destroyed
        use       : shared (request: UseRequest) -> async UseResponse;

        // (iPWR) Used to store files
        upload_chunk : shared (request: UploadChunkRequest) -> async ();

        // (no updates) This function is only way to fetch NFTs with secret storage. The rest will use http, because it can be cached.
        fetch_chunk : shared (request: FetchChunkRequest) -> async ?Blob;

        // Plug & socket functionality should be reworked so each NFT has its own wallet and can hold
        // unlimited amounts of fungible and non-fungible tokens in all blockchains
        //
        // (iPWR) Plugs NFT into socket. Socket func of the recipient NFT is called
        plug       : shared (request: PlugRequest) -> async PlugResponse;

        // (iPWR, internal) Can be called only by another NFT canister trying to plug NFT
        socket      : shared (request: SocketRequest ) -> async SocketResponse;

        // (iPWR) Remove nft from socket
        unsocket    : shared (request: UnsocketRequest) -> async UnsocketResponse;

        // (iPWR, internal) Can be called only by another NFT canister trying to unplug NFT
        unplug      : shared (request: UnsocketRequest) -> async UnplugResponse;
    };
    // Balance refers to an amount of a particular token.
    public type Balance = Nat64;

    public type CustomId = Nat64;

    public type ClaimLink = Blob;

    public type TokenRecord = {
            var owner : AccountIdentifier;
            meta : Metadata;
            vars : Metavars;
            var link : ?ClaimLink;
            content : [var ?Blob];
            var thumb : ?Blob;
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
        memo       : Memo;
        subaccount : ?SubAccount;
    };
 
    public type TransferRequest = {
        from       : User;
        to         : User;
        token      : TokenIdentifier;
        memo       : Memo;
        subaccount : ?SubAccount;
    };

    public type UseRequest = {
        user       : User;
        subaccount : ?SubAccount;
        token      : TokenIdentifier;
        use        : ItemUse;
        memo       : Memo;
        customVar  : ?CustomVar;
    };
    
    public type TransferLinkRequest = {
        from       : User;
        hash       : Blob;
        token      : TokenIdentifier;
        subaccount : ?SubAccount;
    };

    public type TransferResponseError = {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #NotTransferable;
        #InvalidToken;
        #Other        : Text;
        #OutOfPower;
        #ICE: Text;
    };

    public type TransferResponse = Result.Result<{transactionId: TransactionId}, TransferResponseError>;
    public type BurnResponse = TransferResponse;

    public type UseResponse = Result.Result<{
        transactionId: TransactionId
    }, {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #InvalidToken;
        #OnCooldown;
        #ExtensionError: Text;
        #Other        : Text;
        #OutOfPower;
        #ICE: Text;
    }>;

    public type TransferLinkResponse = Result.Result<(), {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #InvalidToken ;
        #Other        : Text;
        #OutOfPower;
    }>;

    public type ClaimLinkRequest = {
        to         : User;
        key        : Blob;
        token      : TokenIdentifier;
    };

    public type ClaimLinkResponse = Result.Result<{
         transactionId: TransactionId
    }, {
        #Rejected; // We wont supply possible attacker with verbose errors
        #Other: Text
        }>;



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
        memo   : Memo;
    };

    public type PlugResponse = Result.Result<
        { transactionId: TransactionId}, {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken ;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #SocketError: SocketError;
        #OutOfPower;
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
        #InvalidToken ;
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
        memo   : Memo;
    };

    public type UnsocketResponse = Result.Result<
        { transactionId: TransactionId }, {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken ;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #UnplugError: UnplugError;
        #OutOfPower
        }
    >;


    public type UnplugError = {
        #Rejected;
        #InsufficientBalance;
        #InvalidToken ;
        #Unauthorized :AccountIdentifier;
        #Other : Text;
        #NotLegitimateCaller;
        };

    public type UnplugResponse = Result.Result<
        (), UnplugError
    >;

    public type PurchaseRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount: ?SubAccount;
        amount: Balance;
        affiliate : ?{
                    address : AccountIdentifier;
                    amount: Balance;
                    };
    };

    public type SetPriceRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount: ?SubAccount;
        price : Price;
    };

    public type MintQuoteResponse = {
        transfer : Nat64;
        ops : Nat64;
        storage : Nat64;
    };

    public type SetPriceResponse = Result.Result<
        {transactionId: TransactionId}, {
            #InvalidToken ;
            #TooHigh;
            #TooLow;
            #NotTransferable;
            #InsufficientBalance;
            #Unauthorized : AccountIdentifier;
            #Other        : Text;
            #OutOfPower;
            #ICE: Text;
        }
    >;


    public type PurchaseResponse = Result.Result<
        { transactionId: TransactionId; purchase: NFTPurchase }, {
            #Refunded;
            #Rejected;
            #ErrorWhileRefunding;
            #NotEnoughToRefund;
            #InvalidToken;
            #Unauthorized;
            #NotForSale;
            #TreasuryNotifyFailed;
            #InsufficientBalance;
            #InsufficientPayment : Balance;
            #ICE: Text;
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
        user         : User;
        subaccount : ?SubAccount;
        metadata : MetadataInput;
    };

    public type MintResponse = Result.Result<
        {tokenIndex: TokenIndex; transactionId: TransactionId}, {
        #Rejected;
        #InsufficientBalance;
        #ClassError: Text;
        #Invalid: Text;
        #OutOfMemory;
        #Unauthorized;
        #ICE: Text;
        #Pwr: TransferResponseError
        }
    >;

    public type MintBatchResponse = Result.Result<
        [TokenIndex],
        CommonError
    >;

    public type RechargeRequest = {
        token : TokenIdentifier;
        user : User;
        subaccount: ?SubAccount;
        amount: Balance;
    };

    public type RechargeResponse = Result.Result<
        (), {
            #Rejected;
            #InvalidToken ;
            #InsufficientBalance;
            #RechargeUnnecessary;
            #Unauthorized;
            #InsufficientPayment : Balance;
        }
    >;

    public type PWRConsumeResponse = Bool;


    public type NFTPurchase = {
                created : Time.Time;
                amount : Balance;

                token: TokenIdentifier;
                
                buyer : AccountIdentifier;
                seller : AccountIdentifier;
                recharge : Balance;
                author : {
                    address : AccountIdentifier;
                    share : Share
                    };

                marketplace : ?{
                    address : AccountIdentifier;
                    share : Share
                    }; 

                affiliate : ?{
                    address : AccountIdentifier;
                    amount : Balance
                    };
        };
        
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
            {transactionId: TransactionId},
            {
            #Other        : Text;
            #InvalidToken;
            #Unauthorized : AccountIdentifier;
            #InsufficientBalance;
            #OutOfPower;
            #ICE : Text;
            }
        >;

    };

    public type CommonError = {
        #InvalidToken;
        #Other        : Text;
    };

    //)



  


   
    //(TokenIndex
    // Represents an individual token's index within a given canister.
    public type TokenIndex = Nat16;

    public module TokenIndex = {
        public func equal(a : TokenIndex, b : TokenIndex) : Bool { a == b; };

        public func hash(a : TokenIndex) : Hash.Hash { Nat32.fromNat(Nat16.toNat(a)); };
    };
    //)

   

    //(Content
    public type Chunks = [Nat32];
    public module Chunks = {
        public let MAX_CONTENT_CHUNKS:Nat32 = 2;
        public let MAX_THUMB_CHUNKS:Nat32 = 1;
        public let TYPE_CONTENT:Nat32 = 0; // dont change
        public let TYPE_THUMB:Nat32 = 1; // dont change
    };

    public type ContentType = Text;
    public module ContentType = {
        public let Allowed:[ContentType] = ["application/octet-stream","image/jpeg","image/gif","image/png","video/ogg","video/mpeg","video/mp4","video/webm","image/webp","audio/mpeg","audio/aac","audio/ogg","audio/opus","audio/webm","image/svg+xml"]; // Warning: Allowing other types shoud go trough security check
        public func validate(t : ContentType) : Bool {
            switch(Array.find(Allowed, func (a : ContentType) : Bool { a == t })) {
                case (?x) true;
                case (null) false;
            }
        }
    };

    public type IPFS_CID = Text;
    public module IPFS_CID = {
        public func validate(t : IPFS_CID) : Bool {
            t.size() <= 64
        } 
    };
    
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
        #external: ExternalUrl; // can be static image, video, or something generated by canister or wasm. Content type is taken from response headers
    };

    public module Content = {
        public func validate(x : Content) : Bool {
            switch(x) {
                case (#internal({contentType; size})) {
                    ContentType.validate(contentType)
                };
                case (#external(p)) {
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
                case (#external(p)) {
                       0
                };
                case (#ipfs({contentType; cid})) {
                       0
                };
            }
        };
    };
    //)

    

    //(Metadata
    public type Metadata = {

        domain: ?DomainName;
        name: ?ItemName;
        lore: ?ItemLore;
        quality: Quality;
        transfer: ItemTransfer;
        author: AccountIdentifier;
        authorShare: Share; // min 0 ; max 10000 - which is 100%
        content: ?Content;
        thumb: Content; // may overwrite class
        entropy: Blob;
        created: Nat32; // in minutes
        attributes: Attributes;
        tags:Tags;
        custom: ?CustomData;
        secret: Bool;
        rechargeable: Bool;

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

    public type CustomVar = Blob; // 32bytes / 256bit

    public type MetadataInput = {
        domain: ?DomainName;
        name: ?Text;
        lore: ?Text;
        quality: Quality;
        secret: Bool; // maybe bitmap instead
        transfer: ItemTransfer;
        ttl: ?Nat32;
        content: ?Content;
        thumb: Content;
        attributes: Attributes;
        tags: Tags;
        custom: ?CustomData;
        customVar: ?CustomVar;
        authorShare: Share;
        price: Price;
        rechargeable: Bool;
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
        
        public func priceStorage({custom;content;thumb;quality;ttl}: MetadataInput) : Nat64 {
          Pricing.priceStorage({custom;content;thumb;quality;ttl})
           
        };

        public func priceOps({ttl}: MetadataInput) : Nat64 {
          Pricing.priceOps({ttl})
        };
    };

    public type Metavars = {
        var boundUntil: ?Nat32; // in minutes
        var cooldownUntil: ?Nat32; // in minutes
        var sockets: Sockets;
        var price: Price;
        var pwrStorage : Nat64;
        var pwrOps : Nat64;
        var ttl : ?Nat32; // time to live
        var history : [Blob];
        var allowance : ?Principal;
        var customVar : ?CustomVar; //256bit / 32bytes
        var lastTransfer : Nat32; // in minutes 
    };

    public type MetavarsFrozen = {
            boundUntil: ?Nat32; 
            cooldownUntil: ?Nat32; 
            sockets: Sockets;
            price: Price;
            pwrStorage: Nat64;
            pwrOps: Nat64;
            ttl: ?Nat32;
            history : [Blob];
            allowance: ?Principal;
    };

    public func MetavarsFreeze(a:Metavars) : MetavarsFrozen {
        {
            boundUntil= a.boundUntil; 
            cooldownUntil= a.cooldownUntil; 
            sockets= a.sockets; 
            price = a.price;
            pwrStorage = a.pwrStorage;
            pwrOps = a.pwrOps;
            ttl = a.ttl;
            history = a.history;
            allowance = a.allowance;
        }
    };
    public type Quality = Nat8;
    public module Quality = {

        public func validate(t : Quality) : Bool {
            t <= 6; // Poor, Common, Uncommon, Rare, Epic, Legendary, Artifact
        };

        public func price(t: Quality) : Nat64 {
            Nat64.fromNat(Nat.pow(Nat8.toNat(t), 3)) * Pricing.QUALITY_PRICE
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
        #cooldown: Cooldown;
        #consume;
        #prove;
    };


    public module ItemUse = {
        public func validate(t : ItemUse) : Bool {
            switch(t) {
                case (#cooldown(duration)) {
                    Cooldown.validate( duration )
                };
                case (#consume) {
                    true
                };
                case (#prove) {
                    true
                }
            }
        };

        public func hash(e: ItemUse) : [Nat8] {
            Array.flatten<Nat8>(
                switch(e) {
                    case (#cooldown(duration)) {
                        [
                        [1:Nat8],
                        Blob_.nat32ToBytes(duration)
                        ]
                    };
                    case (#consume) {
                        [
                        [2:Nat8]
                        ]
                    };
                    case (#prove) {
                        [
                        [3:Nat8]
                        ]
                    }
                })
        };
    };


    public type ItemTransfer = {
        #unrestricted;
        #bindsForever;
        #bindsDuration: Nat32;
    };

    public type Attribute = (Text, Nat16);
    public module Attribute = {
        public func validate((a,n) : Attribute) : Bool {
            (a.size() <= 36)
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

    public type Sockets = [TokenIdentifier];
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
            t.size() <= 36
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
            t.size() <= 256 
        }
    };

    public type Share = Nat16;
    public module Share = {
        public let NFTAnvilShare:Nat = 50; // 0.5%
        public let LimitMarketplace:Nat = 3000; // 30%
        public let LimitAffiliate:Nat = 3000; // 30%
        public let LimitMinter:Nat = 150; // 1.5%
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
    

    public type ExternalUrl = Text;
    public module ExternalUrl = {
        public func validate(t : ExternalUrl) : Bool {
            //TODO:
            t.size() < 255;
        };
    };
    //)


    //(Pricing
    public module Pricing = {
        // WARNING: Has to mirror calculations in pricing.js
        public let QUALITY_PRICE : Nat64 = 1000; // max quality price per min
        public let STORAGE_KB_PER_MIN : Nat64 = 8; // prices are in cycles
        public let AVG_MESSAGE_COST : Nat64 = 4000000; // prices are in cycles
        public let FULLY_CHARGED_MINUTES : Nat64 = 8409600; //(16 * 365 * 24 * 60) 16 years
        public let FULLY_CHARGED_MESSAGES : Nat64 = 5840; // 1 message per day

        public func priceStorage({
            custom:?CustomData;
            content:?Content;
            thumb:Content;
            quality:Quality;
            ttl: ?Nat32;
        }) : Nat64 { // half goes to rechare pool paid to IC the other half goes to NFTAnvil community pool
             let cost_per_min = Pricing.STORAGE_KB_PER_MIN * 100 // cost for nft metadata stored in the cluster
            + OptPrice(custom, CustomData.price)
            + OptPrice(content, Content.price)
            + Content.price(thumb)
            + Quality.price(quality);

            switch(ttl) {
                case (null) {
                    cost_per_min * Pricing.FULLY_CHARGED_MINUTES * 2
                };
                case (?t) {
                    cost_per_min * Nat64.fromNat(Nat32.toNat(t)) * 2
                }
            }
        };

        public func priceOps({ // half goes to rechare pool paid to IC the other half goes to NFTAnvil community pool
            ttl:?Nat32
        }) : Nat64 {

            switch(ttl) {
                case (null) {
                     Pricing.FULLY_CHARGED_MESSAGES * Pricing.AVG_MESSAGE_COST * 2
                };

                case (?t) {
                     (Nat64.fromNat(Nat32.toNat(t)) * Pricing.AVG_MESSAGE_COST / 60 / 24 // 1 message a day
                    + Pricing.AVG_MESSAGE_COST * 100) * 2 // minimum 100 messages
                }
            }
        };

    };

    public func OptPrice<A>(v:?A, f: (A) -> Nat64) : Nat64 {
        switch(v) { case (?z) f(z); case(null) 0 }
    };

    public func OptValid<A>(v:?A, f: (A) -> Bool) : Bool {
        switch(v) { case (?z) f(z); case(null) true }
    };

    public type Price = {
        amount : Nat64;
        marketplace : ?{
                address : AccountIdentifier;
                share : Share 
                };
     };

    public module Price = {
        public func NotForSale() : Price {
            {
                amount = 0;
                marketplace = null;
                // affiliate = null;
            }
        };

        public func hash(x: Price) : [Nat8] {
            _Array.concat<Nat8>(
                    Blob_.nat64ToBytes(x.amount),
                    switch(x.marketplace) {
                        case (?{address; share}) {
                            _Array.concat<Nat8>(
                                Blob.toArray(address),
                                Blob_.nat16ToBytes(share)
                            )
                        };
                        case (null) {
                            []
                        }
                    }
                )
        };
    };
    //)


    //(History

    public type TransactionId = Blob;
    public type EventIndex = Nat32;

    public module TransactionId = { 
        public func encode(history_slot: CanisterSlot, idx: EventIndex) : TransactionId { 
                let raw = Array.flatten<Nat8>([
                    Blob_.nat64ToBytes(history_slot),
                    Binary.BigEndian.fromNat32(idx),
                ]);
                
                Blob.fromArray(raw)
        };

        public func decode(tx: TransactionId) : {history_slot: CanisterSlot; idx: EventIndex} { 
                let (slotArr, idxArr) = Array_.split<Nat8>(Blob.toArray(tx), 8);
                {
                    history_slot = Blob_.bytesToNat64(slotArr);
                    idx = Blob_.bytesToNat32(idxArr);
                }
        };
    };
  

    public type Timestamp = Time.Time;

    public module EventIndex = {
        public func equal (a:EventIndex, b:EventIndex): Bool {
            a == b
        };
        public func hash (a:EventIndex) : Hash.Hash {
            return a;
        };
    };

    public type Event = {
        info : EventInfo;
        hash : Blob; // accumulated by hash previous hash and current event hash
    };

    public type Transaction = Event;

    public module EventInfo = {
        public func hash( e: EventInfo) : [Nat8] {
             switch(e) {
                case (#nft(x)) NftEvent.hash(x);
                case (#pwr(x)) PwrEvent.hash(x);
                case (#anv(x)) AnvEvent.hash(x);
                case (#treasury(x)) [];
            };
        }
    };

    public type EventInfo = {
        #nft : NftEvent;
        #pwr : PwrEvent;
        #anv : AnvEvent;
    };

    public type AnvEvent = {
        #transfer : EventFungibleTransaction;
        // vote
    };

    public type PwrEvent = {
        #transfer : EventFungibleTransaction;
        #withdraw : PwrWithdraw;
        #mint : EventFungibleMint;
    };

    public type NftEvent = {
  
        #transfer : {
            created: Timestamp;
            from: AccountIdentifier;
            to: AccountIdentifier;
            token: TokenIdentifier;
            memo: Memo;
        };

        #burn : {
            created: Timestamp;
            user: AccountIdentifier;
            token: TokenIdentifier;
            memo: Memo;
        };

        #use : {
            created: Timestamp;
            user: AccountIdentifier;
            token: TokenIdentifier;
            use: ItemUse;
            memo: Memo;
        };

        #price : {
            created: Timestamp;
            user: AccountIdentifier;
            token: TokenIdentifier;
            price: Price;
        };

        #purchase : NFTPurchase;

        #mint : {
            created: Timestamp;
            token: TokenIdentifier;
            user: AccountIdentifier;
            pwr: Balance;
        };

        #approve : {
            created: Timestamp;
            token: TokenIdentifier;
            user: AccountIdentifier;
            spender: Principal;
        };

        #socket : {
            created: Timestamp;
            user: AccountIdentifier;
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
            memo: Memo;
        };

        #unsocket : {
            created: Timestamp;
            user: AccountIdentifier;
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
            memo: Memo;
        };
    };


    public module AnvEvent = {
        public func hash(e : AnvEvent) : [Nat8] {
             switch (e) {
                case (#transfer({created;from;to;amount;memo})) {
                    Array.flatten<Nat8>([
                        [1:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat64ToBytes(amount),
                        Blob.toArray(memo)
                    ])
                };
             }
        }
    };

    public module PwrEvent = {
        public func hash(e : PwrEvent) : [Nat8] {
             switch (e) {
                case (#transfer({from;to;amount;memo;created})) {
                    Array.flatten<Nat8>([
                        [2:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat64ToBytes(amount),
                        Blob.toArray(memo)
                    ])
                };
                case (#withdraw({from;to;amount;created})) {
                    Array.flatten<Nat8>([
                        [2:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat64ToBytes(amount)
                    ])
                };
                case (#mint({created;user;amount})) {
                    Array.flatten<Nat8>([
                        [3:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat64ToBytes(amount),
                    ])
                };
             }
        }
    };

    public module NftEvent = {
        public func hash(e : NftEvent) : [Nat8] {
            switch (e) {
                case (#transfer({created;from;to;token;memo})) {
                    Array.flatten<Nat8>([
                        [3:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat64ToBytes(token),
                        Blob.toArray(memo)
                    ])
                };
                case (#burn({created;user;token;memo})) {
                    Array.flatten<Nat8>([
                        [4:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat64ToBytes(token),
                        Blob.toArray(memo)
                    ])
                };
                case (#use({created;user;token;use;memo})) { 
                    Array.flatten<Nat8>([
                        [5:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat64ToBytes(token),
                        ItemUse.hash(use),
                        Blob.toArray(memo)
                    ])
                };
                case (#price({created;user;token;price})) {
                    Array.flatten<Nat8>([
                        [5:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat64ToBytes(token),
                        Price.hash(price)
                    ])
                };
                case (#mint({created;token;pwr;user})) {  
                    Array.flatten<Nat8>([
                        [6:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat64ToBytes(token),
                        Blob_.nat64ToBytes(pwr),
                        Blob.toArray(user),
                    ])
                };
                case (#socket({created;socket; plug; memo; user})) {
                    Array.flatten<Nat8>([
                        [7:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat64ToBytes(socket),
                        Blob_.nat64ToBytes(plug),
                        Blob.toArray(memo),
                        Blob.toArray(user)
                    ])
                };
                case (#unsocket({created;socket; plug; memo; user})) {
                    Array.flatten<Nat8>([
                        [8:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat64ToBytes(socket),
                        Blob_.nat64ToBytes(plug),
                        Blob.toArray(memo),
                        Blob.toArray(user)
                    ])
                };
                case (#purchase(a)) {
                    // 9
                    NFTPurchase.hash(a)
                };
                case (#approve({created;spender;user;token})) {
                    Array.flatten<Nat8>([
                        [10:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob.toArray(Principal.toBlob(spender)),
                        Blob_.nat64ToBytes(token)
                    ])
                };
            
            };
                
        };

    };


    public module NFTPurchase {
            public func hash (e : NFTPurchase) : [Nat8] {
                Array.flatten<Nat8>([
                            [9:Nat8],
                            Blob_.intToBytes(e.created),
                            Blob_.nat64ToBytes(e.amount),
                            Blob_.nat64ToBytes(e.token),
                            Blob.toArray(e.buyer),
                            Blob.toArray(e.seller),
                            Blob.toArray(e.author.address),
                            Blob_.nat16ToBytes(e.author.share),
                            switch(e.marketplace) { 
                                case (?a) Array.flatten<Nat8>([ 
                                    Blob.toArray(a.address),
                                    Blob_.nat16ToBytes(a.share)
                                ]);
                                case (null) []
                            },
                            switch(e.affiliate) { 
                                case (?a) Array.flatten<Nat8>([ 
                                    Blob.toArray(a.address),
                                    Blob_.nat64ToBytes(a.amount)
                                ]);
                                case (null) []
                            }
                        ])
            };
        };

    
    public type PwrWithdraw =  {
                    created: Timestamp;
                    from: AccountIdentifier;
                    to: AccountIdentifier;
                    amount: Balance;
                };


    public type EventFungibleMint =  {
                    created: Timestamp;
                    user: AccountIdentifier;
                    amount: Balance;
                };

    public type EventFungibleTransaction =  {
                    created: Timestamp;
                    from: AccountIdentifier;
                    to: AccountIdentifier;
                    amount: Balance;
                    memo: Memo;
                };

    public type Block = {
        events: [Event]
    };


    //)




};
