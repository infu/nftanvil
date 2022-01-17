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

    public type TransactionId = Blob;
    public module TransactionId = { 
        public func encode(historyCanisterId: Principal, idx: EventIndex) : TransactionId { 
                let raw = Array.flatten<Nat8>([
                    Blob.toArray(Principal.toBlob(historyCanisterId)),
                    Binary.BigEndian.fromNat32(idx),
                ]);
                
                Blob.fromArray(raw)
        };
    };

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

        #purchase : Treasury.NFTPurchase;

        #mint : {
            created: Timestamp;
            token: TokenIdentifier;
        };

        #approve : {
            created: Timestamp;
            token: TokenIdentifier;
            user: AccountIdentifier;
            spender: Principal;
        };

        #socket : {
            created: Timestamp;
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
            memo: Memo;
        };

        #unsocket : {
            created: Timestamp;
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
            memo: Memo;
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
                        Blob_.nat32ToBytes(token),
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
                case (#transaction({from;to;token;amount;memo})) {
                    Array.flatten<Nat8>([
                        [2:Nat8],
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat32ToBytes(token),
                        Blob_.nat64ToBytes(amount),
                        Blob.toArray(memo)
                    ])
                };
             }
        }
    };

    public module NftEvent = {
        public func hash(e : NftEvent) : [Nat8] {
            switch (e) {
                case (#transaction({created;from;to;token;memo})) {
                    Array.flatten<Nat8>([
                        [3:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(from),
                        Blob.toArray(to),
                        Blob_.nat32ToBytes(token),
                        Blob.toArray(memo)
                    ])
                };
                case (#burn({created;user;token;memo})) {
                    Array.flatten<Nat8>([
                        [4:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat32ToBytes(token),
                        Blob.toArray(memo)
                    ])
                };
                case (#use({created;user;token;use;memo})) { 
                    Array.flatten<Nat8>([
                        [5:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob_.nat32ToBytes(token),
                        Nft.ItemUse.hash(use),
                        Blob.toArray(memo)
                    ])
                };
                case (#mint({created;token;})) { // todo add use
                    Array.flatten<Nat8>([
                        [6:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat32ToBytes(token),
                    ])
                };
                case (#socket({created;socket; plug; memo})) {
                    Array.flatten<Nat8>([
                        [7:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat32ToBytes(socket),
                        Blob_.nat32ToBytes(plug),
                        Blob.toArray(memo)
                    ])
                };
                case (#unsocket({created;socket; plug; memo})) {
                    Array.flatten<Nat8>([
                        [8:Nat8],
                        Blob_.intToBytes(created),
                        Blob_.nat32ToBytes(socket),
                        Blob_.nat32ToBytes(plug),
                        Blob.toArray(memo)
                    ])
                };
                case (#purchase(a)) {
                    // 9
                    Treasury.NFTPurchase.hash(a)
                };
                case (#approve({created;spender;user;token})) {
                    Array.flatten<Nat8>([
                        [10:Nat8],
                        Blob_.intToBytes(created),
                        Blob.toArray(user),
                        Blob.toArray(Principal.toBlob(spender)),
                        Blob_.nat32ToBytes(token)
                    ])
                };
            
            }
                
        };

    };

    public type EventFungibleTransaction =  {
                    created: Timestamp;
                    from: AccountIdentifier;
                    to: AccountIdentifier;
                    token: TokenIdentifier;
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