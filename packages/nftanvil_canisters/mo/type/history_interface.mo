import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import SHA256 "mo:sha/SHA256";
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
import Treasury "./treasury_interface";

module {

    public type Interface = actor {
        // each canister gathers info in a buffer and then sends it to the history canister
        add          : shared AddRequest        -> async AddResponse;
        list         : query ListRequest        -> async ListResponse;
        info         : query ()                 -> async InfoResponse;
        // when history canister is full, another one is created
    }; 

    public type AccountIdentifier = Nft.AccountIdentifier;
    public type TokenIdentifierBlob = Nft.TokenIdentifierBlob;

    public type Balance = Nft.Balance;
    public type Memo = Nft.Memo;
    public type ItemUse = Nft.ItemUse;
    public type TokenIdentifier = Nft.TokenIdentifier;
    public type Timestamp = Time.Time;

    public type EventIndex = Nat32;
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

    public module EventInfo = {
        public func hash( e: EventInfo) : [Nat8] {
            SHA256.sum224(
                switch(e) {
                case (#nft(x)) NftEvent.hash(x);
                case (#pwr(x)) PwrEvent.hash(x);
                case (#anv(x)) AnvEvent.hash(x);
                case (#treasury(x)) [];
            });
        }
    };

    public type EventInfo = {
        #nft : NftEvent;
        #pwr : PwrEvent;
        #anv : AnvEvent;
        #treasury : TreasuryEvent;
    };

    public type AnvEvent = {
        #transaction : EventFungibleTransaction;
        // vote
    };

    public type PwrEvent = {
        #transaction : EventFungibleTransaction;
    };

    public type TreasuryEvent = {
        //treasury withdraw
    };

    public type NftEvent = {
  
        #transaction : {
            created: Timestamp;
            from: AccountIdentifier;
            to: AccountIdentifier;
            token: TokenIdentifierBlob;
            memo: Memo;
        };

        #burn : {
            created: Timestamp;
            user: AccountIdentifier;
            token: TokenIdentifierBlob;
            memo: Memo;
        };

        #use : {
            created: Timestamp;
            user: AccountIdentifier;
            token: TokenIdentifierBlob;
            use: ItemUse;
            memo: Memo;
        };

        #purchase : Treasury.NFTPurchase;

        #mint : {
            created: Timestamp;
            token: TokenIdentifierBlob;
        };

        #socket : {
            created: Timestamp;
            socket : TokenIdentifierBlob;
            plug   : TokenIdentifierBlob;
        };

        #unsocket : {
            created: Timestamp;
            socket : TokenIdentifierBlob;
            plug   : TokenIdentifierBlob;
        };

    };

    public module AnvEvent = {
        public func hash(e : AnvEvent) : [Nat8] {
             switch (e) {
                case (#transaction({from;to;token;amount;memo})) {
                    Array.flatten<Nat8>([
                        [1:Nat8],
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob.toArray(token),
                        Blob_.nat64ToBytes(amount),
                        Blob_.nat64ToBytes(memo)
                    ])
                };
             }
        }
    };

    public module PwrEvent = {
        public func hash(e : PwrEvent) : [Nat8] {
             switch (e) {
                case (#transaction({from;to;token;amount;memo})) {
                    Array.flatten<Nat8>([
                        [2:Nat8],
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob.toArray(token),
                        Blob_.nat64ToBytes(amount),
                        Blob_.nat64ToBytes(memo)
                    ])
                };
             }
        }
    };

    public module NftEvent = {
        public func hash(e : NftEvent) : [Nat8] {
            switch (e) {
                case (#transaction({from;to;token;memo})) {
                    Array.flatten<Nat8>([
                        [3:Nat8],
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob.toArray(token),
                        Blob_.nat64ToBytes(memo)
                    ])
                };
                case (#burn({user;token;memo})) {
                    Array.flatten<Nat8>([
                        [4:Nat8],
                        Blob.toArray(user),
                        Blob.toArray(token),
                        Blob_.nat64ToBytes(memo)
                    ])
                };
                case (#use({user;token;use;memo})) { 
                    Array.flatten<Nat8>([
                        [5:Nat8],
                        Blob.toArray(user),
                        Blob.toArray(token),
                        Nft.ItemUse.hash(use),
                        Blob_.nat64ToBytes(memo)
                    ])
                };
                case (#mint({token;})) { // todo add use
                    Array.flatten<Nat8>([
                        [6:Nat8],
                        Blob.toArray(token),
                    ])
                };
                case (#socket({socket; plug})) {
                    Array.flatten<Nat8>([
                        [7:Nat8],
                        Blob.toArray(socket),
                        Blob.toArray(plug)
                    ])
                };
                case (#unsocket({socket; plug})) {
                    Array.flatten<Nat8>([
                        [8:Nat8],
                        Blob.toArray(socket),
                        Blob.toArray(plug)
                    ])
                };
                case (#purchase(a)) {
                    // 9
                    Treasury.NFTPurchase.hash(a)
                };
            
            }
               

        };

    };

    public type EventFungibleTransaction =  {
                    created: Timestamp;
                    from: AccountIdentifier;
                    to: AccountIdentifier;
                    token: TokenIdentifierBlob;
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
    

    public type AddResponse = Result.Result<(),{
        #NotLegitimateCaller
    }>;

    public type InfoResponse = {
        total: EventIndex;
        previous: ?Principal       
    }
}