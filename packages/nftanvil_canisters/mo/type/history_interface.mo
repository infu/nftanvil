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
        // when history canister is full, another one is created
    }; 

    public type AccountIdentifier = Nft.AccountIdentifier;
    public type Balance = Nft.Balance;
    public type Memo = Nft.Memo;
    public type ItemUse = Nft.ItemUse;
    public type TokenIdentifier = Nft.TokenIdentifier;

    public type RecordId = Blob; // consist of type, slot, idx
    // record id is created inside each canister and then sent to history
    // and returned in response.
    // Anyone can use the recordId to query history and see whats there

    // func for adding record to local block
    // func for notifying block

    public type Record = {
        id: RecordId;
        created: Time.Time;
        info: RecordInfo;
    };

    public type RecordInfo = {
        #nft : NftRecord;
        #pwr : PwrRecord;
        #anv : AnvRecord;
        #treasury : TreasuryRecord;
    };

    public type AnvRecord = {
        #transaction : RecordFungibleTransaction;
        // vote
    };

    public type PwrRecord = {
        #transaction : RecordFungibleTransaction;
    };

    public type TreasuryRecord = {
        //treasury withdraw
    };

    public type NftRecord = {
  
        #transaction : {
            from: AccountIdentifier;
            to: AccountIdentifier;
            token: TokenIdentifier;
            memo: Memo;
        };

        #burn : {
            user: AccountIdentifier;
            amount: Balance;
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

    public type RecordFungibleTransaction =  {
                    from: AccountIdentifier;
                    to: AccountIdentifier;
                    token: TokenIdentifier;
                    amount: Balance;
                    memo: Memo;
                };

    public type Block = {
        records: [Record]
    };

    public type AddRequest = {
        record: Record;
    };

    public type AddResponse = Result.Result<(),{

    }>;
}