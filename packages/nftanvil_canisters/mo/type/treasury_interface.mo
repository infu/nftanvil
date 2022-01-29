import Array "mo:base/Array";
import Array_ "mo:array/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import Blob_ "../lib/Blob";
import CRC32 "mo:hash/CRC32";
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
import Ledger "./ledger_interface"

module {
    public type Interface = actor {
        // Take all ICP you are owed
        withdraw        : shared WithdrawRequest       -> async WithdrawResponse;
        
        // (internal) On sale, notify treasury so it can split incoming amount
       // notify_NFTPurchase  : shared NFTPurchase -> async NFTPurchaseResponse;

        // Check your balance
        balance         : BalanceRequest        -> async BalanceResponse;
    };

    public type AccountIdentifier = Nft.AccountIdentifier;

    public type Share = Nft.Share;
    public type Balance = Nft.Balance;
    public type TokenIdentifier = Nft.TokenIdentifier;

    public type BalanceRequest = {
        user: Nft.User;
        subaccount : ?Nft.SubAccount
    };

    public type BalanceResponse = Balance;

    public type WithdrawRequest = {
        user: Nft.User;
        subaccount : ?Nft.SubAccount
    };

    public type WithdrawResponse = Result.Result<{transactionId: Blob},{
        #TransferFailed;
        #NotEnoughForTransfer;
    }>;

   

}   