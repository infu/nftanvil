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

    // moved to nft_interface
    public type Timestamp = Nft.Timestamp;
    public type EventIndex = Nft.EventIndex;

    public type TransactionId = Nft.TransactionId;
    public type NFTPurchase = Nft.NFTPurchase;
    public type Block = Nft.Block;
    public type EventFungibleTransaction = Nft.EventFungibleTransaction;
    public type EventFungibleMint = Nft.EventFungibleMint;
    public type PwrWithdraw = Nft.PwrWithdraw;
    public type NftEvent = Nft.NftEvent;
    public type PwrEvent = Nft.PwrEvent;
    public type AnvEvent = Nft.AnvEvent;
    public type EventInfo = Nft.EventInfo;
    public type Transaction = Nft.Transaction;
    public type Event = Nft.Event;
    //

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