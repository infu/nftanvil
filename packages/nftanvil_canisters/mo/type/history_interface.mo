import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import Hash "mo:base/Hash";
import Nat64 "mo:base/Nat64";
import Hex "mo:encoding/Hex";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Text "mo:base/Text";
import Blob_ "../lib/Blob";
import Nft "./nft_interface";

module {

    public type Interface = actor {
        // each canister gathers info in a buffer and then sends it to the history canister
        add          : shared AddRequest        -> async AddResponse;
        list         : query ListRequest        -> async ListResponse;
        info         : query ()                 -> async InfoResponse;
        get          : query (EventIndex)       -> async ?Event;

        // when history canister is full, another one is created
    }; 

    public type AccountIdentifier = Nft.AccountIdentifier;

    public type Balance = Nft.Balance;
    public type Memo = Nft.Memo;
    public type ItemUse = Nft.ItemUse;
    public type TokenIdentifier = Nft.TokenIdentifier;
    public type Timestamp = Time.Time;

    public type EventIndex = Nft.EventIndex; //deprecated. Should be called TransactionIndex
    public module EventIndex = {
        public func equal (a:EventIndex, b:EventIndex): Bool {
            a == b
        };
        public func hash (a:EventIndex) : Hash.Hash {
            return a;
        };
    };

    public type TransactionId = Blob;



    public type Event = {
        info : EventInfo;
        hash : Blob; // accumulated by hash previous hash and current event hash
    };

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
            price: Nft.Price;
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
                        Nft.ItemUse.hash(use),
                        Blob.toArray(memo)
                    ])
                };
                case (#price({created;user;token;price})) {
                    Array.flatten<Nat8>([
                        [5:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat64ToBytes(token),
                        Nft.Price.hash(price)
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

    public type NFTPurchase = Nft.NFTPurchase;


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

    public type ListRequest = {
        from: EventIndex;
        to: EventIndex;
    };

    public type ListResponse = [?Event];

    public type AddRequest = EventInfo;
    

    public type AddResponse = TransactionId;
    
    public type InfoResponse = {
        total: EventIndex;
        previous: ?Principal       
    }
}