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
import Nat32 "mo:base/Nat32";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Blob_ "../../vvv/src/Blob";
import Ext "../lib/ext.std/src/Ext";

module {
    public type AccountIdentifier = Ext.AccountIdentifier;
    public type Share = Ext.Share;
    public type Balance = Ext.Balance;

    public type BalanceRequest = {
        user: Ext.User;
        subaccount : ?Ext.SubAccount
    }

    public type BalanceResponse = Balance;

    public type WithdrawRequest = {
        user: Ext.User;
        subaccount : ?Ext.SubAccount
    };

    public type WithdrawResponse = Result<Balance,{
        #TransferFailed;
        #NotEnoughForTransfer;
    }>;

    public type NotifyTransferRequest = {
            buyerAccount; AccountIdentifier;
            blockIndex;
            amount:Nat64;

            seller : AccountIdentifier;
            
            minter : {
                address : AccountIdentifier;
                share : Share
                };

            marketplace : {
                address : AccountIdentifier;
                share : Share
                };

            purchaseAccount = AccountIdentifier; 
    };

    public type NotifyTransferResponse = Result<(),{
       
    }>;
}   