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

    public type Record = {
  
        #transaction : {
            from: AccountIdentifier;
            to: AccountIdentifier;
            token: TokenIdentifier;
            amount: Balance;
            memo: Memo;
            time: Time.Time;
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