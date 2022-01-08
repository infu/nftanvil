import Array "mo:base/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import SHA256 "mo:sha/SHA256";
import Hash "mo:base/Hash";
import Hex "mo:encoding/Hex";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Text "mo:base/Text";

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
        created: Time.Time;
        info: EventInfo;
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
            from: AccountIdentifier;
            to: AccountIdentifier;
            token: TokenIdentifier;
            memo: Memo;
        };

        #burn : {
            user: AccountIdentifier;
            token: TokenIdentifier;
            memo: Memo;
        };

        #use : {
            user: AccountIdentifier;
            token: TokenIdentifier;
            use: ItemUse;
            memo: Memo;
        };

        #purchase : Treasury.NFTPurchase;

        #mint : {
            // collectionId: Nft.CollectionId;
            token: TokenIdentifier;
        };

        #socket : {
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
        };

        #unsocket : {
            socket : TokenIdentifier;
            plug   : TokenIdentifier;
        };

    };

    public type EventFungibleTransaction =  {
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

    public type AddRequest = Event;
    

    public type AddResponse = Result.Result<(),{
        #NotLegitimateCaller
    }>;

    public type InfoResponse = {
        total: EventIndex;
        previous: ?Principal       
    }
}